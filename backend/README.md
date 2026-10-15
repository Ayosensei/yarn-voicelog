# ⚙️ Yarn Backend (FastAPI)

This directory contains the [FastAPI](https://fastapi.tiangolo.com/) REST backend for **Yarn**, handling AI log generation with Google Gemini, audio transcription fallbacks with Whisper, and document export (Word .docx and PDF).

For full project documentation and system architecture, see the [Root README](../README.md).

---

## 🚀 Quick Start

### 1. Set Up Virtual Environment

```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables

```bash
cp .env.example .env
```

Populate the required keys in `.env`:
* `GEMINI_API_KEY`: Free key from [Google AI Studio](https://aistudio.google.com/apikey).
* `SUPABASE_URL`: Supabase project URL.
* `SUPABASE_KEY`: Supabase `anon` or `service_role` key.
* `FRONTEND_URL`: Allowed CORS origin (e.g. `http://localhost:3000`).

### 4. Run Server

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Health check: [http://localhost:8000/health](http://localhost:8000/health)  
Interactive API Docs (Swagger): [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🧪 Running Tests

```bash
pytest tests/ -v
```
