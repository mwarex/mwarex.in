<div align="center">

  <!-- Simple Static-Like Animation (Just MwareX) -->
  <a href="https://mwarex.in">
    <img src="https://readme-typing-svg.herokuapp.com?font=Orbitron&weight=900&size=60&pause=1000&color=FFFFFF&background=00000000&center=true&vCenter=true&width=600&lines=MwareX" alt="MwareX" />
  </a>

  <p align="center">
    <img src="https://img.shields.io/badge/v1.0.0-Beta-blueviolet?style=for-the-badge&labelColor=black" />
    <img src="https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" />
    <img src="https://img.shields.io/badge/Status-Production-success?style=for-the-badge&labelColor=black" />
    <a href="./LICENSE"><img src="https://img.shields.io/badge/License-MIT-00E676?style=for-the-badge&labelColor=black" /></a>
  </p>

  <h3 align="center">The Secure Operating System for Modern YouTube Teams</h3>
  <p align="center"><b>An Open-Source AI Content Operations Platform</b></p>
  
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

<br>

## 🌟 About The Project

Most YouTube creators don’t have a secure or efficient way to work with editors. This forces them to waste hours on uploads, downloads — and in some cases, even share their Google account passwords just to get videos published.

**MWareX** creates a secure bridge between your editing team and your YouTube channel.
- **Editors** upload directly to your secure MWareX cloud. ☁️
- **Creators** get a push notification to review the video. 📲
- **One Click Approval**: The video is instantly pushed to YouTube via secure OAuth. 🚀
- **Zero Privacy Compromise**: Editors never see your YouTube credentials. 🛡️

Our mission is to open-source the ultimate content operations platform for creators globally.

<br>

## 🛠️ Built With

We leverage a robust, modern ecosystem designed for scale, speed, and real-time processing.

| **Frontend Core** | **Backend Engine** | **Cloud & AI** |
|:---:|:---:|:---:|
| <img height="40" src="https://skillicons.dev/icons?i=nextjs,ts,tailwind,react" /> | <img height="40" src="https://skillicons.dev/icons?i=nodejs,express,mongodb,js" /> | <img height="40" src="https://skillicons.dev/icons?i=gcp,python,pytorch,aws" /> |
| Next.js 16 (App Router)<br>TypeScript<br>Tailwind CSS<br>Framer Motion | Node.js<br>Express<br>MongoDB Atlas<br>Socket.io | Python<br>Gemini AI<br>FFMPEG<br>AWS S3 / Cloudinary |

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
