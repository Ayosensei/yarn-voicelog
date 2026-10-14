-- database/02_training_programs.sql
-- Adds training_type and log_length_lines to the users table
-- training_type: 'swep' (Part 2), 'siwes' (Part 3), 'it' (Part 4)
-- log_length_lines: target line constraint (e.g. '2-3', '2-4', '5-6', or custom count)

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS training_type TEXT DEFAULT 'siwes',
ADD COLUMN IF NOT EXISTS log_length_lines TEXT DEFAULT '2-3';

-- Also add to logs table in case we want to preserve historical program context for each entry
ALTER TABLE logs
ADD COLUMN IF NOT EXISTS training_type TEXT,
ADD COLUMN IF NOT EXISTS log_length_lines TEXT;
