# 🤖 GitHub PR Review Bot Platform

A full-stack application to configure and run **automated GitHub Pull Request review bots**.

The system listens to GitHub PR events, fetches code changes, converts them into AI-friendly input, evaluates them, and stores structured review results — all managed via a modern web dashboard.

---

## 🧱 Tech Stack

**Backend**
- Django
- Django REST Framework
- PostgreSQL
- GitHub App (Webhooks + REST API)

**Frontend**
- React
- Vite
- Tailwind CSS

---

## ✨ Features

- Create, update, list, and soft-delete bots
- Configure bot prompts and repository scope
- GitHub App webhook integration
- Fetch PR diffs and changed files
- Convert PR changes into AI-ready text
- Store evaluation scores and comments
- Production-grade UI with Tailwind
- PostgreSQL-backed persistence

## ⚙️ Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 14+
- Git
- GitHub account

---

## 🐘 Backend Setup

### Clone repository
git clone <repository-url>
cd github_bot/backend

### Create virtual environment
python -m venv env
env\Scripts\activate

### Install dependencies
pip install -r requirements.txt

### Environment variables (.env)
Fill environment variables following .env.example

### Create database
CREATE DATABASE github_bot;

### Run migrations
python manage.py migrate

### Start backend
python manage.py runserver

Backend runs at http://localhost:8000

---

## 🔗 GitHub App Setup

1. Create a GitHub App in Developer Settings
2. Enable permissions:
   - Pull requests: Read & Write
   - Issues: Read & Write
   - Metadata: Read
3. Subscribe to Pull request events
4. Generate private key (.pem)
5. Install app on repository

### Local webhook forwarding
npx smee -u https://smee.io/new -t http://localhost:8000/webhook/github/

---

## 🎨 Frontend Setup

### Move to frontend
cd ../frontend

### Install dependencies
npm install

### Start frontend
npm run dev

Frontend runs at http://localhost:5173

---

## 🔌 API Endpoints

GET    /api/bots/  
POST   /api/bots/  
PUT    /api/bots/{id}/  
PATCH  /api/bots/{id}/  
DELETE /api/bots/{id}/  
POST   /webhook/github/

---

## 🧠 How It Works

1. PR opened on GitHub
2. Webhook received by Django
3. Signature verified
4. PR diff and file changes fetched
5. Changes converted to AI input
6. Evaluation stored as BotLog
7. UI displays bot data

