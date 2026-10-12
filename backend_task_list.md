# 🧶 Yarn VoiceLog — Backend Task List
### Bobby & Goodness | Python (FastAPI)
**Last Updated:** 2 October 2026

---

## 📌 What Is This Project?

**Yarn** is a voice-to-logbook app for Nigerian SIWES students.
A student speaks into their phone about their day, and our Python backend sends that speech to **Google Gemini AI**, which transforms it into a clean, formal logbook entry.

**Our job = Build the Python backend that powers everything behind the scenes.**

---

## 🏗️ How the System Works (Simple Version)

```
Student speaks → Frontend sends text to our backend → We call Gemini AI → 
Gemini returns a formatted logbook entry → We save it to the database → 
Frontend displays the clean entry to the student
```

---

## 📂 Our Workspace

We work **only** inside the `backend/` folder of the repo.
- ❌ Do NOT touch `frontend/` (Ayosensei's territory)
- ❌ Do NOT touch `database/` (Femi's territory)
- ✅ Everything inside `backend/` is ours

---

## 🗂️ Backend Folder Structure (What We'll Build)

```
backend/
├── main.py                 # FastAPI app — the "front door" of our backend
├── config.py               # Environment variables (API keys, DB credentials)
├── models.py               # Pydantic schemas (what data looks like coming in/out)
├── routers/
│   ├── users.py            # User endpoints (create, read, update)
│   ├── logs.py             # Log endpoints (create, read, delete)
│   ├── vocabulary.py       # Vocabulary endpoints (add, list, delete)
│   └── voice.py            # The AI voice processing endpoint
├── services/
│   ├── gemini_service.py   # Talk to Google Gemini API
│   ├── whisper_service.py  # Talk to OpenAI Whisper (audio fallback)
│   ├── prompt_builder.py   # Assemble the AI prompt dynamically
│   └── encryption.py       # Encrypt/decrypt user API keys (Fernet)
├── .env                    # Secret keys (NEVER pushed to GitHub)
├── .env.example            # Template showing what keys are needed
└── requirements.txt        # Already exists — list of Python libraries
```

---

## ✅ Full Task Checklist

### Phase 1: Foundation & Setup
- [x] Create our own Git branch (`backend-bobby`)
- [x] Create `main.py` with FastAPI app + CORS middleware
- [x] Create `config.py` for environment variables
- [x] Create `models.py` with Pydantic data schemas
- [x] Create `.env.example` with placeholder keys
- [x] Install all dependencies from `requirements.txt`

### Phase 2: Endpoints (CRUD — Create, Read, Update, Delete)

**Users:**
| Method | Endpoint | What It Does |
|--------|----------|-------------|
| `POST` | `/api/users` | Create a new student (name + field of work) |
| `GET` | `/api/users/{uuid}` | Get a student's profile |
| `PATCH` | `/api/users/{uuid}` | Update their custom prompt or API key |

**Logs:**
| Method | Endpoint | What It Does |
|--------|----------|-------------|
| `POST` | `/api/logs` | Save a new logbook entry |
| `GET` | `/api/logs/{user_uuid}` | Get all logs for a student (with date filters) |
| `GET` | `/api/logs/single/{id}` | Get one specific log |
| `DELETE` | `/api/logs/{id}` | Delete a log |

**Vocabulary:**
| Method | Endpoint | What It Does |
|--------|----------|-------------|
| `POST` | `/api/vocabulary` | Add a technical term (e.g., "Oscilloscope") |
| `GET` | `/api/vocabulary/{user_uuid}` | List all of a student's saved terms |
| `DELETE` | `/api/vocabulary/{id}` | Remove a term |

### Phase 3: The AI Engine

- [x] Build `prompt_builder.py` — assembles the full prompt:
  - Base SIWES system prompt (logbook format rules)
  - + User's custom instructions (field-specific)
  - + User's vocabulary terms (technical jargon)
  - + The raw spoken transcript
- [x] Build `gemini_service.py` — sends prompt to Google Gemini 1.5 Flash
- [x] Build `POST /api/process-voice` endpoint that ties it all together
- [x] Support **BYOK** (use student's own API key if provided)
- [x] Build `whisper_service.py` — if student uploads an audio file, transcribe it with Whisper first

### Phase 4: Security & Polish

- [x] Build `encryption.py` — Fernet encrypt/decrypt for stored API keys
- [x] Implement **Confidential Mode** — delete raw transcript & audio when toggled
- [x] Error handling for rate limits, missing data, bad requests
- [x] Test all endpoints using FastAPI's built-in `/docs` page

---

## 🔥 What We Can Do TODAY (No Supabase, No Frontend Needed)

> [!TIP]
> We don't need to wait for Femi's database or Ayosensei's frontend.
> FastAPI has a built-in interactive test page at `http://localhost:8000/docs`
> that lets us test every endpoint right in the browser!

### TODAY's Game Plan:

**Step 1 — Project Setup (15 mins)**
- [x] Clone the repo ✅ (already done)
- [x] Create our Git branch
- [x] Create `main.py` — a basic FastAPI app that runs
- [x] Create `config.py` and `.env.example`
- [x] Create `models.py` — define what our data looks like

**Step 2 — Build the AI Core (30-45 mins)**
This is the heart of the entire project and needs ZERO database:
- [x] Get a free **Google Gemini API key** from [Google AI Studio](https://aistudio.google.com/apikey)
- [x] Create `gemini_service.py` — a simple function that sends text to Gemini and gets a response
- [x] Create `prompt_builder.py` — builds the SIWES logbook prompt from parts
- [x] Create `POST /api/process-voice` — the main endpoint
- [x] **Test it!** Send a fake spoken paragraph and see Gemini return a clean logbook entry

**Step 3 — Stub the CRUD endpoints (20 mins)**
While waiting for Supabase credentials from Femi, we can build the endpoints
using **fake in-memory data** (a Python list). When Femi delivers the database
keys, we just swap out the storage layer:
- [x] `POST /api/users` → stores in a Python dict for now
- [x] `GET /api/users/{uuid}` → reads from the dict
- [x] Same pattern for logs and vocabulary

---

## 🔑 Keys & Accounts We Need

| What | Where to Get It | Cost | Status |
|------|----------------|------|--------|
| Google Gemini API Key | [Google AI Studio](https://aistudio.google.com/apikey) | Free (1500 req/day) | ⬜ Need to get |
| Supabase URL + Key | From Femi (Person C) | Free | ⬜ Waiting on Femi |
| OpenAI API Key (Whisper) | [OpenAI Platform](https://platform.openai.com) | ~$0.006/min | ⬜ Optional / Later |

---

## 💡 Key Concepts Cheat Sheet

| Term | Plain English |
|------|--------------|
| **FastAPI** | A Python library that lets you build web APIs. It's just `pip install fastapi`. |
| **Endpoint** | A URL that does something when you visit it (e.g., `/api/users` creates a user). |
| **CRUD** | Create, Read, Update, Delete — the 4 basic things you do with data. |
| **UUID** | A random 36-character ID like `c1a29f84-7e3b-4892-91d1-6b83f064a32e`. Used instead of passwords. |
| **Pydantic** | A Python library that validates data. "Did the user send a `name` field? Is it a string?" |
| **CORS** | A security setting that tells the browser "yes, the frontend is allowed to talk to this backend." |
| **Uvicorn** | The server that actually runs FastAPI and listens for web traffic. |
| **BYOK** | "Bring Your Own Key" — students can optionally use their own Gemini API key for higher limits. |
| **Fernet** | An encryption method from Python's `cryptography` library. Used to safely store API keys. |
| **Supabase** | A cloud database service (PostgreSQL). Femi sets it up, we just connect to it. |
| **Whisper** | OpenAI's speech-to-text AI. Used as a fallback when the browser can't do voice recognition. |

---

## 👥 Team Roles Reminder

| Person | Role | Territory |
|--------|------|-----------|
| **Ayosensei** | Frontend (Next.js) | `frontend/` folder |
| **Bobby & Goodness** | Backend (Python/FastAPI) | `backend/` folder |
| **Femi** | Database & Integration (Supabase) | `database/` folder + Supabase dashboard |

---

> [!IMPORTANT]
> **Golden Rule:** We only write code inside `backend/`. We never modify files in `frontend/` or `database/`.
