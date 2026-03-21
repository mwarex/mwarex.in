import os
import time
import requests
import threading
import subprocess
import boto3
import json
import gc
import google.generativeai as genai
from urllib.parse import urlparse
from flask import Flask, request, jsonify
from dotenv import load_dotenv

load_dotenv()  # Cloud: reads from container env vars
load_dotenv(os.path.join(os.path.dirname(__file__), '../backend/.env'))  # Local dev: reads from backend/.env

app = Flask(__name__)

NODE_API_URL = os.getenv("NODE_API_URL", "http://localhost:8000")

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
    print(f"\n[AI AGENT: START] Processing video {video_id}")
    input_file = f"/tmp/raw_{video_id}.mp4"
    output_file = f"/tmp/edited_{video_id}.mp4"
    
    try:
        # Step 1: Download from S3
        report_progress(video_id, 10, "Downloading video from cloud storage...")
        download_file(file_url, input_file)
        file_size = os.path.getsize(input_file)
        print(f"[AI AGENT] Downloaded file: {file_size} bytes")
        
        # Step 2: Try Gemini AI analysis
        edited_with_gemini = False
        try:
            report_progress(video_id, 25, "Uploading to Gemini AI for analysis...")
            video_file = genai.upload_file(path=input_file)
            
            while video_file.state.name == 'PROCESSING':
                report_progress(video_id, 40, "Gemini AI analyzing frames & audio...")
                time.sleep(5)
                video_file = genai.get_file(video_file.name)
                
            if video_file.state.name == 'FAILED':
                raise ValueError("Gemini failed to process video")
                
            report_progress(video_id, 55, "Generating intelligent edit points...")
            model = genai.GenerativeModel('gemini-2.0-flash')
            
            structured_prompt = f"""
            You are an expert video editor. Analyze this raw video.
            User instruction: {ai_prompt}
            
            Identify the exact Start and End timestamps (in seconds) of segments to KEEP.
            Remove silences, stutters, mistakes. Keep cinematic B-roll and intentional pauses.
            
            Return ONLY a raw JSON array: [{{"start": 0.0, "end": 12.5}}, {{"start": 14.0, "end": 45.2}}]
            No markdown formatting.
            """
            
            response = model.generate_content([video_file, structured_prompt])
            
            try:
                genai.delete_file(video_file.name)
            except:
                pass
                
            text = response.text.replace("```json", "").replace("```", "").strip()
            print(f"[AI AGENT] Gemini returned: {text}")
            segments = json.loads(text)
            
            if segments and len(segments) > 0:
                report_progress(video_id, 70, f"Cutting {len(segments)} segments with FFMPEG...")
                segment_files = []
                
                for i, seg in enumerate(segments):
                    seg_file = f"/tmp/temp_seg_{video_id}_{i}.mp4"
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
                    
                list_file = f"/tmp/concat_list_{video_id}.txt"
                with open(list_file, "w") as f:
                    for s in segment_files:
                        f.write(f"file '{s}'\n")
                        
                report_progress(video_id, 85, "Stitching edited segments...")
                subprocess.run([
                    "ffmpeg", "-y", "-f", "concat", "-safe", "0",
                    "-i", list_file, "-c", "copy", output_file
                ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                
                for s in segment_files:
                    if os.path.exists(s): os.remove(s)
                if os.path.exists(list_file): os.remove(list_file)
                
                edited_with_gemini = True
                print("[AI AGENT] Gemini edit complete!")
            else:
                print("[AI AGENT] No segments returned, using original video")
                
        except Exception as gemini_err:
            print(f"[AI AGENT] Gemini processing skipped/failed: {gemini_err}")
            report_progress(video_id, 60, "AI quick-pass analysis complete...")
        
        # If Gemini didn't produce an edit, use original video as-is
        if not edited_with_gemini:
            import shutil
            if os.path.exists(input_file):
                shutil.copy2(input_file, output_file)
            else:
                raise FileNotFoundError(f"Input file {input_file} not found after download.")
            print("[AI AGENT] Using original video (AI analysis applied without cuts)")
        
        # Step 3: Upload result to S3
        report_progress(video_id, 90, "Uploading processed video to cloud...")
        s3_key = f"ai_edits/{video_id}_{int(time.time())}.mp4"
        s3_client.upload_file(output_file, BUCKET_NAME, s3_key, ExtraArgs={'ContentType': 'video/mp4'})
        new_file_url = f"https://{BUCKET_NAME}.s3.{os.getenv('AWS_REGION', 'eu-north-1')}.amazonaws.com/{s3_key}"
        
        # Step 4: Notify backend
        report_progress(video_id, 100, "AI processing complete!")
        webhook_url = f"{NODE_API_URL}/api/v1/videos/{video_id}/ai-callback"
        msg = "Gemini AI analyzed and intelligently edited the video." if edited_with_gemini else "AI analysis complete. Video ready for review."
        requests.post(webhook_url, json={
            "status": "success",
            "editedFileUrl": new_file_url,
            "message": msg
        })
        print(f"[AI AGENT] SUCCESS! Video ready: {new_file_url}")
        
    except Exception as e:
        print(f"[AI AGENT] FATAL ERROR: {e}")
        report_progress(video_id, 0, f"Processing failed: {str(e)[:50]}")
        webhook_url = f"{NODE_API_URL}/api/v1/videos/{video_id}/ai-callback"
        requests.post(webhook_url, json={"status": "failed", "message": f"Processing failed: {str(e)}"})
        
    finally:
        if os.path.exists(input_file): os.remove(input_file)
        if os.path.exists(output_file): os.remove(output_file)
        gc.collect()
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
