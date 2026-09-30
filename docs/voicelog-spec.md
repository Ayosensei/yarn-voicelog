# VoiceLog: Voice-to-Logbook PWA

## Technical Specification (Revised)

---

## 1. Project Overview

| Field | Value |
|-------|-------|
| **Name** | VoiceLog (working title) |
| **Type** | Progressive Web App (PWA) |
| **Purpose** | Multi-user voice-to-text logbook generator for SIWES students |
| **Users** | Multiple students, no formal auth (UUID-based identification) |
| **Data Sensitivity** | Academic + optional confidential mode |

---

## 2. Revised Tech Stack

| Component | Technology | Cost | Why |
|-----------|-----------|------|-----|
| **Frontend** | Next.js 14 (App Router) | Free (Vercel) | PWA support, fast deployment |
| **Backend** | FastAPI (Python) | Free (Render/Railway) | Async, Whisper processing, your challenge |
| **Database** | **Supabase** (PostgreSQL) | Free tier (500MB) | Managed DB, auth-ready, file storage |
| **STT (Primary)** | Web Speech API | Free | Browser-native, works on Chrome/Android |
| **STT (Fallback)** | OpenAI Whisper API | ~$0.006/min | When browser STT fails or file upload |
| **LLM** | **Google Gemini** (gemini-1.5-flash) | Free tier (15 RPM, 1500 req/day) | Fast, generous free tier |
| **LLM (User-provided)** | User's own Gemini/OpenAI key | User pays | BYOK (Bring Your Own Key) option |
| **File Storage** | Supabase Storage | Free tier (1GB) | Voice memos, exports |

**Hosting Strategy:**

- **Option A (Recommended):** Vercel (frontend) + Render (backend) + Supabase (DB)
- **Option B (Simple):** Railway (frontend + backend together) + Supabase
- **Option C (Free but fiddly):** Hugging Face Spaces (backend) + Vercel (frontend)

---

## 3. Database Schema (Supabase/PostgreSQL)

```sql
-- Users (no password, UUID-based)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    field_of_work TEXT,              -- "Thermal Imaging in Agriculture", etc.
    custom_prompt TEXT,              -- User's output style preferences
    api_key_encrypted TEXT,          -- Optional: user's own Gemini/OpenAI key
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily Logs
CREATE TABLE logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    raw_transcript TEXT,             -- What they actually said (deleted if confidential)
    processed_output TEXT,           -- Final logbook text
    is_confidential BOOLEAN DEFAULT FALSE,
    audio_file_url TEXT,             -- Supabase Storage URL (if uploaded)
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Custom Vocabulary (for better STT/LLM accuracy)
CREATE TABLE vocabulary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    term TEXT NOT NULL,              -- "CWSI", "FLIR", "canopy temperature"
    context TEXT,                    -- Optional usage note
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) Policies
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ADD CONSTRAINT user_isolation
    FOREIGN KEY (user_id) REFERENCES users(id);
```

**Supabase Setup:**

- Enable RLS on all tables
- Policy: Users can only access their own data (via UUID in URL)
- Storage bucket: `voice-memos` (private, 10MB max file size)

---

## 4. API Endpoints (FastAPI)

### User Management

```text
POST   /api/users              # Create user (name + field description)
GET    /api/users/{uuid}       # Get profile + custom prompt
PATCH  /api/users/{uuid}       # Update custom prompt, API key
```

### Logging

```text
POST   /api/logs               # Create new log entry
GET    /api/logs/{user_uuid}   # Get user's logs (with ?start_date&end_date filters)
GET    /api/logs/single/{id}   # Get single log
DELETE /api/logs/{id}          # Delete log
```

### Voice Processing (Core)

```text
POST   /api/process-voice      # Main endpoint
                               # Input: { user_uuid, audio_file OR transcript, use_own_key }
                               # Output: { processed_text, tokens_used }
```

### Vocabulary

```text
POST   /api/vocabulary                 # Add term
GET    /api/vocabulary/{user_uuid}     # Get user's terms (for STT priming)
DELETE /api/vocabulary/{id}            # Remove term
```

---

## 5. LLM Integration Strategy

### 5.1 Default: Server-Side Gemini (Free Tier)

- Model: `gemini-1.5-flash`
- Rate limits: 15 requests/min, 1500 requests/day (free tier)
- API key stored in backend env vars
- Provision for user keys: if the user provides their own Gemini API key, use it instead (higher limits)

### 5.2 BYOK (Bring Your Own Key)

- User pastes their Gemini API key in Settings
- Key encrypted with Fernet (Python `cryptography` library) before storing in Supabase
- When processing, backend decrypts and uses the user's key
- Benefit: user gets higher rate limits, project stays free for you

### 5.3 Fallback Chain

1. User's own Gemini key (if provided)
2. Server's Gemini key (free tier)
3. Error: "Daily limit reached. Please provide your own API key."

---

## 6. Prompt Engineering

### 6.1 Base System Prompt (Sent to Gemini)

```text
You are a logbook assistant for Nigerian SIWES students. Convert spoken notes into clear, simple logbook entries.

Rules:
- Use basic English. No fancy words or complex grammar.
- Write in past tense, first person.
- Be descriptive but concise (150-300 words).
- Structure: Date → Location → Activities → Tools/Equipment → Challenges → Next Steps
- If information is missing, use [brackets] as placeholders.
- Preserve technical terms exactly as spoken.
- Do not invent details not mentioned.
```

### 6.2 User Custom Prompt (Editable in Settings)

