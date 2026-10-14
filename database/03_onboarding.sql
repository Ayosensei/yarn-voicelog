-- database/03_onboarding.sql
-- Adds department, institution, and is_onboarded to users table

ALTER TABLE users
ADD COLUMN IF NOT EXISTS department TEXT,
ADD COLUMN IF NOT EXISTS institution TEXT,
ADD COLUMN IF NOT EXISTS is_onboarded BOOLEAN DEFAULT FALSE;
