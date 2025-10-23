-- Add trigger to automatically update event status based on dates
-- This trigger fires BEFORE SELECT on events table

-- First, let's add a stored procedure to update event statuses
DELIMITER $$

DROP PROCEDURE IF EXISTS update_event_statuses$$

CREATE PROCEDURE update_event_statuses()
BEGIN
    -- Set status to 'active' for events that should be active now
    UPDATE events 
    SET status = 'active'
    WHERE start_date <= NOW() 
      AND end_date >= NOW()
      AND status = 'upcoming';
    
    -- Set status to 'completed' for events that have ended
    UPDATE events 
    SET status = 'completed'
    WHERE end_date < NOW()
      AND status IN ('active', 'upcoming');
END$$

DELIMITER ;

-- Call the procedure once to update existing events
CALL update_event_statuses();

-- Schedule the procedure to run every minute (requires EVENT scheduler to be enabled)
-- First enable the event scheduler
SET GLOBAL event_scheduler = ON;

-- Create the scheduled event
DROP EVENT IF EXISTS auto_update_event_statuses;

CREATE EVENT auto_update_event_statuses
ON SCHEDULE EVERY 1 MINUTE
DO
  CALL update_event_statuses();

-- Show the scheduled events
SHOW EVENTS;

-- Verify event scheduler is running
SHOW VARIABLES LIKE 'event_scheduler';

-- Manual check: Show current event statuses
SELECT 
    id,
    va_id,
    name,
    event_type,
    start_date,
    end_date,
    status,
    CASE 
        WHEN start_date > NOW() THEN 'SHOULD BE: upcoming'
        WHEN start_date <= NOW() AND end_date >= NOW() THEN 'SHOULD BE: active'
        WHEN end_date < NOW() THEN 'SHOULD BE: completed'
    END as correct_status
FROM events
ORDER BY va_id, start_date DESC;
