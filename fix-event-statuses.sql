-- Fix event statuses based on dates
-- This script automatically updates event statuses based on current date

-- Set status to 'active' for events that are currently running
UPDATE events 
SET status = 'active'
WHERE start_date <= NOW() 
  AND end_date >= NOW()
  AND status IN ('upcoming', 'completed');

-- Set status to 'upcoming' for events that haven't started yet
UPDATE events 
SET status = 'upcoming'
WHERE start_date > NOW()
  AND status NOT IN ('cancelled');

-- Set status to 'completed' for events that have ended
UPDATE events 
SET status = 'completed'
WHERE end_date < NOW()
  AND status NOT IN ('cancelled');

-- Show all events with their current status
SELECT 
    id,
    va_id,
    name,
    event_type,
    start_date,
    end_date,
    status,
    CASE 
        WHEN start_date > NOW() THEN 'UPCOMING'
        WHEN start_date <= NOW() AND end_date >= NOW() THEN 'ACTIVE NOW'
        WHEN end_date < NOW() THEN 'ENDED'
    END as calculated_status
FROM events
ORDER BY va_id, start_date DESC;
