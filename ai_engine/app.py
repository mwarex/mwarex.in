"""
MWareX AI Video Engine — Production Pipeline
=============================================
Real AI-powered video editing:
  1. Groq Whisper → word-level transcription
  2. Silence detection from timestamp gaps
  3. Groq Llama 3.3 70B → intelligent cut/B-roll analysis
  4. FFmpeg → segment cutting, stitching, caption burn-in, 9:16 crop
  5. Pexels API → free B-roll stock footage
  6. S3 upload → final delivery
"""

import os
import re
import time
import math
import json
import gc
import shutil
import subprocess
import threading
import traceback
from urllib.parse import urlparse
import requests
import boto3
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from groq import Groq
import yt_dlp
from local_pipeline import build_graph

# ─────────────────────────────────────────────────────────────
# Config
# ─────────────────────────────────────────────────────────────
load_dotenv()
local_env = os.path.join(os.path.dirname(__file__), "../backend/.env")
if os.path.exists(local_env):
    load_dotenv(local_env)

app = Flask(__name__)
CORS(app)

NODE_API_URL = os.getenv("NODE_API_URL", "http://localhost:8000")
PEXELS_API_KEY = os.getenv("PEXELS_API_KEY", "")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
AI_WEBHOOK_SECRET = os.getenv("AI_WEBHOOK_SECRET", "")

s3_client = boto3.client(
    "s3",
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    region_name=os.getenv("AWS_REGION", "us-east-1"),
)
BUCKET_NAME = os.getenv("AWS_S3_BUCKET")


groq_client = None
if GROQ_API_KEY:
    groq_client = Groq(api_key=GROQ_API_KEY)
    print("[AI ENGINE] Groq client initialized (Whisper + Llama ready)")
else:
    print("[AI ENGINE WARNING] GROQ_API_KEY missing!")


try:
    import google.generativeai as genai
    if GEMINI_API_KEY:
        genai.configure(api_key=GEMINI_API_KEY)
        print("[AI ENGINE] Gemini AI configured as fallback")
except Exception as e:
    print(f"[AI ENGINE] Gemini not available: {e}")
    genai = None

TMP_DIR = os.getenv("TMP_DIR", "/tmp/mwarex")
os.makedirs(TMP_DIR, exist_ok=True)

def download_from_s3(file_url, local_path):
    """Download a file from any public URL or S3 using the bucket key."""
    print(f"[DOWNLOAD] Fetching → {local_path}")
    
    try:
        # First try direct HTTP download (works for Cloudinary, public S3, YouTube links, etc.)
        r = requests.get(file_url, stream=True, timeout=30)
        r.raise_for_status()
        with open(local_path, "wb") as f:
            for chunk in r.iter_content(chunk_size=8192):
                if chunk: f.write(chunk)
        print(f"[DOWNLOAD] Done via HTTP: {os.path.getsize(local_path)} bytes")
        return local_path
    except Exception as e:
        print(f"[DOWNLOAD] HTTP fetch failed, trying direct S3... {e}")
        
        # Fallback to S3 direct if it's a private bucket file
        parsed = urlparse(file_url)
        s3_key = parsed.path.lstrip("/")
        if BUCKET_NAME and BUCKET_NAME in parsed.netloc:
            if s3_key.startswith(BUCKET_NAME + "/"):
                s3_key = s3_key[len(BUCKET_NAME)+1:]
                
        s3_client.download_file(BUCKET_NAME, s3_key, local_path)
        print(f"[DOWNLOAD] Done via S3: {os.path.getsize(local_path)} bytes")
        return local_path


def upload_to_s3(local_path, s3_key, content_type="video/mp4"):
    """Upload a file to S3 and return the public URL."""
    print(f"[UPLOAD] {local_path} → s3://{BUCKET_NAME}/{s3_key}")
    s3_client.upload_file(
        local_path,
        BUCKET_NAME,
        s3_key,
        ExtraArgs={"ContentType": content_type},
    )
    url = s3_client.generate_presigned_url(
        'get_object',
        Params={'Bucket': BUCKET_NAME, 'Key': s3_key},
        ExpiresIn=604800  # 7 days
    )
    print(f"[UPLOAD] Done: {url[:60]}...")
    return url


def report_progress(video_id, percent, message):
    """Send real-time progress to the Node.js backend."""
    if not video_id:
        return
    try:
        url = f"{NODE_API_URL}/api/v1/videos/{video_id}/ai-progress"
        headers = {"x-ai-secret": AI_WEBHOOK_SECRET}
        requests.post(url, json={"percent": percent, "message": message}, headers=headers, timeout=5)
    except Exception:
        pass


def get_video_duration(filepath):
    """Get video duration in seconds using ffprobe."""
    try:
        result = subprocess.run(
            [
                "ffprobe", "-v", "error",
                "-show_entries", "format=duration",
                "-of", "default=noprint_wrappers=1:nokey=1",
                filepath
            ],
            capture_output=True, text=True
        )
        return float(result.stdout.strip())
    except Exception:
        return 0.0


def cleanup_files(*paths):
    """Safely remove temp files."""
    for p in paths:
        try:
            if p and os.path.exists(p):
                os.remove(p)
        except Exception:
            pass


# ─────────────────────────────────────────────────────────────
# Step 1: Extract Audio
# ─────────────────────────────────────────────────────────────

