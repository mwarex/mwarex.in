import os
import json
import re
import subprocess
import requests
from dotenv import load_dotenv
from typing import TypedDict, List, Dict, Any

from faster_whisper import WhisperModel
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage
from langgraph.graph import StateGraph, START, END

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), "backend", ".env"))
PEXELS_API_KEY = os.getenv("PEXELS_API_KEY")

class VideoState(TypedDict):
    video_path: str
    audio_path: str
    video_duration: float
    words: List[Dict[str, Any]]
    segments: List[Dict[str, Any]]
    brolls: List[Dict[str, Any]]
    output_video_path: str
    status: str

# ---------------------------------------------------------
# PRO ARCHITECTURE: Top 0.1% Editor Engine (Ollama + Single-Pass)
# ---------------------------------------------------------

def get_video_duration(video_path: str) -> float:
    cmd = ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", video_path]
    result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    try:
        return float(result.stdout.strip())
    except:
        return 0.0

class AudioTranscriber:
    def __init__(self, model_size="base"):
        self.model_size = model_size

    def extract_audio(self, video_path: str) -> str:
        audio_path = f"{video_path}_audio.wav"
        print("[Transcriber] Extracting lossless audio...")
        cmd = [
            "ffmpeg", "-y", "-i", video_path,
            "-vn", "-acodec", "pcm_s16le", "-ar", "16000", "-ac", "1",
            audio_path
        ]
        subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        return audio_path

    def transcribe(self, audio_path: str) -> List[Dict[str, Any]]:
        print("[Transcriber] Running Whisper word-level transcription...")
        model = WhisperModel(self.model_size, device="cpu", compute_type="int8")
        segments, _ = model.transcribe(audio_path, beam_size=5, word_timestamps=True)
        
        words = []
        for segment in segments:
            for word in segment.words:
                words.append({
                    "word": word.word.strip(),
                    "start": word.start,
                    "end": word.end
                })
        print(f"[Transcriber] Found {len(words)} words.")
        return words


class SentenceSegmenter:
    @staticmethod
    def create_sentences(words: List[Dict[str, Any]], video_duration: float) -> List[Dict[str, Any]]:
        if not words:
            return []
            
        print("[Segmenter] Structuring raw words into logical sentences for AI analysis...")
        sentences = []
        current_words = []
        seg_start = words[0]["start"]
        
        for i, w in enumerate(words):
            current_words.append(w)
            
            is_end_of_sentence = w["word"].endswith((".", "?", "!"))
            is_large_gap = False
            if i + 1 < len(words):
                next_word_start = words[i+1]["start"]
                if next_word_start - w["end"] > 1.5:
                    is_large_gap = True
                    
            if is_end_of_sentence or is_large_gap:
                seg_end = w["end"]
                text = " ".join([cw["word"] for cw in current_words])
                sentences.append({
                    "start": seg_start,
                    "end": seg_end,
                    "words": current_words,
                    "text": text
                })
                
                if i + 1 < len(words):
                    seg_start = words[i+1]["start"]
                current_words = []
                
        if current_words:
            sentences.append({
                "start": seg_start,
                "end": current_words[-1]["end"],
                "words": current_words,
                "text": " ".join([cw["word"] for cw in current_words])
            })
            
        print(f"[Segmenter] Extracted {len(sentences)} key sentences.")
        return sentences


class PexelsAPI:
    @staticmethod
    def fetch_video(query: str, filepath: str) -> bool:
        if not PEXELS_API_KEY:
            print("[PexelsAPI] Error: Missing API Key.")
            return False
            
        try:
            print(f"[PexelsAPI] Searching highly aesthetic footage for: '{query}'...")
            resp = requests.get(
                "https://api.pexels.com/videos/search",
                headers={"Authorization": PEXELS_API_KEY},
                params={"query": query, "per_page": 3, "size": "medium", "orientation": "landscape"},
                timeout=10
            )
            if resp.status_code == 200:
                data = resp.json()
                videos = data.get("videos", [])
                if videos:
                    for vid in videos:
                        files = vid.get("video_files", [])
                        hd_file = next((f for f in files if f.get("quality") == "hd" and f.get("link")), None)
                        if not hd_file and files:
                            hd_file = files[0]
                        if hd_file:
                            clip_url = hd_file["link"]
                            print(f"[PexelsAPI] Found match. Downloading directly...")
                            dl_resp = requests.get(clip_url, stream=True, timeout=30)
                            with open(filepath, "wb") as f:
                                for chunk in dl_resp.iter_content(8192):
                                    f.write(chunk)
                            return True
            print(f"[PexelsAPI] No videos found for query: '{query}'")
        except Exception as e:
            print(f"[PexelsAPI] Fetch failed: {e}")
        return False


