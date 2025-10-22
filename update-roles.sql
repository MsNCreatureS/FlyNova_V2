-- Script pour mettre à jour les rôles dans va_members
-- À exécuter dans phpMyAdmin (onglet SQL)

-- Mettre à jour les rôles existants
UPDATE va_members SET role = 'Owner' WHERE role = 'owner';
UPDATE va_members SET role = 'Admin' WHERE role = 'admin';
UPDATE va_members SET role = 'Member' WHERE role = 'member';

-- Modifier la colonne pour accepter les nouvelles valeurs
ALTER TABLE va_members 
MODIFY COLUMN role ENUM('Owner', 'Admin', 'Member') NOT NULL DEFAULT 'Member';

-- Afficher le résultat
SELECT * FROM va_members;
