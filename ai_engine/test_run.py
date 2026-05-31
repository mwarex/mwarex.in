import requests
import json

payload = {
    "videoId": "test-video",
    "fileUrl": "https://mwarex-video-uploads.s3.eu-north-1.amazonaws.com/ai_edits/663c0a5b81a8b30d32f14371_1715181745.mp4",
    "aiPrompt": "Make it a short clip"
}

print("Triggering AI Engine...")
res = requests.post("http://localhost:5001/process_video", json=payload)
print(res.status_code, res.json())
