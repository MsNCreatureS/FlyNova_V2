-- Migration pour optimiser la table flight_reports
-- Ajoute des indexes pour améliorer les performances des requêtes

-- Index sur la colonne validation_status pour les filtres rapides
ALTER TABLE `flight_reports` 
ADD INDEX IF NOT EXISTS `idx_validation_status` (`validation_status`);

-- Index sur created_at pour trier par date
ALTER TABLE `flight_reports` 
ADD INDEX IF NOT EXISTS `idx_created_at` (`created_at` DESC);

-- Index sur validated_at pour les rapports validés
ALTER TABLE `flight_reports` 
ADD INDEX IF NOT EXISTS `idx_validated_at` (`validated_at` DESC);

-- Index composite pour requêtes complexes (validation_status + created_at)
ALTER TABLE `flight_reports` 
ADD INDEX IF NOT EXISTS `idx_status_created` (`validation_status`, `created_at` DESC);

-- Index sur admin_id pour voir qui a validé quoi
ALTER TABLE `flight_reports` 
ADD INDEX IF NOT EXISTS `idx_admin_id` (`admin_id`);

-- Vérifier les indexes créés
SHOW INDEX FROM flight_reports;
