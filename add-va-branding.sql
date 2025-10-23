-- Ajouter les colonnes de branding pour les compagnies virtuelles
ALTER TABLE virtual_airlines 
ADD COLUMN primary_color VARCHAR(7) DEFAULT '#00c853' COMMENT 'Couleur principale (hex)',
ADD COLUMN secondary_color VARCHAR(7) DEFAULT '#00a843' COMMENT 'Couleur secondaire (hex)',
ADD COLUMN accent_color VARCHAR(7) DEFAULT '#00ff7f' COMMENT 'Couleur accent (hex)',
ADD COLUMN text_on_primary VARCHAR(7) DEFAULT '#ffffff' COMMENT 'Couleur texte sur primaire (hex)';

-- Ajouter un index pour optimiser les requêtes
CREATE INDEX idx_branding ON virtual_airlines(primary_color, logo_url);

-- Exemples de couleurs pour différentes compagnies (à ajuster selon vos compagnies)
-- UPDATE virtual_airlines SET primary_color = '#FF6600', secondary_color = '#FF8800', accent_color = '#FFB84D', text_on_primary = '#FFFFFF' WHERE name LIKE '%easyJet%';
-- UPDATE virtual_airlines SET primary_color = '#003087', secondary_color = '#BA0C2F', accent_color = '#0057A6', text_on_primary = '#FFFFFF' WHERE name LIKE '%Air France%';
-- UPDATE virtual_airlines SET primary_color = '#DC0714', secondary_color = '#FF0000', accent_color = '#FF4D4D', text_on_primary = '#FFFFFF' WHERE name LIKE '%Air Canada%';
