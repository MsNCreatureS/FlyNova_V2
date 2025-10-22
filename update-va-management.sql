-- Modifications pour la gestion VA - Nettoyage de la table va_routes

-- 1. Supprimer d'abord les contraintes de clés étrangères
ALTER TABLE va_routes 
DROP FOREIGN KEY va_routes_ibfk_1,
DROP FOREIGN KEY va_routes_ibfk_2,
DROP FOREIGN KEY va_routes_ibfk_3;

-- 2. Maintenant supprimer les anciennes colonnes qui ne sont plus utilisées
ALTER TABLE va_routes 
DROP COLUMN departure_airport_id,
DROP COLUMN arrival_airport_id,
DROP COLUMN aircraft_id,
DROP COLUMN distance,
DROP COLUMN duration;

-- 3. Vérifier la structure finale de la table va_routes
DESCRIBE va_routes;

-- La table devrait maintenant avoir uniquement ces colonnes :
-- - id (int, PK)
-- - va_id (int)
-- - flight_number (varchar 20)
-- - route_type (ENUM: Civil, Cargo, Private)
-- - departure_icao (varchar 4)
-- - departure_name (varchar 255)
-- - arrival_icao (varchar 4)
-- - arrival_name (varchar 255)
-- - aircraft_type (varchar 50)
-- - status (ENUM: active, inactive, seasonal)
-- - created_at (timestamp)
