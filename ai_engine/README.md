# 🤖 MwareX AI Video Engine

The AI Video Engine is a specialized microservice responsible for intelligent video analysis and automated editing using Google's Gemini 2.0 Flash and FFMPEG.

## 🚀 Overview

- **Intelligent Analysis**: Uses Multimodal Gemini AI to "watch" videos and identify best segments.
- **Automated Editing**: Dynamically cuts and stitches videos based on AI-generated edit points.
- **Microservice Architecture**: Decoupled from the main Node.js backend for scalability.
- **Cloud Native**: Integrated with AWS S3 for secure video processing.

---

## 🛠️ Tech Stack

- **Core**: Python 3.10
- **Web**: Flask + Gunicorn (Production)
- **AI**: Google Gemini 2.0 Flash API (`google-generativeai`)
- **Video Processing**: FFMPEG
- **Storage**: AWS S3 (via `boto3`)

---

## ⚙️ Environment Variables

The engine reads environment variables either from the container environment or from `../backend/.env` during local development.

| Variable | Description |
| :--- | :--- |
| `GEMINI_API_KEY` | Your Google AI Studio API Key |
| `AWS_ACCESS_KEY_ID` | AWS IAM Access Key |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM Secret Key |
| `AWS_REGION` | AWS Region (e.g., `eu-north-1`) |
| `AWS_S3_BUCKET` | Name of your S3 Bucket |
| `NODE_API_URL` | URL of the MwareX Backend (e.g., `http://localhost:8000`) |

---

## 📥 Installation

### 1. Prerequisites
- Python 3.10+
- FFMPEG installed on your system
- A valid Google Gemini API Key

### 2. Local Setup
```bash
# Navigate to the engine directory
cd ai_engine

# Create a virtual environment
python -m venv venv

# Activate virtual environment
source venv/bin/activate  # Mac/Linux
# OR
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt
```

---

## 🏃 Running the Engine

### Local Development
```bash
python app.py
```
The server will start on `http://localhost:5001`.

### Docker (Recommended)
The Docker image comes pre-configured with Python and FFMPEG.

```bash
# Build the image
docker build -t mwarex-ai-engine .

# Run the container
docker run -p 5001:5001 \
  --env-file ../backend/.env \
  mwarex-ai-engine
```

---

## 🔌 API Endpoints

### 1. Health Check
`GET /health`
Returns the status of the AI Engine.

### 2. Process Video
`POST /process_video`
Initiates a background task to analyze and edit a video.

**Payload:**
```json
{
  "videoId": "video_123",
  "fileUrl": "https://bucket.s3.region.amazonaws.com/uploads/video.mp4",
  "aiPrompt": "Make this video fast-paced and remove stutters"
}
```

---

## 🛠️ Utility Scripts

### Fix Database Status
If the server restarts or the AI quota is reached, some videos might get stuck in `ai_processing` status. Use this script to reset them:

```bash
python fix_db.py
```
This script will:
- Reset `ai_processing` videos to `raw_rejected`.
- Reset `processing` (YouTube upload) videos to `approved`.

---

## 🔄 Workflow Logic

1. **Trigger**: Backend sends a request to `/process_video`.
2. **Download**: Engine downloads the raw video from S3.
3. **Analysis**: Gemini AI analyzes the video frames and audio based on the `aiPrompt`.
4. **Logic**: Gemini returns JSON with "keep" segments (timestamps).
5. **Editing**: FFMPEG cuts the segments and stitches them into a final output.
6. **Upload**: The edited video is uploaded back to S3 in the `ai_edits/` folder.
7. **Callback**: The engine notifies the Node.js backend of success/failure via a webhook.

---

<p align="center"><i>Powered by MwareX AI 💙</i></p>