def extract_audio(video_path, audio_path):
    """Extract audio as 16-bit PCM WAV for Whisper."""
    print("[STEP 1] Extracting audio...")
    cmd = [
        "ffmpeg", "-y",
        "-i", video_path,
        "-vn",                       # no video
        "-acodec", "pcm_s16le",      # 16-bit PCM
        "-ar", "16000",              # 16kHz (Whisper optimal)
        "-ac", "1",                  # mono
        audio_path
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        error_msg = result.stderr[-500:] if result.stderr else "Unknown error"
        raise RuntimeError(f"FFmpeg audio extraction failed: {error_msg}")
    
    file_size = os.path.getsize(audio_path)
    print(f"[STEP 1] Audio extracted: {file_size} bytes")
    return audio_path


# ─────────────────────────────────────────────────────────────
# Step 2: Transcribe with Groq Whisper
# ─────────────────────────────────────────────────────────────

def transcribe_audio(audio_path):
    """
    Transcribe audio using Groq Whisper API.
    Returns full transcript text and word-level timestamps.
    
    Groq Whisper free tier: 2000 requests/day, 228x real-time speed.
    Supports files up to 25MB. For larger files, we chunk them.
    """
    print("[STEP 2] Transcribing with Groq Whisper...")
    
    if not groq_client:
        raise RuntimeError("Groq client not initialized — GROQ_API_KEY missing")
    
    file_size = os.path.getsize(audio_path)
    max_size = 24 * 1024 * 1024  # 24MB safety margin
    
    if file_size <= max_size:
        # Single request
        return _whisper_single(audio_path)
    else:
        # Chunk the audio into segments
        return _whisper_chunked(audio_path, max_size)


def _whisper_single(audio_path):
    """Transcribe a single audio file with Groq Whisper."""
    with open(audio_path, "rb") as f:
        response = groq_client.audio.transcriptions.create(
            file=("audio.wav", f),
            model="whisper-large-v3",
            response_format="verbose_json",
            timestamp_granularities=["word", "segment"],
            language="en",
        )
    
    # Extract words with timestamps
    words = []
    if hasattr(response, "words") and response.words:
        for w in response.words:
            word_dict = w if isinstance(w, dict) else w.__dict__ if hasattr(w, '__dict__') else w.model_dump() if hasattr(w, 'model_dump') else w
            words.append({
                "word": word_dict.get("word", "").strip() if isinstance(word_dict, dict) else getattr(w, "word", "").strip(),
                "start": round(word_dict.get("start", 0) if isinstance(word_dict, dict) else getattr(w, "start", 0), 3),
                "end": round(word_dict.get("end", 0) if isinstance(word_dict, dict) else getattr(w, "end", 0), 3),
            })
    
    # Extract segments
    segments = []
    if hasattr(response, "segments") and response.segments:
        for seg in response.segments:
            seg_dict = seg if isinstance(seg, dict) else seg.__dict__ if hasattr(seg, '__dict__') else seg.model_dump() if hasattr(seg, 'model_dump') else seg
            segments.append({
                "text": seg_dict.get("text", "").strip() if isinstance(seg_dict, dict) else getattr(seg, "text", "").strip(),
                "start": round(seg_dict.get("start", 0) if isinstance(seg_dict, dict) else getattr(seg, "start", 0), 3),
                "end": round(seg_dict.get("end", 0) if isinstance(seg_dict, dict) else getattr(seg, "end", 0), 3),
            })
    
    full_text = response.text if hasattr(response, "text") else ""
    print(f"[STEP 2] Transcribed: {len(words)} words, {len(segments)} segments")
    return {"text": full_text, "words": words, "segments": segments}


def _whisper_chunked(audio_path, max_size):
    """Split large audio into chunks, transcribe each, merge results."""
    duration = get_video_duration(audio_path)
    # Estimate chunk duration: proportion of file size  
    chunk_duration = int((max_size / os.path.getsize(audio_path)) * duration * 0.9)
    chunk_duration = max(chunk_duration, 60)  # at least 60 seconds
    
    all_words = []
    all_segments = []
    all_text = []
    offset = 0.0
    chunk_idx = 0
    
    while offset < duration:
        chunk_path = os.path.join(TMP_DIR, f"chunk_{chunk_idx}.wav")
        end_time = min(offset + chunk_duration, duration)
        
        cmd = [
            "ffmpeg", "-y",
            "-i", audio_path,
            "-ss", str(offset),
            "-to", str(end_time),
            "-acodec", "pcm_s16le", "-ar", "16000", "-ac", "1",
            chunk_path
        ]
        subprocess.run(cmd, capture_output=True, text=True)
        
        try:
            result = _whisper_single(chunk_path)
            
            # Offset timestamps
            for w in result["words"]:
                w["start"] += offset
                w["end"] += offset
                all_words.append(w)
            
            for s in result["segments"]:
                s["start"] += offset
                s["end"] += offset
                all_segments.append(s)
            
            all_text.append(result["text"])
        except Exception as e:
            print(f"[STEP 2] Chunk {chunk_idx} failed: {e}")
        finally:
            cleanup_files(chunk_path)
        
        offset = end_time
        chunk_idx += 1
    
    print(f"[STEP 2] Chunked transcription: {len(all_words)} total words")
    return {"text": " ".join(all_text), "words": all_words, "segments": all_segments}


# ─────────────────────────────────────────────────────────────
# Step 3: Detect Silences from Timestamps
# ─────────────────────────────────────────────────────────────

def detect_silences(words, min_silence=1.5):
    """
    Detect silence gaps from Whisper word timestamps.
    A gap > min_silence seconds between consecutive words = silence.
    Returns list of {"start": ..., "end": ...} silence regions.
    """
    print("[STEP 3] Detecting silences from word timestamps...")
    silences = []
    
    if not words or len(words) < 2:
        return silences
    
    for i in range(1, len(words)):
        gap = words[i]["start"] - words[i - 1]["end"]
        if gap >= min_silence:
            silences.append({
                "start": round(words[i - 1]["end"], 3),
                "end": round(words[i]["start"], 3),
                "duration": round(gap, 3),
            })
    
    print(f"[STEP 3] Found {len(silences)} silence regions (>{min_silence}s)")
    return silences


# ─────────────────────────────────────────────────────────────
# Step 4: LLM Analysis (Groq Llama 3.3 70B)
# ─────────────────────────────────────────────────────────────

def llm_analyze_transcript(transcript_text, segments, silences, ai_prompt, video_duration):
    """
    Use Groq Llama 3.3 70B to analyze the transcript and decide:
    - Which segments to CUT (fillers, bad takes, stutters)
    - Where to insert B-roll
    - Best clips for short-form content
    
    Returns structured JSON with keep_segments, broll_moments, clip_suggestions.
    """
    print("[STEP 4] Analyzing with Groq Llama 3.3 70B...")
    
    if not groq_client:
        # Fallback: keep everything, no cuts
        return {"keep_segments": [{"start": 0, "end": video_duration}], "broll_moments": [], "clip_suggestions": []}
    
    # Build context
    silence_summary = ""
    if silences:
        silence_summary = f"\nDetected {len(silences)} silence gaps: " + ", ".join(
            [f"{s['start']:.1f}s-{s['end']:.1f}s ({s['duration']:.1f}s)" for s in silences[:20]]
        )
    
    segment_text = ""
    if segments:
        segment_text = "\n".join([f"[{s['start']:.1f}s - {s['end']:.1f}s] {s['text']}" for s in segments])
    
    prompt = f"""You are an expert AI video editor. Analyze this video transcript and produce precise editing instructions.

VIDEO DURATION: {video_duration:.1f} seconds
USER INSTRUCTIONS: {ai_prompt}
{silence_summary}

TIMESTAMPED TRANSCRIPT:
{segment_text[:8000]}

TASK: Return a JSON object with these keys:

1. "keep_segments" — array of {{"start": float, "end": float}} timestamps of segments to KEEP in the final video.
   Rules:
   - Remove all silence gaps longer than 1.5 seconds
   - Remove filler words clusters ("um", "uh", "like", "you know", "basically", "actually", "so yeah")
   - Remove obvious stutters and restarts
   - KEEP all meaningful speech, intentional pauses (under 1s), and natural transitions
   - Segments should NOT overlap
   - Cover the full video — don't skip large meaningful sections

2. "broll_moments" — array of {{"timestamp": float, "duration": float, "search_query": string}}
   - Identify 2-4 moments where B-roll footage would enhance the video
   - search_query should be a 2-3 word Pexels search term (e.g. "city skyline", "typing keyboard")
   - Only suggest B-roll during topic transitions or visual variety moments

3. "clip_suggestions" — array of {{"title": string, "start": float, "end": float, "score": int, "hashtags": string}}
   - Identify 3-5 best standalone clips (30-90 seconds) for Reels/Shorts
   - score is 1-100 based on engagement potential
   - hashtags are relevant social media tags

Return ONLY the raw JSON object. No markdown, no explanations."""

    try:
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a precise JSON-outputting video editing AI. Output ONLY valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=4096,
        )
        
        text = response.choices[0].message.content.strip()
        # Clean any markdown wrapping
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)
        
        result = json.loads(text)
        
        # Validate
        if "keep_segments" not in result:
            result["keep_segments"] = [{"start": 0, "end": video_duration}]
        if "broll_moments" not in result:
            result["broll_moments"] = []
        if "clip_suggestions" not in result:
            result["clip_suggestions"] = []
        
        print(f"[STEP 4] LLM: {len(result['keep_segments'])} keep segs, {len(result['broll_moments'])} B-roll, {len(result['clip_suggestions'])} clips")
        return result
        
    except Exception as e:
        print(f"[STEP 4] LLM analysis failed: {e}")
        # Fallback: use silence-based cutting only
        return _fallback_analysis(silences, video_duration)


