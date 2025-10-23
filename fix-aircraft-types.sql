-- Fix aircraft_type values in va_fleet table
-- This script updates full aircraft names to their ICAO codes

-- Update common aircraft types based on aircraft_name field
UPDATE va_fleet 
SET aircraft_type = 
    CASE 
        -- Airbus A320 Family
        WHEN aircraft_name LIKE '%A320neo%' OR aircraft_type LIKE '%A320neo%' THEN 'A20N'
        WHEN aircraft_name LIKE '%A321neo%' OR aircraft_type LIKE '%A321neo%' THEN 'A21N'
        WHEN aircraft_name LIKE '%A319neo%' OR aircraft_type LIKE '%A319neo%' THEN 'A19N'
        WHEN aircraft_name LIKE '%A320%' OR aircraft_type LIKE '%A320%' THEN 'A320'
        WHEN aircraft_name LIKE '%A321%' OR aircraft_type LIKE '%A321%' THEN 'A321'
        WHEN aircraft_name LIKE '%A319%' OR aircraft_type LIKE '%A319%' THEN 'A319'
        WHEN aircraft_name LIKE '%A318%' OR aircraft_type LIKE '%A318%' THEN 'A318'
        
        -- Airbus A330 Family
        WHEN aircraft_name LIKE '%A330-300%' OR aircraft_type LIKE '%A330-300%' THEN 'A333'
        WHEN aircraft_name LIKE '%A330-200%' OR aircraft_type LIKE '%A330-200%' THEN 'A332'
        WHEN aircraft_name LIKE '%A330-900%' OR aircraft_type LIKE '%A330-900%' THEN 'A339'
        WHEN aircraft_name LIKE '%A330-800%' OR aircraft_type LIKE '%A330-800%' THEN 'A338'
        
        -- Airbus A340 Family
        WHEN aircraft_name LIKE '%A340-600%' OR aircraft_type LIKE '%A340-600%' THEN 'A346'
        WHEN aircraft_name LIKE '%A340-500%' OR aircraft_type LIKE '%A340-500%' THEN 'A345'
        WHEN aircraft_name LIKE '%A340-300%' OR aircraft_type LIKE '%A340-300%' THEN 'A343'
        WHEN aircraft_name LIKE '%A340-200%' OR aircraft_type LIKE '%A340-200%' THEN 'A342'
        
        -- Airbus A350 Family
        WHEN aircraft_name LIKE '%A350-1000%' OR aircraft_type LIKE '%A350-1000%' THEN 'A35K'
        WHEN aircraft_name LIKE '%A350-900%' OR aircraft_type LIKE '%A350-900%' THEN 'A359'
        
        -- Airbus A380
        WHEN aircraft_name LIKE '%A380%' OR aircraft_type LIKE '%A380%' THEN 'A388'
        
        -- Boeing 737 Family
        WHEN aircraft_name LIKE '%737-800%' OR aircraft_type LIKE '%737-800%' THEN 'B738'
        WHEN aircraft_name LIKE '%737-900%' OR aircraft_type LIKE '%737-900%' THEN 'B739'
        WHEN aircraft_name LIKE '%737-700%' OR aircraft_type LIKE '%737-700%' THEN 'B737'
        WHEN aircraft_name LIKE '%737 MAX 8%' OR aircraft_type LIKE '%737 MAX 8%' THEN 'B38M'
        WHEN aircraft_name LIKE '%737 MAX 9%' OR aircraft_type LIKE '%737 MAX 9%' THEN 'B39M'
        WHEN aircraft_name LIKE '%737 MAX 10%' OR aircraft_type LIKE '%737 MAX 10%' THEN 'B3XM'
        WHEN aircraft_name LIKE '%737%' THEN 'B737'
        
        -- Boeing 747 Family
        WHEN aircraft_name LIKE '%747-8%' OR aircraft_type LIKE '%747-8%' THEN 'B748'
        WHEN aircraft_name LIKE '%747-400%' OR aircraft_type LIKE '%747-400%' THEN 'B744'
        WHEN aircraft_name LIKE '%747%' THEN 'B747'
        
        -- Boeing 757 Family
        WHEN aircraft_name LIKE '%757-300%' OR aircraft_type LIKE '%757-300%' THEN 'B753'
        WHEN aircraft_name LIKE '%757-200%' OR aircraft_type LIKE '%757-200%' THEN 'B752'
        WHEN aircraft_name LIKE '%757%' THEN 'B757'
        
        -- Boeing 767 Family
        WHEN aircraft_name LIKE '%767-400%' OR aircraft_type LIKE '%767-400%' THEN 'B764'
        WHEN aircraft_name LIKE '%767-300%' OR aircraft_type LIKE '%767-300%' THEN 'B763'
        WHEN aircraft_name LIKE '%767-200%' OR aircraft_type LIKE '%767-200%' THEN 'B762'
        WHEN aircraft_name LIKE '%767%' THEN 'B767'
        
        -- Boeing 777 Family
        WHEN aircraft_name LIKE '%777-300ER%' OR aircraft_type LIKE '%777-300ER%' THEN 'B77W'
        WHEN aircraft_name LIKE '%777-300%' OR aircraft_type LIKE '%777-300%' THEN 'B773'
        WHEN aircraft_name LIKE '%777-200LR%' OR aircraft_type LIKE '%777-200LR%' THEN 'B77L'
        WHEN aircraft_name LIKE '%777-200ER%' OR aircraft_type LIKE '%777-200ER%' THEN 'B77E'
        WHEN aircraft_name LIKE '%777-200%' OR aircraft_type LIKE '%777-200%' THEN 'B772'
        WHEN aircraft_name LIKE '%777-9%' OR aircraft_type LIKE '%777-9%' THEN 'B779'
        WHEN aircraft_name LIKE '%777-8%' OR aircraft_type LIKE '%777-8%' THEN 'B778'
        WHEN aircraft_name LIKE '%777%' THEN 'B777'
        
        -- Boeing 787 Family
        WHEN aircraft_name LIKE '%787-10%' OR aircraft_type LIKE '%787-10%' THEN 'B78X'
        WHEN aircraft_name LIKE '%787-9%' OR aircraft_type LIKE '%787-9%' THEN 'B789'
        WHEN aircraft_name LIKE '%787-8%' OR aircraft_type LIKE '%787-8%' THEN 'B788'
        WHEN aircraft_name LIKE '%787%' THEN 'B787'
        
        -- Embraer Family
        WHEN aircraft_name LIKE '%E190%' OR aircraft_type LIKE '%E190%' THEN 'E190'
        WHEN aircraft_name LIKE '%E195%' OR aircraft_type LIKE '%E195%' THEN 'E195'
        WHEN aircraft_name LIKE '%E170%' OR aircraft_type LIKE '%E170%' THEN 'E170'
        WHEN aircraft_name LIKE '%E175%' OR aircraft_type LIKE '%E175%' THEN 'E175'
        
        -- CRJ Family
        WHEN aircraft_name LIKE '%CRJ-200%' OR aircraft_type LIKE '%CRJ-200%' THEN 'CRJ2'
        WHEN aircraft_name LIKE '%CRJ-700%' OR aircraft_type LIKE '%CRJ-700%' THEN 'CRJ7'
        WHEN aircraft_name LIKE '%CRJ-900%' OR aircraft_type LIKE '%CRJ-900%' THEN 'CRJ9'
        WHEN aircraft_name LIKE '%CRJ-1000%' OR aircraft_type LIKE '%CRJ-1000%' THEN 'CRJX'
        
        -- ATR Family
        WHEN aircraft_name LIKE '%ATR 72%' OR aircraft_type LIKE '%ATR 72%' THEN 'AT72'
        WHEN aircraft_name LIKE '%ATR 42%' OR aircraft_type LIKE '%ATR 42%' THEN 'AT42'
        
        -- Dash 8 Family
        WHEN aircraft_name LIKE '%Dash 8-400%' OR aircraft_type LIKE '%Dash 8-400%' THEN 'DH8D'
        WHEN aircraft_name LIKE '%Dash 8-300%' OR aircraft_type LIKE '%Dash 8-300%' THEN 'DH8C'
        WHEN aircraft_name LIKE '%Dash 8%' OR aircraft_type LIKE '%Dash 8%' THEN 'DH8D'
        WHEN aircraft_name LIKE '%Q400%' OR aircraft_type LIKE '%Q400%' THEN 'DH8D'
        
        ELSE aircraft_type
    END
WHERE 
    -- Only update rows where aircraft_type is not already a valid ICAO code (typically 3-5 characters)
    LENGTH(aircraft_type) > 6
    OR aircraft_type LIKE '%Airbus%'
    OR aircraft_type LIKE '%Boeing%'
    OR aircraft_type LIKE '%Embraer%';

-- Show the results
SELECT 
    registration,
    aircraft_type,
    aircraft_name,
    home_airport,
    status
FROM va_fleet
ORDER BY va_id, registration;
