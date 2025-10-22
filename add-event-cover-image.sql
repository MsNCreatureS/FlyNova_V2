-- Ajouter la colonne cover_image à la table events

ALTER TABLE events 
ADD COLUMN cover_image VARCHAR(255) AFTER event_type;

-- Vérifier la structure
DESCRIBE events;
