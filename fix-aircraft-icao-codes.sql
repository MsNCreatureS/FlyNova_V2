-- Script pour vérifier et corriger les codes ICAO dans la table va_fleet
-- Assurez-vous que la colonne aircraft_type contient des codes ICAO valides (B738, A320, etc.)

-- 1. Voir tous les avions dans votre flotte et leurs codes ICAO actuels
SELECT 
    id,
    va_id,
    registration,
    aircraft_type,
    aircraft_name
FROM va_fleet
ORDER BY va_id, aircraft_name;

-- 2. Exemples de mise à jour pour les codes ICAO courants
-- Décommentez et adaptez selon vos besoins

-- Boeing 737-800
-- UPDATE va_fleet SET aircraft_type = 'B738' WHERE aircraft_name LIKE '%737-800%' OR aircraft_name LIKE '%Boeing 737-800%';

-- Boeing 737-700
-- UPDATE va_fleet SET aircraft_type = 'B737' WHERE aircraft_name LIKE '%737-700%' OR aircraft_name LIKE '%Boeing 737-700%';

-- Airbus A320
-- UPDATE va_fleet SET aircraft_type = 'A320' WHERE aircraft_name LIKE '%A320%' OR aircraft_name LIKE '%Airbus A320%';

-- Airbus A321
-- UPDATE va_fleet SET aircraft_type = 'A321' WHERE aircraft_name LIKE '%A321%' OR aircraft_name LIKE '%Airbus A321%';

-- Airbus A319
-- UPDATE va_fleet SET aircraft_type = 'A319' WHERE aircraft_name LIKE '%A319%' OR aircraft_name LIKE '%Airbus A319%';

-- Boeing 777-300ER
-- UPDATE va_fleet SET aircraft_type = 'B77W' WHERE aircraft_name LIKE '%777-300%' OR aircraft_name LIKE '%Boeing 777-300%';

-- Boeing 787-9
-- UPDATE va_fleet SET aircraft_type = 'B789' WHERE aircraft_name LIKE '%787-9%' OR aircraft_name LIKE '%Boeing 787-9%';

-- Boeing 747-400
-- UPDATE va_fleet SET aircraft_type = 'B744' WHERE aircraft_name LIKE '%747-400%' OR aircraft_name LIKE '%Boeing 747-400%';

-- 3. Vérifier les avions avec des codes ICAO vides ou invalides
SELECT 
    id,
    registration,
    aircraft_type,
    aircraft_name
FROM va_fleet
WHERE aircraft_type IS NULL 
   OR aircraft_type = '' 
   OR LENGTH(aircraft_type) < 3
   OR LENGTH(aircraft_type) > 4;

-- 4. Table de référence des codes ICAO courants
/*
CODES ICAO COURANTS :

BOEING:
- B737 = Boeing 737-700
- B738 = Boeing 737-800
- B739 = Boeing 737-900
- B38M = Boeing 737 MAX 8
- B39M = Boeing 737 MAX 9
- B744 = Boeing 747-400
- B748 = Boeing 747-8
- B772 = Boeing 777-200
- B77W = Boeing 777-300ER
- B788 = Boeing 787-8
- B789 = Boeing 787-9

AIRBUS:
- A318 = Airbus A318
- A319 = Airbus A319
- A320 = Airbus A320
- A321 = Airbus A321
- A20N = Airbus A320neo
- A21N = Airbus A321neo
- A332 = Airbus A330-200
- A333 = Airbus A330-300
- A339 = Airbus A330-900neo
- A359 = Airbus A350-900
- A35K = Airbus A350-1000
- A388 = Airbus A380-800

AUTRES:
- E190 = Embraer E-190
- E195 = Embraer E-195
- CRJ9 = Bombardier CRJ-900
- DH8D = Dash 8-Q400
- AT72 = ATR 72
- AT76 = ATR 72-600

Pour une liste complète, consultez : https://www.icao.int/publications/DOC8643/
*/
