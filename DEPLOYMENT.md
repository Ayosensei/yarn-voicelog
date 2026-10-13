# 🚀 Yarn (VoiceLog) — Deployment Guide

This guide details how to deploy **Yarn** to production using **Vercel** (Frontend) + **Render** (Backend) + **Supabase** (Database & Auth).

---

## 1. Supabase Setup (Database & Google OAuth)

1. **Database Schema**:
   - In Supabase SQL Editor, run [`database/01_schema.sql`](./database/01_schema.sql) if not already run.
   - Or run migration locally: `python database/migrate.py`

2. **Storage Bucket**:
   - Ensure a private bucket named `voice-memos` exists in Supabase Storage with maximum file upload limit set to 10MB.

3. **Google OAuth & Redirect URLs**:
   - In Supabase Dashboard, go to **Authentication** → **URL Configuration**.
   - **Site URL**: `https://<your-vercel-domain>.vercel.app` (or custom domain).
   - **Redirect URLs**: Add both of these:
     - `http://localhost:3000/auth/callback` (for local development)
     - `https://<your-vercel-domain>.vercel.app/auth/callback` (for production)
   - In Google Cloud Console, ensure the Authorized Redirect URI matches Supabase's OAuth callback (`https://<supabase-project-id>.supabase.co/auth/v1/callback`).

---

## 2. Backend Deployment (Render)

### Option A: Using Render Blueprints (Recommended)
1. Push the repo to GitHub.
2. In the Render Dashboard, click **New +** → **Blueprint**.
3. Select your GitHub repository. Render will automatically detect [`render.yaml`](./render.yaml).
4. Fill in the required environment variables:
   - `GEMINI_API_KEY`: Your Google Gemini API key.
   - `SUPABASE_URL`: `https://<your-project-id>.supabase.co`.
   - `SUPABASE_KEY`: Supabase `service_role` key (for backend database access).
   - `FERNET_SECRET_KEY`: 32-url-safe base64-encoded key (generate with `python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"`).
   - `FRONTEND_URL`: `https://<your-vercel-domain>.vercel.app` (can update after Vercel deployment).
   - `OPENAI_API_KEY`: *(Optional)* for Whisper audio upload fallback.

### Option B: Manual Web Service
- **Environment**: Python 3
- **Root Directory**: `backend`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Health Check Path**: `/health`

> [!TIP]
> **Free Tier Sleep Prevention:**
> Render's free web services sleep after 15 minutes of inactivity. To prevent cold starts for students, set up a free monitor on [UptimeRobot](https://uptimerobot.com) or [cron-job.org](https://cron-job.org) to ping `https://<your-render-service>.onrender.com/health` every 10–14 minutes between 7 AM and 8 PM.

---

## 3. Frontend Deployment (Vercel)

1. In Vercel Dashboard, click **Add New...** → **Project**.
2. Import your GitHub repository.
3. Configure project settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend` (Important: do not use repo root)
4. Add **Environment Variables**:
   | Variable | Value | Notes |
   |---|---|---|
   | `NEXT_PUBLIC_API_URL` | `https://<your-backend>.onrender.com` | Deployed Render backend URL |
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://<project-id>.supabase.co` | Supabase API URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `ey...` | Supabase public `anon` key |
5. Click **Deploy**.

---

## 4. Post-Deployment Verification Checklist

1. **Health Check**: Open `https://<backend>.onrender.com/health` in browser — should return `{"status": "healthy"}`.
2. **Landing Page**: Visit `https://<frontend>.vercel.app` — verify landing hero and PWA prompt load.
3. **Guest Session**: Click "Continue as guest without account" → enter test name → verify redirection to `/u/[uuid]`.
4. **Voice Recording / Voice AI**: Record or upload audio → verify Gemini transforms it into a daily log.
5. **Google OAuth**: Sign in with Google → verify guest logs merge and you are redirected to the user dashboard.
6. **Trash & Export**: Delete a log (verify "Moved to Trash" toast) and export remaining logs as Word and PDF.
