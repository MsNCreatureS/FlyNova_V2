-- Add simbrief_username column to users table
-- This allows users to save their SimBrief username for automatic flight plan generation

ALTER TABLE users 
ADD COLUMN simbrief_username VARCHAR(100) NULL 
AFTER username;

-- Add index for faster lookups
CREATE INDEX idx_simbrief_username ON users(simbrief_username);
