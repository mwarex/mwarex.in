<div align="center">
  <a href="https://mwarex.in">
    <img src="./githubanner.png" alt="MwareX AI Content Operations Platform" width="100%" style="border-radius: 12px; margin-bottom: 20px;" />
  </a>

  <p align="center">
    <img src="https://img.shields.io/badge/v1.0.0-Beta-blueviolet?style=for-the-badge&labelColor=black" />
    <img src="https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" />
    <img src="https://img.shields.io/badge/Status-Production-success?style=for-the-badge&labelColor=black" />
    <a href="./LICENSE"><img src="https://img.shields.io/badge/License-MIT-00E676?style=for-the-badge&labelColor=black" /></a>
  </p>

  <h3 align="center">The Ultimate AI Content Operations Platform</h3>
  <p align="center"><b>Stop guessing. Outsmart competitors with real-time AI strategies.</b></p>
  
  <br />

  <a href="#-getting-started"><strong>Explore the Docs »</strong></a>
  <br />
  <br />
  <a href="https://mwarex.in">View Live Demo</a>
  ·
  <a href="https://github.com/samay-hash/MwareX/issues">Report Bug</a>
  ·
  <a href="https://github.com/samay-hash/MwareX/issues">Request Feature</a>

</div>

---

## 🌟 About The Project

Content creation is no longer just about editing—it's about strategy, speed, and precision. MWareX is a next-generation AI Content Operations Platform built for ambitious creators and editing teams. We replace guesswork with data-driven workflows, transforming raw footage into viral-ready masterpieces.

### **Core Capabilities**
- 🧠 **AI Content Strategist Pro**: Access real-time viral data, instant hooks, smart hashtags, and aggressive competitor takedowns.
- 🎬 **Automated Editor Engine**: A single-pass, fully automated pipeline utilizing Groq Llama 3.3 and Whisper to extract highly engaging clips from long-form content.
- ☁️ **High-Speed Cloud Ingestion**: Upload raw footage instantly via secure AWS S3 presigned URLs, bypassing traditional server memory limits.
- 🚀 **Frictionless Publishing**: One-click approvals and direct-to-YouTube publishing, creating a zero-privacy-compromise bridge between editors and creators.

Our mission is to open-source the ultimate content operations platform for creators globally.

<br>

## 🛠️ Built With

We leverage a robust, modern ecosystem designed for scale, speed, and real-time processing.

**Frontend Core**
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS & Framer Motion

**Backend Engine**
- **Runtime:** Node.js & Express
- **Database:** MongoDB Atlas
- **Real-time Communication:** Socket.io

**AI & Cloud Infrastructure**
- **Processing Engine:** Python & FFMPEG
- **AI Models:** Groq Llama 3.3, Google Gemini Flash, OpenAI Whisper
- **Cloud Storage:** AWS S3 & Cloudinary

<br>

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

You need the following installed on your machine:
* [Node.js](https://nodejs.org/) (v18+)
* [Python](https://www.python.org/) (v3.9+)
* [MongoDB](https://www.mongodb.com/) (Local or Atlas URI)
* [FFMPEG](https://ffmpeg.org/download.html) (Installed and added to your system path)

### Installation & Setup

MWareX is a monorepo consisting of three microservices. You will need to start all three to run the full application.

**1. Clone the repo**
```bash
git clone https://github.com/samay-hash/MwareX.git
cd MwareX
```

**2. Start the Backend API**
```bash
cd backend
npm install
# Create a .env file based on the provided .env.example
npm run dev
```
*The Node.js server will run on port 8000.*

**3. Start the AI Engine**
```bash
cd ../ai_engine
python3 -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
pip install -r requirements.txt
# Create a .env file with your Gemini/Cloudinary keys
python app.py
```
*The Python AI server will run on port 5001.*

**4. Start the Frontend Application**
```bash
cd ../frontend
npm install
# Create a .env.local file with your Next.js config
npm run dev
```
*The Next.js app will run on port 3000. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.*

<br>

## 📂 Project Structure

```bash
MwareX/
├── 📱 frontend/              # Next.js 16 (App Router) User Interface
│   ├── src/app/              # Pages & Layouts (Dashboard, Video Editor)
│   ├── src/components/       # Reusable UI (Radix + Lucide + Framer)
│   └── src/lib/              # API Clients & Auth Utilities
│
├── ⚙️ backend/               # Node.js Microservice
│   ├── models/               # MongoDB Schemas (Mongoose)
│   ├── routes/               # REST API Endpoints (Auth, Video, S3)
│   └── services/             # Core Logic (YouTube Uploads, Email)
│
└── 🤖 ai_engine/             # Python Multimodal AI Microservice
    ├── app.py                # Flask API
    ├── ai_analysis.py        # Gemini AI Prompting
    └── clip_extractor.py     # FFMPEG Video Processing
```

<br>

## 🤝 Contributing

We are thrilled that you'd like to contribute to MWareX! Whether it's fixing a bug, improving documentation, or adding a new feature, your help is welcome.

Please read our [Contributing Guidelines](CONTRIBUTING.md) for details on our code of conduct, development workflow, and the process for submitting Pull Requests.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<br>

## 🛡️ Security & Code of Conduct

- **Security**: If you discover any security related issues, please refer to our [Security Policy](SECURITY.md) for reporting instructions.
- **Code of Conduct**: Please review and abide by our [Code of Conduct](CODE_OF_CONDUCT.md) to ensure a welcoming environment for all.

<br>

## 📄 License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for more information.

---

<div align="center">

  <h3>🔗 Connect With The Founder</h3>
  <p>I build tools that solve real problems.</p>

  <a href="https://github.com/samay-hash">
    <img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white" />
  </a>
  <a href="https://x.com/mwarex">
    <img src="https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white" />
  </a>

  <br><br>
  <p><i>Made with 💙 by Samay</i></p>

</div>

# Test direct push
