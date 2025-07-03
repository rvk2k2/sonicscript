# 🎧 SonicScript – Audio & Video Transcription Platform

SonicScript is a powerful, full-stack transcription platform that enables users to upload audio/video files and receive high-quality text transcriptions. It features real-time processing using OpenAI's Whisper model (self-hosted in Docker), Firebase-backed authentication, a dynamic credit system, and Stripe-powered payments — all wrapped in a sleek, user-friendly dashboard.

## 📋 Summary

SonicScript empowers users to:
- Upload audio/video files (MP3, M4A, MP4, WEBM)
- Automatically transcribe them using a self-hosted Whisper backend
- Manage transcription history
- Download transcripts in PDF or TXT formats
- Securely log in with Email or Google
- Track & manage transcription credits
- Purchase additional credits via Stripe

This project is ideal for developers looking to build scalable, production-grade transcription apps with serverless infrastructure and background job processing.

## 🚀 Features

-  Audio & Video file support (MP3, M4A, MP4, WEBM)
-  Self-hosted Whisper backend in Docker
-  Real-time transcription history & chat-style transcript viewer
-  Firebase Authentication (Email/Password + Google OAuth)
-  Username capture and editing
-  Dynamic credit system
  - 500 credits on signup
  - 130 credits deducted per transcription
  - Prevents transcription if insufficient balance
-  Stripe integration to purchase credits
-  Stripe webhook to securely update credits
-  Settings page to manage user profile
-  Forgot password support
-  Full account deletion (Auth + Firestore)

## 🛠️ Technologies Used

- **Frontend**: Next.js (App Router), Tailwind CSS
- **Backend**:
  - Firebase (Auth, Firestore, Storage)
  - BullMQ + Upstash Redis (Job queue)
  - FastAPI (Python) + Whisper (Docker container)
  - Stripe (Checkout + Webhook)
- **Other Tools**:
  - Axios, jsPDF
  - Firebase Admin SDK
  - dotenv, lucide-react

## 🧪 Installation & Setup

### Prerequisites
- Node.js (v18+)
- Docker
- Python 3.10+
- Firebase project
- Upstash Redis
- Stripe account

### 1. Clone the Repo
```bash
git clone https://github.com/your-username/sonicscript.git
cd sonicscript
```

### 2. Install Node Dependencies
```bash
npm install
```

### 3. Configure Environment
Create a `.env` file in the root directory:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
UPSTASH_REDIS_REST_URL=your_upstash_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_token
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
```

### 4. Run the Whisper Backend (Python)
```bash
cd whisper-backend
docker build -t whisper-api .
docker run -p 9000:9000 whisper-api
```

### 5. Run Redis Worker
```bash
node transcriber.js
```

### 6. Start the Next.js App
```bash
npm run dev
```

## 🏗️ Building for Production

```bash
npm run build
npm start
```

## 🗂️ Project Structure

```
sonicscript/
├── public/                     # Static assets
├── src/
│   ├── app/                    # App Router (Next.js pages)
│   │   ├── api/transcribe/     # API route for transcription jobs
│   │   ├── dashboard/          # Main dashboard UI
│   ├── components/             # Reusable components (Navbar, UploadForm, etc.)
│   ├── lib/                    # Firebase config, queue, download logic
├── whisper-backend/            # FastAPI + Whisper Docker backend
├── transcriber.js              # BullMQ worker (Node.js)
├── .env                        # Environment variables
├── package.json                # Node dependencies
└── README.md
```

## 🤝 Contributing

Feel free to fork the project and submit a pull request if you have any improvements!


## 📧 Support

For support or questions, please open an issue in the GitHub repository.

