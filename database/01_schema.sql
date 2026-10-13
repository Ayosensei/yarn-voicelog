-- database/01_schema.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table (UUID-based identification + Google Auth)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE, -- Supabase Auth user
    email TEXT UNIQUE,               -- From Google OAuth
    google_id TEXT UNIQUE,           -- Google sub/uid
    avatar_url TEXT,                 -- Google profile picture
    name TEXT NOT NULL,
    field_of_work TEXT,              -- e.g. "Civil Engineering - Highway Construction"
    custom_prompt TEXT,              -- User custom instructions for Gemini
    api_key_encrypted TEXT,          -- Encrypted BYOK Gemini/OpenAI key
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Daily Logs Table
CREATE TABLE IF NOT EXISTS logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    raw_transcript TEXT,             -- Nullified if marked confidential
    processed_output TEXT NOT NULL,  -- Structured SIWES logbook entry
    is_confidential BOOLEAN DEFAULT FALSE,
    audio_file_url TEXT,             -- Supabase Storage link (if uploaded)
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Custom Vocabulary Table
CREATE TABLE IF NOT EXISTS vocabulary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    term TEXT NOT NULL,              -- e.g., "Theodolite", "Slump Test", "CWSI"
    context TEXT,                    -- Usage description
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast query filtering
CREATE INDEX IF NOT EXISTS idx_logs_user_date ON logs(user_id, date);
CREATE INDEX IF NOT EXISTS idx_vocab_user ON vocabulary(user_id);
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocabulary ENABLE ROW LEVEL SECURITY;