def _fallback_analysis(silences, video_duration):
    """Fallback: just cut out silences, no B-roll."""
    keep_segments = []
    prev_end = 0.0
    
    for s in silences:
        if s["start"] > prev_end:
            keep_segments.append({"start": prev_end, "end": s["start"]})
        prev_end = s["end"]
    
    if prev_end < video_duration:
        keep_segments.append({"start": prev_end, "end": video_duration})
    
    if not keep_segments:
        keep_segments = [{"start": 0, "end": video_duration}]
    
    return {"keep_segments": keep_segments, "broll_moments": [], "clip_suggestions": []}


# ─────────────────────────────────────────────────────────────
# Step 5: FFmpeg Cutting & Stitching
# ─────────────────────────────────────────────────────────────

def cut_and_stitch(input_path, keep_segments, output_path, video_id):
    """
    Use FFmpeg to cut out bad segments and stitch the keepers.
    Uses the concat demuxer for gapless output.
    """
    print(f"[STEP 5] Cutting {len(keep_segments)} segments...")
    report_progress(video_id, 60, f"Cutting {len(keep_segments)} segments with FFmpeg...")
    
    if not keep_segments:
        shutil.copy2(input_path, output_path)
        return output_path
    
    segment_files = []
    
    for i, seg in enumerate(keep_segments):
        seg_file = os.path.join(TMP_DIR, f"seg_{video_id}_{i}.mp4")
        segment_files.append(seg_file)
        
        cmd = [
            "ffmpeg", "-y",
            "-i", input_path,
            "-ss", str(seg["start"]),
            "-to", str(seg["end"]),
            "-c:v", "libx264", "-preset", "fast", "-crf", "23",
            "-c:a", "aac", "-b:a", "128k",
            "-avoid_negative_ts", "make_zero",
            "-movflags", "+faststart",
            seg_file
        ]
        subprocess.run(cmd, capture_output=True, text=True)
    
    # Filter out empty or missing files
    valid_files = [f for f in segment_files if os.path.exists(f) and os.path.getsize(f) > 1000]
    
    if len(valid_files) == 0:
        shutil.copy2(input_path, output_path)
        return output_path
    
    if len(valid_files) == 1:
        shutil.copy2(valid_files[0], output_path)
    else:
        # Concat demuxer
        list_file = os.path.join(TMP_DIR, f"concat_{video_id}.txt")
        with open(list_file, "w") as f:
            for sf in valid_files:
                f.write(f"file '{sf}'\n")
        
        cmd = [
            "ffmpeg", "-y",
            "-f", "concat", "-safe", "0",
            "-i", list_file,
            "-c:v", "libx264", "-preset", "fast", "-crf", "23",
            "-c:a", "aac", "-b:a", "128k",
            "-movflags", "+faststart",
            output_path
        ]
        subprocess.run(cmd, capture_output=True, text=True)
        cleanup_files(list_file)
    
    # Cleanup segment files
    for f in segment_files:
        cleanup_files(f)
    
    if os.path.exists(output_path):
        print(f"[STEP 5] Stitched: {os.path.getsize(output_path)} bytes")
    else:
        raise RuntimeError("FFmpeg stitching failed — output file missing")
    
    return output_path


