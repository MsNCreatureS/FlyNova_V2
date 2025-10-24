-- Script de test pour la validation des PIREPs
-- Ce script crée des données de test pour tester la fonctionnalité

-- Assurez-vous d'avoir au moins :
-- - 1 utilisateur (pilote)
-- - 1 VA
-- - 1 route dans cette VA
-- - Le pilote doit être membre de la VA

-- Exemple d'insertion d'un vol complété avec rapport
-- Remplacez les valeurs par vos IDs réels

-- 1. Créer un vol (à adapter selon vos données)
INSERT INTO flights (user_id, va_id, route_id, fleet_id, flight_number, status, departure_time, arrival_time, reserved_at)
VALUES (
  1,                    -- user_id du pilote
  1,                    -- va_id
  1,                    -- route_id
  1,                    -- fleet_id (ou NULL)
  'FLY001',            -- flight_number
  'completed',         -- status
  '2025-10-24 10:00:00',  -- departure_time
  '2025-10-24 18:00:00',  -- arrival_time
  '2025-10-24 09:00:00'   -- reserved_at
);

-- Récupérer l'ID du vol créé
SET @flight_id = LAST_INSERT_ID();

-- 2. Créer un rapport de vol avec données télémétriques
INSERT INTO flight_reports (
  flight_id,
  validation_status,
  actual_departure_time,
  actual_arrival_time,
  flight_duration,
  distance_flown,
  fuel_used,
  landing_rate,
  telemetry_data,
  points_awarded,
  created_at
)
VALUES (
  @flight_id,
  'pending',
  '2025-10-24 10:05:00',
  '2025-10-24 17:55:00',
  470,                    -- 7h50 en minutes
  3625.50,                -- Distance en NM
  45000.00,               -- Fuel en lbs
  -125.50,                -- Landing rate en fpm
  '{
    "max_speed": 485,
    "max_altitude": 37000,
    "telemetry_points": [
      {"latitude": 48.8566, "longitude": 2.3522, "altitude": 0, "groundSpeed": 0, "timestamp": "2025-10-24T10:05:00Z", "fuel": 50000, "phase": "Preflight", "heading": 90, "onGround": true, "verticalSpeed": 0},
      {"latitude": 48.9566, "longitude": 2.4522, "altitude": 5000, "groundSpeed": 250, "timestamp": "2025-10-24T10:15:00Z", "fuel": 48000, "phase": "Climb", "heading": 95, "onGround": false, "verticalSpeed": 2000},
      {"latitude": 49.2566, "longitude": 2.8522, "altitude": 15000, "groundSpeed": 350, "timestamp": "2025-10-24T10:30:00Z", "fuel": 45000, "phase": "Climb", "heading": 100, "onGround": false, "verticalSpeed": 1800},
      {"latitude": 50.0566, "longitude": 4.0522, "altitude": 35000, "groundSpeed": 450, "timestamp": "2025-10-24T11:00:00Z", "fuel": 40000, "phase": "Cruise", "heading": 270, "onGround": false, "verticalSpeed": 100},
      {"latitude": 51.5566, "longitude": -0.1278, "altitude": 37000, "groundSpeed": 485, "timestamp": "2025-10-24T14:00:00Z", "fuel": 25000, "phase": "Cruise", "heading": 260, "onGround": false, "verticalSpeed": 0},
      {"latitude": 52.0566, "longitude": -10.0000, "altitude": 36000, "groundSpeed": 475, "timestamp": "2025-10-24T15:00:00Z", "fuel": 18000, "phase": "Cruise", "heading": 255, "onGround": false, "verticalSpeed": -50},
      {"latitude": 48.0000, "longitude": -30.0000, "altitude": 35000, "groundSpeed": 460, "timestamp": "2025-10-24T16:00:00Z", "fuel": 12000, "phase": "Cruise", "heading": 250, "onGround": false, "verticalSpeed": 0},
      {"latitude": 42.0000, "longitude": -55.0000, "altitude": 25000, "groundSpeed": 400, "timestamp": "2025-10-24T17:00:00Z", "fuel": 8000, "phase": "Descent", "heading": 245, "onGround": false, "verticalSpeed": -1500},
      {"latitude": 40.7128, "longitude": -74.0060, "altitude": 10000, "groundSpeed": 300, "timestamp": "2025-10-24T17:30:00Z", "fuel": 6000, "phase": "Approach", "heading": 240, "onGround": false, "verticalSpeed": -1200},
      {"latitude": 40.6413, "longitude": -73.7781, "altitude": 3000, "groundSpeed": 180, "timestamp": "2025-10-24T17:50:00Z", "fuel": 5500, "phase": "Landing", "heading": 235, "onGround": false, "verticalSpeed": -700},
      {"latitude": 40.6413, "longitude": -73.7781, "altitude": 0, "groundSpeed": 150, "timestamp": "2025-10-24T17:55:00Z", "fuel": 5000, "phase": "Taxi", "heading": 230, "onGround": true, "verticalSpeed": -125}
    ]
  }',
  0,                      -- points_awarded (0 car pending)
  NOW()
);

-- Vérifier les données créées
SELECT 
  fr.id,
  fr.flight_id,
  f.flight_number,
  f.status,
  fr.validation_status,
  fr.distance_flown,
  fr.landing_rate,
  fr.flight_duration
FROM flight_reports fr
JOIN flights f ON fr.flight_id = f.id
WHERE fr.id = LAST_INSERT_ID();

-- Note : Pour tester complètement, vous devrez :
-- 1. Avoir des aéroports dans la table airports avec les ICAO LFPG et KJFK
-- 2. Avoir une route qui correspond à ces aéroports
-- 3. Adapter les IDs user_id, va_id, route_id, fleet_id selon votre base de données
