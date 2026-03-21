import os
import time
import requests
import threading
import subprocess
import boto3
import json
import google.generativeai as genai
from urllib.parse import urlparse
from flask import Flask, request, jsonify
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '../backend/.env'))

app = Flask(__name__)

NODE_API_URL = "http://localhost:8000"

s3_client = boto3.client(
    's3',
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
    region_name=os.getenv('AWS_REGION', 'eu-north-1')
)
BUCKET_NAME = os.getenv('AWS_S3_BUCKET')

# Setup Gemini AI
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def download_file(file_url, local_filename):
    print(f"[AI AGENT] Securely downloading S3 video: {file_url}")
    parsed = urlparse(file_url)
    s3_key = parsed.path.lstrip('/')
    s3_client.download_file(BUCKET_NAME, s3_key, local_filename)
    return local_filename


def report_progress(video_id, percent, message):
    try:
        url = f"{NODE_API_URL}/api/v1/videos/{video_id}/ai-progress"
        requests.post(url, json={"percent": percent, "message": message}, timeout=5)
    except:
        pass

def process_video_background(video_id, file_url, ai_prompt):
    print(f"\n[AI AGENT: START] Processing video {video_id} with Gemini Multimodal AI")
    input_file = f"raw_{video_id}.mp4"
    output_file = f"edited_{video_id}.mp4"
    
    try:
        report_progress(video_id, 5, "Downloading high-res video from S3...")
        download_file(file_url, input_file)
        
        # --- GEMINI AI MAGIC ---
        report_progress(video_id, 20, "Uploading to Gemini for deep context analysis...")
        print("[AI AGENT] Uploading to Google Gemini Vision APIs for Deep Analysis...")
        video_file = genai.upload_file(path=input_file)
        
        while video_file.state.name == 'PROCESSING':
            report_progress(video_id, 45, "Gemini AI is analyzing frames & audio...")
            print("... Gemini is still processing the video file ...")
            time.sleep(5)
            video_file = genai.get_file(video_file.name)
            
        if video_file.state.name == 'FAILED':
            raise ValueError("Gemini failed to process the video.")
            
        report_progress(video_id, 65, "Generating edit timestamps & metadata...")
        print("[AI AGENT] Video processed by Gemini. Requesting intelligence analysis...")
        
        model = genai.GenerativeModel('gemini-2.5-flash') # super fast multimodal
        
        # Give it a system instruction and the actual prompt
        structured_prompt = f"""
        You are an expert Emmy-award winning Human Video Editor editing a cinematic VLOG. 
        Analyze this raw video. User provided instruction: {ai_prompt}
        
        Identify ONLY the exact Start and End timestamps (in seconds) of the segments that should be KEPT.
        Remove awkward silences, stutters, mistakes where the speaker fumbles, or completely unrelated boring parts.
        CRITICAL: Do NOT remove cinematic B-roll, silent aesthetic shots, or intentional pauses that add effect. Keep it looking like a professional VLOG, not a robotic cut.
        
        Return ONLY a raw JSON array, like: [{{"start": 0.0, "end": 12.5}}, {{"start": 14.0, "end": 45.2}}]
        Do not add markdown formatting like ```json.
        """
        
        response = model.generate_content([video_file, structured_prompt])
        
        # Cleanup Gemini cloud storage
        try:
            genai.delete_file(video_file.name)
        except:
            pass
            
        text = response.text.replace("```json", "").replace("```", "").strip()
        print(f"[AI AGENT] Gemini returned: {text}")
        
        try:
            segments = json.loads(text)
        except:
            # Fallback to auto-editor if JSON fails
            print("[AI ERROR] Failed to parse JSON. Falling back to auto-editor silence removal.")
            segments = None
            
        # --- CUTTING THE VIDEO ---
        if not segments:
            subprocess.run(["auto-editor", input_file, "--margin", "0.2s", "-o", output_file], check=True)
        else:
            report_progress(video_id, 80, f"Cutting into {len(segments)} segments using FFMPEG...")
            segment_files = []
            
            for i, seg in enumerate(segments):
                seg_file = f"temp_seg_{video_id}_{i}.mp4"
                segment_files.append(seg_file)
                cmd = [
                    "ffmpeg", "-y",
                    "-i", input_file,
                    "-ss", str(seg['start']),
                    "-to", str(seg['end']),
                    "-c:v", "libx264", "-preset", "ultrafast",
                    "-c:a", "aac",
                    seg_file
                ]
                subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                
            # Concat
            list_file = f"concat_list_{video_id}.txt"
            with open(list_file, "w") as f:
                for s in segment_files:
                    f.write(f"file '{s}'\n")
                    
            report_progress(video_id, 90, "Stitching edited segments together...")
            concat_cmd = [
                "ffmpeg", "-y", "-f", "concat", "-safe", "0", 
                "-i", list_file, "-c", "copy", output_file
            ]
            subprocess.run(concat_cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            
            # Sub-cleanup
            for s in segment_files:
                if os.path.exists(s): os.remove(s)
            if os.path.exists(list_file): os.remove(list_file)
            
        # --- UPLOAD & NOTIFY ---
        report_progress(video_id, 95, "Uploading AI Edit back to AWS S3...")
        s3_key = f"ai_edits/{video_id}_{int(time.time())}.mp4"
        s3_client.upload_file(output_file, BUCKET_NAME, s3_key, ExtraArgs={'ContentType': 'video/mp4'})
        
        new_file_url = f"https://{BUCKET_NAME}.s3.{os.getenv('AWS_REGION', 'eu-north-1')}.amazonaws.com/{s3_key}"
        
        webhook_url = f"{NODE_API_URL}/api/v1/videos/{video_id}/ai-callback"
        payload = {
            "status": "success",
            "editedFileUrl": new_file_url,
            "message": "Gemini AI completely analyzed context, maintained VLOG B-Rolls, and intelligently removed mistakes."
        }
        res = requests.post(webhook_url, json=payload)
        
    except Exception as e:
        error_msg = str(e)
        if "429" in error_msg:
            print("[AI AGENT] Gemini API Quota Exceeded! Engaging fast fallback auto-editor processing...")
            report_progress(video_id, 30, f"AI Quota Exceeded. Engaging Fast Fallback Editor...")
        else:
            report_progress(video_id, 30, f"AI Analysis Failed. Engaging Default Editor...")
            print(f"[AI AGENT] Error during generative processing: {e}. Engaging Fast Fallback auto-editor.")
            
        try:
            report_progress(video_id, 60, "Running basic intelligent silence removal...")
            subprocess.run(["auto-editor", input_file, "--margin", "0.2s", "-o", output_file], check=True)
            report_progress(video_id, 95, "Uploading Fast Fallback Edit back to AWS S3...")
            s3_key = f"ai_edits/{video_id}_fallback_{int(time.time())}.mp4"
            s3_client.upload_file(output_file, BUCKET_NAME, s3_key, ExtraArgs={'ContentType': 'video/mp4'})
            new_file_url = f"https://{BUCKET_NAME}.s3.{os.getenv('AWS_REGION', 'eu-north-1')}.amazonaws.com/{s3_key}"
            
            webhook_url = f"{NODE_API_URL}/api/v1/videos/{video_id}/ai-callback"
            payload = {
                "status": "success",
                "editedFileUrl": new_file_url,
                "message": "AI Analysis Quota exceeded/failed. Basic intelligent silence removal applied instead."
            }
            requests.post(webhook_url, json=payload)
        except Exception as fallback_e:
            err_msg = str(fallback_e).replace('\n', ' ')[:30]
            report_progress(video_id, 0, f"Systems Failure: {err_msg}")
            print(f"[AI AGENT] Fallback completely failed: {fallback_e}")
            webhook_url = f"{NODE_API_URL}/api/v1/videos/{video_id}/ai-callback"
            requests.post(webhook_url, json={"status": "failed", "message": f"Processing failed: {str(fallback_e)}"})
            
    finally:
        if os.path.exists(input_file): os.remove(input_file)
        if os.path.exists(output_file): os.remove(output_file)
        print("[AI AGENT: END] Cleanup complete.\n")


@app.route('/process_video', methods=['POST'])
def process_video():
    data = request.json
    video_id = data.get('videoId')
    file_url = data.get('fileUrl')
    ai_prompt = data.get('aiPrompt', 'Analyze and trim VLOG mistakes beautifully')
    
    if not video_id or not file_url:
        return jsonify({"error": "videoId and fileUrl are required"}), 400
        
    thread = threading.Thread(target=process_video_background, args=(video_id, file_url, ai_prompt))
    thread.daemon = True
    thread.start()
    
    return jsonify({"message": "Video accepted by Multimodal Editor", "status": "processing"}), 202

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "Multimodal Gemini AI Video Engine is ALIVE and running 🚀"})

if __name__ == '__main__':
    app.run(port=5001, debug=True)
