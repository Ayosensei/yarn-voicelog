-- Migration 04: Add faculty, grammar_level, and use_nigerian_lingo columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS faculty TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS grammar_level TEXT DEFAULT 'balanced';
ALTER TABLE users ADD COLUMN IF NOT EXISTS use_nigerian_lingo BOOLEAN DEFAULT TRUE;

-- Also add snapshots to logs table if users customize per log
ALTER TABLE logs ADD COLUMN IF NOT EXISTS grammar_level TEXT;