Example for thermal imaging:

```text
Focus on: experimental setup, crop conditions, equipment calibration.
Always include: ambient temperature, humidity, number of samples.
Tone: Professional but simple, like explaining to a colleague.
Avoid: Speculation, opinions on results.
```

### 6.3 Dynamic Vocabulary Injection

The user's custom terms get injected into the prompt:

```text
Technical terms to preserve: CWSI, stomatal conductance, FLIR E8-XT,
emissivity, Valencia oranges, plantain bunch, canopy temperature
```

---

## 7. Core Workflows

### 7.1 First-Time Setup

1. User opens link → enters name + describes their field
2. System generates a default custom prompt based on the field description
3. User can edit the prompt, add vocabulary terms, and optionally add their own Gemini API key

### 7.2 Daily Logging (Browser STT - Primary)

1. User clicks "New Log" → browser requests mic permission
2. User speaks: *"Today I went to the orange orchard at 9am, set up the FLIR camera, took canopy temperature readings on 20 trees..."*
3. Web Speech API streams text to the frontend (interim + final results)
4. Frontend sends `{ user_uuid, transcript }` to `/api/process-voice`
5. Backend:
   - Fetches the user's custom prompt + vocabulary from Supabase
   - Constructs the full prompt (system + user custom + vocabulary + transcript)
   - Calls the Gemini API (user's key or server key)
   - Returns the processed logbook text
6. User reviews, edits if needed, saves to Supabase

### 7.3 Daily Logging (File Upload - Fallback)

1. User records a voice memo on their phone (offline)
2. Uploads MP3/M4A to the site
3. Backend sends it to the OpenAI Whisper API with vocabulary priming
4. Whisper returns a transcript → sent to Gemini as above
5. Audio file deleted after processing (or kept if the user wants)

### 7.4 Confidential Mode

Toggle switch: "Mark as confidential". If enabled:

- Audio file deleted immediately after transcription
- Raw transcript not stored in Supabase
- Only processed output saved
- Log excluded from export features

---

## 8. Frontend Pages (Next.js)

| Route | Purpose |
|-------|---------|
| `/` | Landing + user creation/join |
| `/u/[uuid]` | User dashboard (list of logs, "New Log" button) |
| `/u/[uuid]/log/new` | Voice recording interface |
| `/u/[uuid]/log/[id]` | View/edit single log |
| `/u/[uuid]/settings` | Custom prompt editor, vocabulary manager, API key input |
| `/u/[uuid]/export` | Download all logs as Word/PDF |

**PWA Features:**

- `manifest.json` for installability
- Service worker for app shell caching
- Microphone permission handling
- Audio recording with MediaRecorder API (fallback to file upload)

---

## 9. Security & Privacy

| Concern | Solution |
|---------|----------|
| No auth | UUID-based URLs (e.g., `/u/a1b2c3d4-e5f6...`). "Security through obscurity" acceptable for low-stakes academic logs. |
| API key storage | User keys encrypted with Fernet, stored in Supabase. Server key in env vars. |
| Confidential data | Toggle deletes raw audio + transcript immediately after processing. |
| RLS | Supabase Row Level Security ensures users can only read/write their own data. |
| CORS | Backend restricts to your frontend domain. |

---

## 10. Implementation Phases

### Phase 1: MVP (Week 1-2)

- [ ] Supabase project setup (tables, RLS, storage bucket)
- [ ] FastAPI backend with basic endpoints
- [ ] Gemini integration (server key)
- [ ] Next.js frontend with Web Speech API
- [ ] Simple log CRUD
- [ ] Deploy to Vercel + Render

### Phase 2: Customization (Week 3)

- [ ] User profiles with field descriptions
- [ ] Custom prompt editor
- [ ] Vocabulary management
- [ ] File upload + Whisper fallback
- [ ] BYOK (user API keys)

### Phase 3: Polish (Week 4)

- [ ] PWA setup (manifest, service worker)
- [ ] Export to Word/PDF
- [ ] Confidential mode
- [ ] UI/UX refinement
- [ ] Error handling (rate limits, mic permissions)

---

## 11. Cost Estimate (Monthly)

| Item | Usage | Cost |
|------|-------|------|
| Vercel | 1 frontend app | $0 |
| Render | 1 web service | $0 |
| Supabase | 500MB DB + 1GB storage | $0 |
| Gemini API | 1500 req/day free tier | $0 (or user's own key) |
| OpenAI Whisper | ~30 mins audio/month (fallback) | ~$0.18 |
| **Total** | | **<$0.20/month** (or $0 if users bring own keys) |

---

## 12. Future Enhancements

- Image attachment (link thermal photos to log entries)
- Weekly auto-compilation into summary report
- Supervisor view (read-only access to student's logs)
- Multi-language support (Hausa, Igbo, Yoruba voice input)
- Mobile app (React Native/Expo) using the same backend
- Template library (different logbook formats for different schools)

---

## 13. Key Decisions Summary

| Decision | Rationale |
|----------|-----------|
| Supabase over SQLite | Managed PostgreSQL, RLS, storage, auth-ready. Free tier sufficient. |
| Gemini over GPT-4o-mini | Generous free tier (1500 req/day vs $0.15/1M tokens). BYOK option removes rate limits. |
| Separate hosting | Vercel (frontend) + Render (backend) is standard, but Railway can combine them. |
| UUID-based access | No passwords to manage. Acceptable for low-stakes academic data. |
| Browser STT primary | Free, fast, works offline-ish. Whisper only for file uploads. |