class ProCaptionGenerator:
    @staticmethod
    def seconds_to_ass(seconds: float) -> str:
        h = int(seconds // 3600)
        m = int((seconds % 3600) // 60)
        s = int(seconds % 60)
        cs = int((seconds % 1) * 100)
        return f"{h}:{m:02d}:{s:02d}.{cs:02d}"

    @staticmethod
    def generate_full_ass(words: List[Dict[str, Any]], filepath: str):
        print("[Captions] Compiling real-time Yellow-highlighted subtitle file...")
        ass_header = """[Script Info]
Title: MWareX Pro Captions
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080
WrapStyle: 1

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial Black,80,&H00FFFFFF,&H000000FF,&H00000000,&H80000000,-1,0,0,0,100,100,0,0,1,5,3,2,40,40,150,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
        phrases = []
        current_phrase = []
        for w in words:
            current_phrase.append(w)
            if len(current_phrase) >= 4 or w["word"].endswith((".", "!", "?", ",")) or (current_phrase[-1]["end"] - current_phrase[0]["start"]) > 2.0:
                phrases.append(current_phrase)
                current_phrase = []
        if current_phrase:
            phrases.append(current_phrase)

        ass_content = ass_header
        
        for phrase in phrases:
            phrase_start = phrase[0]["start"]
            phrase_end = phrase[-1]["end"]
            
            for i, active_word in enumerate(phrase):
                start_ts = ProCaptionGenerator.seconds_to_ass(active_word["start"])
                if i + 1 < len(phrase):
                    end_ts = ProCaptionGenerator.seconds_to_ass(phrase[i+1]["start"])
                else:
                    end_ts = ProCaptionGenerator.seconds_to_ass(phrase_end)
                    
                line_text = ""
                for j, w in enumerate(phrase):
                    word_str = w["word"].replace("{", "\\{").replace("}", "\\}")
                    if j == i:
                        line_text += f"{{\\c&H00FFFF&}}{word_str}{{\\c&HFFFFFF&}} "
                    else:
                        line_text += f"{word_str} "
                        
                ass_content += f"Dialogue: 0,{start_ts},{end_ts},Default,,0,0,0,,{line_text.strip()}\n"

        with open(filepath, "w", encoding="utf-8") as f:
            f.write(ass_content)


class SinglePassRenderer:
    @staticmethod
    def render(video_path: str, video_duration: float, brolls: List[Dict[str, Any]], words: List[Dict[str, Any]]) -> str:
        print("\n[Renderer] Initiating Single-Pass Buttery Smooth Render Engine...")
        output_path = f"{video_path}_pro.mp4"
        ass_file = f"{video_path}_full.ass"
        
        ProCaptionGenerator.generate_full_ass(words, ass_file)
        safe_ass = ass_file.replace("\\", "/").replace(":", "\\\\:").replace("'", "\\'")
        
        cmd = ["ffmpeg", "-y", "-i", video_path]
        
        valid_brolls = []
        for b in brolls:
            if os.path.exists(b["file"]):
                cmd.extend(["-stream_loop", "-1", "-i", b["file"]])
                valid_brolls.append(b)
                
        if not valid_brolls:
            print("[Renderer] No B-Rolls generated. Rendering captions only.")
            cmd.extend([
                "-vf", f"scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,ass='{safe_ass}'",
                "-c:v", "libx264", "-preset", "fast",
                "-c:a", "aac",
                output_path
            ])
            subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            print(f"[Renderer] Render Complete! Video perfectly smooth. Exported to: {output_path}")
            return output_path
            
        filters = []
        
        for i, b in enumerate(valid_brolls):
            input_idx = i + 1 
            dur = b["end"] - b["start"]
            start_ts = b["start"]
            filters.append(
                f"[{input_idx}:v]trim=duration={dur},scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,setpts=PTS-STARTPTS+{start_ts}/TB[b{input_idx}]"
            )
            
        base_layer = "[0:v]"
        for i, b in enumerate(valid_brolls):
            input_idx = i + 1
            start_ts = b["start"]
            end_ts = b["end"]
            next_layer = f"[v{input_idx}]"
            filters.append(
                f"{base_layer}[b{input_idx}]overlay=enable='between(t,{start_ts},{end_ts})':eof_action=pass{next_layer}"
            )
            base_layer = next_layer
            
        filters.append(f"{base_layer}ass='{safe_ass}'[vout]")
        filtergraph = ";".join(filters)
        
        cmd.extend([
            "-filter_complex", filtergraph,
            "-map", "[vout]",
            "-map", "0:a",
            "-c:v", "libx264", "-preset", "fast",
            "-c:a", "aac",
            output_path
        ])
        
        print("[Renderer] Executing Complex FFmpeg Graph (This may take a minute...)")
        subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        
        if os.path.exists(ass_file): os.remove(ass_file)
        for b in valid_brolls:
            if os.path.exists(b["file"]): os.remove(b["file"])
            
        print(f"[Renderer] Render Complete! Video perfectly smooth. Exported to: {output_path}")
        return output_path

# ---------------------------------------------------------
# LANGGRAPH NODES
# ---------------------------------------------------------

def node_transcribe(state: VideoState) -> VideoState:
    t = AudioTranscriber()
    audio = t.extract_audio(state["video_path"])
    words = t.transcribe(audio)
    dur = get_video_duration(state["video_path"])
    if dur == 0.0 and words: dur = words[-1]["end"] + 1.0
    
    sentences = SentenceSegmenter.create_sentences(words, dur)
    
    return {"audio_path": audio, "video_duration": dur, "words": words, "segments": sentences, "status": "Transcribed"}

def node_plan(state: VideoState) -> VideoState:
    print("\n--- [Groq] Strategizing Top 0.1% Cinematic B-Roll Placements ---")
    segments = state["segments"]
    
    llm = ChatGroq(model="llama3-70b-8192", temperature=0.2, groq_api_key=os.getenv("GROQ_API_KEY"))
    
    transcript_summary = ""
    for i, seg in enumerate(segments):
        transcript_summary += f"Segment {i}: {seg['text']}\n"
        
    prompt = f"""You are the Chief Video Editor for a top 0.1% creator like Ali Abdaal or Alex Hormozi.
Your job is to read the exact sentence-by-sentence breakdown of a video transcript and assign B-roll ONLY to the absolute most engaging, emotional, or high-action sentences. 
Do NOT place B-roll on boring transition sentences.

When you do place B-roll, your search queries must be highly aesthetic and cinematic. 
BAD QUERY: "man typing on laptop"
GOOD QUERY: "aesthetic late night coding blur"
BAD QUERY: "happy person"
GOOD QUERY: "cinematic smiling sunset portrait"

SEGMENTS:
{transcript_summary[:6000]}

TASK: Return a JSON array matching the exact number of segments.
Format:
{{
  "effects_plan": [
    {{"segment_index": 0, "effect": "none"}},
    {{"segment_index": 1, "effect": "broll", "broll_query": "aesthetic cinematic sunset"}},
    {{"segment_index": 2, "effect": "none"}}
  ]
}}
Effect choices: ["none", "broll"].
Provide "broll_query" ONLY if effect is "broll". You are allowed to use up to 25 B-rolls total.

Return ONLY raw JSON. No markdown formatting.
"""
    messages = [SystemMessage(content="Output raw JSON only."), HumanMessage(content=prompt)]
    response = llm.invoke(messages)
    text = re.sub(r"^```(?:json)?\s*", "", response.content.strip())
    text = re.sub(r"\s*```$", "", text)
    
    brolls_to_fetch = []
    try:
        data = json.loads(text)
        if isinstance(data, list):
            effects = data
        else:
            effects = data.get("effects_plan", [])
        
        for i, seg in enumerate(segments):
            if i < len(effects):
                effect = effects[i].get("effect", "none")
                query = effects[i].get("broll_query", "")
                
                # Minimum duration to make B-roll look good
                sentence_dur = seg["end"] - seg["start"]
                if effect == "broll" and query and sentence_dur >= 2.0:
                    brolls_to_fetch.append({
                        "sentence_idx": i,
                        "start": seg["start"],
                        "end": seg["end"],
                        "query": query,
                        "file": f"{state['video_path']}_broll_{i}.mp4"
                    })
    except Exception as e:
        print(f"[Ollama] Failed to parse Qwen JSON: {e}")
        
    print(f"[Ollama] Successfully identified {len(brolls_to_fetch)} hyper-engaging moments.")
    return {"brolls": brolls_to_fetch, "status": "Planned"}

def node_fetch_and_render(state: VideoState) -> VideoState:
    brolls_to_fetch = state.get("brolls", [])
    valid_brolls = []
    
    print(f"\n--- [API Fetcher] Automatically downloading highly aesthetic B-Rolls ---")
    for b in brolls_to_fetch:
        success = PexelsAPI.fetch_video(b["query"], b["file"])
        if success:
            valid_brolls.append(b)
            
    final_path = SinglePassRenderer.render(state["video_path"], state["video_duration"], valid_brolls, state["words"])
    return {"output_video_path": final_path, "status": "Complete"}

# ---------------------------------------------------------
# GRAPH EXECUTION
# ---------------------------------------------------------

def build_graph():
    workflow = StateGraph(VideoState)
    workflow.add_node("transcribe", node_transcribe)
    workflow.add_node("plan", node_plan)
    workflow.add_node("fetch_and_render", node_fetch_and_render)
    
    workflow.add_edge(START, "transcribe")
    workflow.add_edge("transcribe", "plan")
    workflow.add_edge("plan", "fetch_and_render")
    workflow.add_edge("fetch_and_render", END)
    return workflow.compile()

if __name__ == "__main__":
    print("Welcome to MWareX Top 0.1% Editor Engine (Advanced Ollama Prompting + Single-Pass Render)!")
    import sys
    if len(sys.argv) > 1:
        test_video = sys.argv[1]
    else:
        test_video = input("Enter path to test video (e.g. test.mp4): ").strip()
    
    if not os.path.exists(test_video):
        print(f"File not found: {test_video}")
        exit(1)
        
    app = build_graph()
    initial_state = {
        "video_path": test_video,
        "audio_path": "",
        "video_duration": 0.0,
        "words": [],
        "segments": [],
        "brolls": [],
        "output_video_path": "",
        "status": "Started"
    }
    
    app.invoke(initial_state)
    print("\nPro Workflow Finished!")
