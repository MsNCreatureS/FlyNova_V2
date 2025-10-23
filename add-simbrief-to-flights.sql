-- Migration: Add SimBrief OFP ID to flights table
-- Date: 2025-10-23
-- Description: Adds simbrief_ofp_id column to flights table for storing SimBrief flight plan IDs

-- Add simbrief_ofp_id column if it doesn't exist
ALTER TABLE flights 
ADD COLUMN IF NOT EXISTS simbrief_ofp_id VARCHAR(50) NULL COMMENT 'SimBrief OFP ID for flight plan';

-- Add index for faster lookups
ALTER TABLE flights 
ADD INDEX IF NOT EXISTS idx_simbrief (simbrief_ofp_id);