# ─────────────────────────────────────────────────────────────
# Step 6: Generate Captions (.ass subtitle file)
# ─────────────────────────────────────────────────────────────

def generate_captions_ass(words, keep_segments, output_ass_path):
    """
    Generate .ass subtitle file from Whisper word timestamps.
    Uses a bold, viral TikTok/Reels-style karaoke caption format.
    
    Words are grouped into 3-5 word phrases and time-synced.
    """
    print("[STEP 6] Generating .ass captions...")
    
    if not words:
        print("[STEP 6] No words to caption, skipping")
        return None
    
    # Remap word timestamps to the edited video timeline
    remapped_words = _remap_words_to_edit(words, keep_segments)
    
    if not remapped_words:
        print("[STEP 6] No words after remapping, skipping")
        return None
    
    # Group words into subtitle phrases (3-5 words each)
    phrases = []
    current_phrase = []
    
    for w in remapped_words:
        current_phrase.append(w)
        # Break on: punctuation, 5+ words, or >2s duration
        if (len(current_phrase) >= 4 or
            w["word"].endswith((".", "!", "?", ",")) or
            (current_phrase[-1]["end"] - current_phrase[0]["start"]) > 2.0):
            phrases.append(current_phrase)
            current_phrase = []
    
    if current_phrase:
        phrases.append(current_phrase)
    
    # Write .ass file
    ass_content = _build_ass_header()
    
    for phrase in phrases:
        start_ts = _seconds_to_ass(phrase[0]["start"])
        end_ts = _seconds_to_ass(phrase[-1]["end"])
        text = " ".join([w["word"] for w in phrase])
        # Escape special ASS characters
        text = text.replace("\\", "\\\\").replace("{", "\\{").replace("}", "\\}")
        ass_content += f"Dialogue: 0,{start_ts},{end_ts},Default,,0,0,0,,{text}\n"
    
    with open(output_ass_path, "w", encoding="utf-8") as f:
        f.write(ass_content)
    
    print(f"[STEP 6] Generated {len(phrases)} caption phrases → {output_ass_path}")
    return output_ass_path


def _remap_words_to_edit(words, keep_segments):
    """Remap word timestamps from the original video to the edited timeline."""
    if not keep_segments:
        return words
    
    remapped = []
    cumulative_offset = 0.0
    
    for seg in keep_segments:
        seg_start, seg_end = seg["start"], seg["end"]
        
        for w in words:
            if w["start"] >= seg_start and w["end"] <= seg_end:
                remapped.append({
                    "word": w["word"],
                    "start": round(w["start"] - seg_start + cumulative_offset, 3),
                    "end": round(w["end"] - seg_start + cumulative_offset, 3),
                })
        
        cumulative_offset += (seg_end - seg_start)
    
    return remapped


