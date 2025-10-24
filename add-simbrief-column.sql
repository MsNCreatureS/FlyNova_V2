-- Add simbrief_ofp_id column to flights table if not exists
ALTER TABLE `flights` 
ADD COLUMN IF NOT EXISTS `simbrief_ofp_id` VARCHAR(50) DEFAULT NULL AFTER `fleet_id`,
ADD INDEX IF NOT EXISTS `idx_simbrief` (`simbrief_ofp_id`);
