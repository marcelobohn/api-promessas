-- Add number column to candidates
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS number integer;