def _build_ass_header():
    """Build a viral TikTok/Reels-style .ass subtitle header."""
    return """[Script Info]
Title: MWareX AI Captions
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080
WrapStyle: 0

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial Black,72,&H00FFFFFF,&H000000FF,&H00000000,&H80000000,-1,0,0,0,100,100,0,0,1,4,2,2,40,40,60,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""


def _seconds_to_ass(seconds):
    """Convert seconds to ASS timestamp format (H:MM:SS.cc)."""
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = int(seconds % 60)
    cs = int((seconds % 1) * 100)
    return f"{h}:{m:02d}:{s:02d}.{cs:02d}"


# ─────────────────────────────────────────────────────────────
# Step 7: Burn Captions into Video
# ─────────────────────────────────────────────────────────────

def burn_captions(input_video, ass_path, output_path):
    """Burn .ass subtitles directly into the video using FFmpeg."""
    print("[STEP 7] Burning captions into video...")
    
    if not ass_path or not os.path.exists(ass_path):
        shutil.copy2(input_video, output_path)
        return output_path
    
    # Escape special characters in path for FFmpeg filter
    safe_ass = ass_path.replace("\\", "/").replace(":", "\\\\:").replace("'", "\\'")
    
    cmd = [
        "ffmpeg", "-y",
        "-i", input_video,
        "-vf", f"ass='{safe_ass}'",
        "-c:v", "libx264", "-preset", "fast", "-crf", "23",
        "-c:a", "copy",
        "-movflags", "+faststart",
        output_path
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    
    if result.returncode != 0 or not os.path.exists(output_path):
        print(f"[STEP 7] Caption burn failed, using uncaptioned: {result.stderr[:200]}")
        shutil.copy2(input_video, output_path)
    else:
        print(f"[STEP 7] Captions burned: {os.path.getsize(output_path)} bytes")
    
    return output_path


# ─────────────────────────────────────────────────────────────
# Step 8: 9:16 Auto-Crop for Reels/Shorts
# ─────────────────────────────────────────────────────────────

def create_portrait_crop(input_video, output_path):
    """
    Create a 9:16 center-crop version of the video for Instagram Reels / YouTube Shorts.
    Crops from 16:9 → 9:16 by taking the center portion.
    """
    print("[STEP 8] Creating 9:16 portrait crop...")
    
    cmd = [
        "ffmpeg", "-y",
        "-i", input_video,
        "-vf", "crop=ih*9/16:ih:(iw-ih*9/16)/2:0,scale=1080:1920",
        "-c:v", "libx264", "-preset", "fast", "-crf", "23",
        "-c:a", "aac", "-b:a", "128k",
        "-movflags", "+faststart",
        output_path
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    
    if result.returncode != 0 or not os.path.exists(output_path):
        print(f"[STEP 8] 9:16 crop failed: {result.stderr[:200]}")
        return None
    
    print(f"[STEP 8] 9:16 version: {os.path.getsize(output_path)} bytes")
    return output_path


# ─────────────────────────────────────────────────────────────
# Step 9: Pexels B-Roll Fetching
# ─────────────────────────────────────────────────────────────

def fetch_broll_clips(broll_moments):
    """
    Fetch B-roll stock footage from Pexels API (100% free, no watermark).
    Returns list of downloaded clip paths with their insert timestamps.
    """
    print("[STEP 9] Fetching B-roll from Pexels...")
    
    if not PEXELS_API_KEY or not broll_moments:
        print("[STEP 9] Skipping B-roll (no API key or no moments)")
        return []
    
    results = []
    
    for i, moment in enumerate(broll_moments[:4]):  # Max 4 B-roll clips
        query = moment.get("search_query", "technology")
        duration = moment.get("duration", 5)
        timestamp = moment.get("timestamp", 0)
        
        try:
            resp = requests.get(
                "https://api.pexels.com/videos/search",
                headers={"Authorization": PEXELS_API_KEY},
                params={"query": query, "per_page": 3, "size": "medium"},
                timeout=10
            )
            
            if resp.status_code == 200:
                data = resp.json()
                videos = data.get("videos", [])
                
                if videos:
                    # Pick the first video that has an HD file
                    for vid in videos:
                        files = vid.get("video_files", [])
                        hd_file = None
                        for f in files:
                            if f.get("quality") == "hd" and f.get("link"):
                                hd_file = f
                                break
                        if not hd_file and files:
                            hd_file = files[0]
                        
                        if hd_file:
                            clip_path = os.path.join(TMP_DIR, f"broll_{i}.mp4")
                            clip_url = hd_file["link"]
                            
                            # Download the clip
                            dl_resp = requests.get(clip_url, stream=True, timeout=30)
                            with open(clip_path, "wb") as f:
                                for chunk in dl_resp.iter_content(8192):
                                    f.write(chunk)
                            
                            results.append({
                                "path": clip_path,
                                "timestamp": timestamp,
                                "duration": duration,
                                "query": query
                            })
                            print(f"[STEP 9] Downloaded B-roll: '{query}' → {clip_path}")
                            break
        except Exception as e:
            print(f"[STEP 9] Pexels fetch failed for '{query}': {e}")
    
    print(f"[STEP 9] Got {len(results)} B-roll clips")
    return results


def insert_broll(main_video, broll_clips, output_path):
    """
    Overlay B-roll clips at specified timestamps using FFmpeg.
    B-roll replaces the main video track but keeps main audio.
    """
    if not broll_clips:
        shutil.copy2(main_video, output_path)
        return output_path
    
    print(f"[STEP 9b] Inserting {len(broll_clips)} B-roll clips...")
    
    # Build a complex filter that overlays B-roll at timestamps
    inputs = ["-i", main_video]
    filter_parts = []
    
    for i, clip in enumerate(broll_clips):
        inputs.extend(["-i", clip["path"]])
        ts = clip["timestamp"]
        dur = clip["duration"]
        # Scale B-roll to match main video dimensions, enable at timestamp
        filter_parts.append(
            f"[{i+1}:v]scale=iw:ih,setpts=PTS-STARTPTS+{ts}/TB[broll{i}];"
        )
    
    if not filter_parts:
        shutil.copy2(main_video, output_path)
        return output_path
    
    # For simplicity, overlay sequentially
    current = "[0:v]"
    overlay_chain = ""
    for i, clip in enumerate(broll_clips):
        ts = clip["timestamp"]
        dur = clip["duration"]
        end_t = ts + dur
        next_label = f"[tmp{i}]" if i < len(broll_clips) - 1 else "[outv]"
        overlay_chain += f"{current}[broll{i}]overlay=enable='between(t,{ts},{end_t})'{next_label};"
        current = f"[tmp{i}]"
    
    full_filter = "".join(filter_parts) + overlay_chain.rstrip(";")
    
    cmd = [
        "ffmpeg", "-y",
        *inputs,
        "-filter_complex", full_filter,
        "-map", "[outv]", "-map", "0:a",
        "-c:v", "libx264", "-preset", "fast", "-crf", "23",
        "-c:a", "copy",
        "-movflags", "+faststart",
        output_path
    ]
    
    result = subprocess.run(cmd, capture_output=True, text=True)
    
    if result.returncode != 0 or not os.path.exists(output_path):
        print(f"[STEP 9b] B-roll overlay failed, using video without B-roll: {result.stderr[:200]}")
        shutil.copy2(main_video, output_path)
    else:
        print(f"[STEP 9b] B-roll inserted: {os.path.getsize(output_path)} bytes")
    
    # Cleanup B-roll temp files
    for clip in broll_clips:
        cleanup_files(clip["path"])
    
    return output_path


# ═══════════════════════════════════════════════════════════════
# MAIN PIPELINE: process_video_background
# ═══════════════════════════════════════════════════════════════

def process_video_background(video_id, file_url, ai_prompt):
    """
    Complete AI video editing pipeline:
    1. Download → 2. Extract audio → 3. Transcribe (Whisper)
    4. Detect silences → 5. LLM analysis → 6. FFmpeg cut
    7. Generate captions → 8. Burn captions → 9. 9:16 crop
    10. B-roll → 11. Upload → 12. Webhook callback
    """
    print(f"\n{'='*60}")
    print(f"[PIPELINE START] Video: {video_id}")
    print(f"{'='*60}")
    
    input_file = os.path.join(TMP_DIR, f"raw_{video_id}.mp4")
    audio_file = os.path.join(TMP_DIR, f"audio_{video_id}.wav")
    cut_file = os.path.join(TMP_DIR, f"cut_{video_id}.mp4")
    captioned_file = os.path.join(TMP_DIR, f"captioned_{video_id}.mp4")
    broll_file = os.path.join(TMP_DIR, f"broll_{video_id}.mp4")
    portrait_file = os.path.join(TMP_DIR, f"portrait_{video_id}.mp4")
    ass_file = os.path.join(TMP_DIR, f"captions_{video_id}.ass")
    
    all_files = [input_file, audio_file, cut_file, captioned_file, broll_file, portrait_file, ass_file]
    
    try:
        # ── Step 1: Download ──
        report_progress(video_id, 5, "Downloading video from cloud storage...")
        download_from_s3(file_url, input_file)
        
        # ── Step 2-9: Top 0.1% Editor Engine (Ollama + FFmpeg Single-Pass) ──
        report_progress(video_id, 20, "Initiating Top 0.1% Editor Pipeline (Ollama)...")
        pipeline_app = build_graph()
        initial_state = {
            "video_path": input_file,
            "audio_path": "",
            "video_duration": 0.0,
            "words": [],
            "segments": [],
            "brolls": [],
            "output_video_path": "",
            "status": "Started"
        }
        
        report_progress(video_id, 40, "Transcribing and Analyzing with AI...")
        final_state = pipeline_app.invoke(initial_state)
        final_16_9 = final_state.get("output_video_path")
        
        if not final_16_9 or not os.path.exists(final_16_9):
            raise RuntimeError("LangGraph Pipeline failed to produce output video.")
            
        ass_file_generated = f"{input_file}_full.ass"
        if os.path.exists(ass_file_generated):
            shutil.copy2(ass_file_generated, ass_file)
        
        # ── Step 10: 9:16 crop ──
        report_progress(video_id, 82, "Creating 9:16 Reels/Shorts version...")
        create_portrait_crop(final_16_9, portrait_file)
        
        # ── Step 11: Upload to S3 ──
        report_progress(video_id, 88, "Uploading processed videos to cloud...")
        ts = int(time.time())
        
        # Upload 16:9 version
        s3_key_16_9 = f"ai_edits/{video_id}_{ts}_16x9.mp4"
        url_16_9 = upload_to_s3(final_16_9, s3_key_16_9)
        
        # Upload 9:16 version
        url_9_16 = None
        if os.path.exists(portrait_file):
            s3_key_9_16 = f"ai_edits/{video_id}_{ts}_9x16.mp4"
            url_9_16 = upload_to_s3(portrait_file, s3_key_9_16)
        
        # Upload captions file
        caption_url = None
        if os.path.exists(ass_file):
            s3_key_ass = f"ai_edits/{video_id}_{ts}_captions.ass"
            caption_url = upload_to_s3(ass_file, s3_key_ass, content_type="text/plain")
        
        # ── Step 12: Webhook callback ──
        report_progress(video_id, 100, "AI processing complete! 🎬")
        
        callback_payload = {
            "status": "success",
            "editedFileUrl": url_16_9,
            "portraitFileUrl": url_9_16,
            "captionFileUrl": caption_url,
            "transcript": "Processed via Top 0.1% Editor Engine (Ollama)",
            "clips": [],
            "message": "AI Editing complete with cinematic B-roll and captions."
        }
        
        webhook_url = f"{NODE_API_URL}/api/v1/videos/{video_id}/ai-callback"
        headers = {"x-ai-secret": AI_WEBHOOK_SECRET}
        requests.post(webhook_url, json=callback_payload, headers=headers, timeout=15)
        
        print(f"\n[PIPELINE SUCCESS] Video {video_id} processed!")
        print(f"  16:9: {url_16_9}")
        print(f"  9:16: {url_9_16}")
        print(f"  Captions: {caption_url}")
        
    except Exception as e:
        print(f"\n[PIPELINE ERROR] {e}")
        traceback.print_exc()
        report_progress(video_id, 0, f"Processing failed: {str(e)[:80]}")
        webhook_url = f"{NODE_API_URL}/api/v1/videos/{video_id}/ai-callback"
        try:
            headers = {"x-ai-secret": AI_WEBHOOK_SECRET}
            requests.post(webhook_url, json={"status": "failed", "message": f"Processing failed: {str(e)}"}, headers=headers, timeout=10)
        except Exception:
            pass
    
    finally:
        for f in all_files:
            cleanup_files(f)
        gc.collect()
        print(f"[PIPELINE END] Cleanup complete.\n")


def _format_duration(seconds):
    """Format seconds to MM:SS."""
    m = int(seconds // 60)
    s = int(seconds % 60)
    return f"{m:02d}:{s:02d}"


# ═══════════════════════════════════════════════════════════════
# CLIP EXTRACTOR PIPELINE
# ═══════════════════════════════════════════════════════════════

def extract_clips_background(youtube_url, video_id, file_url, room_id, creator_id):
    """
    Extract short clips from a long video using real AI analysis:
    1. Download source (YouTube URL or S3 file)
    2. Transcribe with Whisper
    3. LLM identifies best clip moments
    4. FFmpeg cuts each clip
    5. Generate captions per clip
    6. Create 9:16 versions
    7. Upload all to S3
    8. Webhook callback
    """
    op_id = video_id if video_id else str(int(time.time()))
    print(f"\n{'='*60}")
    print(f"[CLIP EXTRACTOR START] {op_id}")
    print(f"{'='*60}")
    
    input_file = os.path.join(TMP_DIR, f"source_{op_id}.mp4")
    audio_file = os.path.join(TMP_DIR, f"clip_audio_{op_id}.wav")
    
    clips_payload = []
    temp_files = [input_file, audio_file]
    
    try:
        # Download source
        if youtube_url:
            report_progress(video_id, 5, "Downloading from YouTube...")
            ydl_opts = {
                "outtmpl": input_file,
                "format": "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best",
                "quiet": True,
                "no_warnings": True,
                "merge_output_format": "mp4",
            }
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                ydl.download([youtube_url])
        elif file_url:
            report_progress(video_id, 5, "Downloading video from cloud...")
            download_from_s3(file_url, input_file)
        else:
            raise ValueError("No video source provided")
        
        video_duration = get_video_duration(input_file)
        
        # Transcribe
        report_progress(video_id, 15, "Transcribing speech with Whisper AI...")
        extract_audio(input_file, audio_file)
        transcript = transcribe_audio(audio_file)
        
        # Detect silences for context
        silences = detect_silences(transcript["words"])
        
        # LLM finds best clips
        report_progress(video_id, 35, "AI identifying best clip moments...")
        analysis = llm_analyze_transcript(
            transcript["text"],
            transcript["segments"],
            silences,
            "Find the best 3-5 short clips (30-90 seconds) for TikTok, Reels, and Shorts. Focus on high energy, quotable statements, and emotional peaks.",
            video_duration
        )
        
        clip_suggestions = analysis.get("clip_suggestions", [])
        
        if not clip_suggestions:
            # Fallback: split video into equal ~60s chunks
            clip_suggestions = []
            chunk_len = min(60, video_duration / 3)
            for i in range(min(5, int(video_duration / chunk_len))):
                clip_suggestions.append({
                    "title": f"Clip {i+1}",
                    "start": i * chunk_len,
                    "end": (i + 1) * chunk_len,
                    "score": 70,
                    "hashtags": "#MWareX #Content"
                })
        
        # Cut each clip
        report_progress(video_id, 50, f"Rendering {len(clip_suggestions)} clips...")
        
        for i, clip in enumerate(clip_suggestions):
            clip_16_9 = os.path.join(TMP_DIR, f"clip_{op_id}_{i}_16x9.mp4")
            clip_9_16 = os.path.join(TMP_DIR, f"clip_{op_id}_{i}_9x16.mp4")
            clip_ass = os.path.join(TMP_DIR, f"clip_{op_id}_{i}.ass")
            clip_captioned = os.path.join(TMP_DIR, f"clip_{op_id}_{i}_cap.mp4")
            temp_files.extend([clip_16_9, clip_9_16, clip_ass, clip_captioned])
            
            start = clip.get("start", 0)
            end = clip.get("end", start + 60)
            
            # Cut the clip
            cmd = [
                "ffmpeg", "-y",
                "-i", input_file,
                "-ss", str(start), "-to", str(end),
                "-c:v", "libx264", "-preset", "fast", "-crf", "23",
                "-c:a", "aac", "-b:a", "128k",
                "-movflags", "+faststart",
                clip_16_9
            ]
            subprocess.run(cmd, capture_output=True, text=True)
            
            if not os.path.exists(clip_16_9):
                continue
            
            # Generate captions for this clip
            clip_words = [w for w in transcript["words"] if w["start"] >= start and w["end"] <= end]
            # Remap to clip-local timestamps
            clip_local_words = [{
                "word": w["word"],
                "start": round(w["start"] - start, 3),
                "end": round(w["end"] - start, 3)
            } for w in clip_words]
            
            generate_captions_ass(clip_local_words, None, clip_ass)
            burn_captions(clip_16_9, clip_ass, clip_captioned)
            
            # 9:16 version
            final_clip = clip_captioned if os.path.exists(clip_captioned) else clip_16_9
            create_portrait_crop(final_clip, clip_9_16)
            
            # Upload both versions to S3
            ts = int(time.time())
            
            s3_key_16 = f"clips/{op_id}_clip_{i}_{ts}_16x9.mp4"
            url_16 = upload_to_s3(final_clip, s3_key_16)
            
            url_916 = None
            if os.path.exists(clip_9_16):
                s3_key_9 = f"clips/{op_id}_clip_{i}_{ts}_9x16.mp4"
                url_916 = upload_to_s3(clip_9_16, s3_key_9)
            
            clips_payload.append({
                "title": clip.get("title", f"Clip {i+1}"),
                "fileUrl": url_16,
                "portraitFileUrl": url_916,
                "viralScore": clip.get("score", 70),
                "aspectRatio": "16:9",
                "hashtags": clip.get("hashtags", "#MWareX"),
                "startTime": _format_duration(start),
                "endTime": _format_duration(end),
                "duration": _format_duration(end - start),
            })
            
            pct = 50 + int((i + 1) / len(clip_suggestions) * 40)
            report_progress(video_id, pct, f"Clip {i+1}/{len(clip_suggestions)} processed")
        
        # Callback
        report_progress(video_id, 100, f"All {len(clips_payload)} clips extracted! 🎉")
        
        webhook_url = f"{NODE_API_URL}/api/v1/videos/{video_id}/clips-callback"
        headers = {"x-ai-secret": AI_WEBHOOK_SECRET}
        requests.post(webhook_url, headers=headers, json={
            "status": "success",
            "clips": clips_payload,
            "transcript": transcript["text"][:5000],
            "message": f"Extracted {len(clips_payload)} clips with captions",
            "creatorId": creator_id,
            "roomId": room_id
        }, timeout=15)
        
        print(f"[CLIP EXTRACTOR] SUCCESS: {len(clips_payload)} clips uploaded")
        
    except Exception as e:
        print(f"[CLIP EXTRACTOR ERROR] {e}")
        traceback.print_exc()
        report_progress(video_id, 0, f"Extraction failed: {str(e)[:80]}")
        webhook_url = f"{NODE_API_URL}/api/v1/videos/{video_id}/clips-callback"
        try:
            headers = {"x-ai-secret": AI_WEBHOOK_SECRET}
            requests.post(webhook_url, json={"status": "failed", "message": f"Extraction failed: {str(e)}"}, headers=headers, timeout=10)
        except Exception:
            pass
    
    finally:
        for f in temp_files:
            cleanup_files(f)
        gc.collect()
        print("[CLIP EXTRACTOR END] Cleanup complete.\n")


# ═══════════════════════════════════════════════════════════════
# STANDALONE CAPTION ENDPOINT
# ═══════════════════════════════════════════════════════════════

def generate_captions_background(video_id, file_url):
    """Generate captions for an existing video without re-editing."""
    print(f"[CAPTIONS] Generating for {video_id}")
    
    input_file = os.path.join(TMP_DIR, f"cap_raw_{video_id}.mp4")
    audio_file = os.path.join(TMP_DIR, f"cap_audio_{video_id}.wav")
    ass_file = os.path.join(TMP_DIR, f"cap_{video_id}.ass")
    
    try:
        report_progress(video_id, 10, "Downloading video...")
        download_from_s3(file_url, input_file)
        
        report_progress(video_id, 30, "Extracting audio...")
        extract_audio(input_file, audio_file)
        
        report_progress(video_id, 50, "Transcribing with Whisper...")
        transcript = transcribe_audio(audio_file)
        
        report_progress(video_id, 70, "Generating styled captions...")
        generate_captions_ass(transcript["words"], None, ass_file)
        
        report_progress(video_id, 90, "Uploading caption file...")
        ts = int(time.time())
        s3_key = f"captions/{video_id}_{ts}.ass"
        caption_url = upload_to_s3(ass_file, s3_key, content_type="text/plain")
        
        report_progress(video_id, 100, "Captions ready!")
        
        webhook_url = f"{NODE_API_URL}/api/v1/videos/{video_id}/ai-callback"
        headers = {"x-ai-secret": AI_WEBHOOK_SECRET}
        requests.post(webhook_url, headers=headers, json={
            "status": "success",
            "captionFileUrl": caption_url,
            "transcript": transcript["text"][:5000],
            "message": "Captions generated successfully"
        }, timeout=10)
        
    except Exception as e:
        print(f"[CAPTIONS ERROR] {e}")
        traceback.print_exc()
    finally:
        cleanup_files(input_file, audio_file, ass_file)
        gc.collect()


# ═══════════════════════════════════════════════════════════════
# Flask Routes
# ═══════════════════════════════════════════════════════════════

@app.route("/process_video", methods=["POST"])
def process_video():
    data = request.json
    video_id = data.get("videoId")
    file_url = data.get("fileUrl")
    ai_prompt = data.get("aiPrompt", "Edit this video professionally — remove silences, fillers, and mistakes. Keep all meaningful content.")
    
    if not video_id or not file_url:
        return jsonify({"error": "videoId and fileUrl are required"}), 400
    
    thread = threading.Thread(
        target=process_video_background,
        args=(video_id, file_url, ai_prompt),
        daemon=True
    )
    thread.start()
    
    return jsonify({"message": "AI Video Pipeline started", "status": "processing"}), 202


@app.route("/extract_clips", methods=["POST"])
def extract_clips():
    data = request.json
    youtube_url = data.get("youtubeUrl")
    video_id = data.get("videoId")
    file_url = data.get("fileUrl")
    room_id = data.get("roomId")
    creator_id = data.get("creatorId")
    
    if not youtube_url and not video_id and not file_url:
        return jsonify({"error": "youtubeUrl, videoId, or fileUrl required"}), 400
    
    thread = threading.Thread(
        target=extract_clips_background,
        args=(youtube_url, video_id, file_url, room_id, creator_id),
        daemon=True
    )
    thread.start()
    
    return jsonify({"message": "Clip extraction started", "status": "processing"}), 202


@app.route("/generate_captions", methods=["POST"])
def generate_captions_route():
    data = request.json
    video_id = data.get("videoId")
    file_url = data.get("fileUrl")
    
    if not video_id or not file_url:
        return jsonify({"error": "videoId and fileUrl required"}), 400
    
    thread = threading.Thread(
        target=generate_captions_background,
        args=(video_id, file_url),
        daemon=True
    )
    thread.start()
    
    return jsonify({"message": "Caption generation started", "status": "processing"}), 202


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "MWareX AI Video Engine is ALIVE 🚀",
        "groq": "connected" if groq_client else "missing",
        "gemini": "connected" if genai and GEMINI_API_KEY else "missing",
        "pexels": "connected" if PEXELS_API_KEY else "missing",
        "s3": "connected" if BUCKET_NAME else "missing",
    })


if __name__ == "__main__":
    port = int(os.getenv("AI_PORT", 5001))
    print(f"\n{'='*60}")
    print(f"  MWareX AI Video Engine — Port {port}")
    print(f"  Groq Whisper: {'✅' if groq_client else '❌'}")
    print(f"  Gemini Flash: {'✅' if genai and GEMINI_API_KEY else '❌'}")
    print(f"  Pexels B-roll: {'✅' if PEXELS_API_KEY else '❌ (optional)'}")
    print(f"  S3 Bucket: {BUCKET_NAME or '❌'}")
    print(f"{'='*60}\n")
    app.run(host="0.0.0.0", port=port, debug=False)
