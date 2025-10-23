-- Create test active event
-- Replace va_id=1 with your actual VA ID
-- Replace created_by=1 with your actual user ID

-- Insert a test event that is active RIGHT NOW
INSERT INTO events (
    va_id, 
    name, 
    description, 
    event_type, 
    start_date, 
    end_date, 
    bonus_points, 
    created_by, 
    status
)
VALUES (
    1,  -- Change this to your VA ID
    'Test Active Event',
    'This is a test event that should be visible immediately',
    'special_event',
    DATE_SUB(NOW(), INTERVAL 1 DAY),  -- Started yesterday
    DATE_ADD(NOW(), INTERVAL 7 DAY),  -- Ends in 7 days
    100,
    1,  -- Change this to your user ID
    'active'  -- Explicitly set to active
);

-- Verify the event was created
SELECT 
    id,
    va_id,
    name,
    event_type,
    start_date,
    end_date,
    status,
    CASE 
        WHEN start_date <= NOW() AND end_date >= NOW() THEN '✅ ACTIVE NOW'
        WHEN start_date > NOW() THEN '⏰ UPCOMING'
        WHEN end_date < NOW() THEN '✔️ COMPLETED'
    END as should_be_status
FROM events
WHERE va_id = 1  -- Change to your VA ID
ORDER BY created_at DESC
LIMIT 5;
