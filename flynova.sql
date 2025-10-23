-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le : jeu. 23 oct. 2025 à 12:33
-- Version du serveur : 9.1.0
-- Version de PHP : 8.3.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `flynova`
--

-- --------------------------------------------------------

--
-- Structure de la table `achievements`
--

DROP TABLE IF EXISTS `achievements`;
CREATE TABLE IF NOT EXISTS `achievements` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `icon` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `criteria` json DEFAULT NULL COMMENT 'Achievement criteria as JSON',
  `points` int DEFAULT '0',
  `badge_color` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `aircraft`
--

DROP TABLE IF EXISTS `aircraft`;
CREATE TABLE IF NOT EXISTS `aircraft` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `iata_code` varchar(3) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `icao_code` varchar(4) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_icao` (`icao_code`),
  KEY `idx_iata` (`iata_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `airports`
--

DROP TABLE IF EXISTS `airports`;
CREATE TABLE IF NOT EXISTS `airports` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `city` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `iata_code` varchar(3) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `icao_code` varchar(4) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `latitude` decimal(10,6) DEFAULT NULL,
  `longitude` decimal(10,6) DEFAULT NULL,
  `altitude` int DEFAULT NULL,
  `timezone_offset` decimal(4,2) DEFAULT NULL,
  `dst` varchar(1) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `timezone` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `iata_code` (`iata_code`),
  UNIQUE KEY `icao_code` (`icao_code`),
  KEY `idx_iata` (`iata_code`),
  KEY `idx_icao` (`icao_code`),
  KEY `idx_country` (`country`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `downloads`
--

DROP TABLE IF EXISTS `downloads`;
CREATE TABLE IF NOT EXISTS `downloads` (
  `id` int NOT NULL AUTO_INCREMENT,
  `va_id` int DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `file_type` enum('livery','tracker','document','other') COLLATE utf8mb4_unicode_ci DEFAULT 'other',
  `file_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_url` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_size` int DEFAULT NULL,
  `download_count` int DEFAULT '0',
  `aircraft_id` int DEFAULT NULL COMMENT 'For liveries',
  `uploaded_by` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `status` enum('active','archived') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  PRIMARY KEY (`id`),
  KEY `aircraft_id` (`aircraft_id`),
  KEY `uploaded_by` (`uploaded_by`),
  KEY `idx_va` (`va_id`),
  KEY `idx_type` (`file_type`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `events`
--

DROP TABLE IF EXISTS `events`;
CREATE TABLE IF NOT EXISTS `events` (
  `id` int NOT NULL AUTO_INCREMENT,
  `va_id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `event_type` enum('focus_airport','route_challenge','special_event','competition') COLLATE utf8mb4_unicode_ci DEFAULT 'special_event',
  `cover_image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `focus_airport_id` int DEFAULT NULL,
  `start_date` timestamp NOT NULL,
  `end_date` timestamp NOT NULL,
  `bonus_points` int DEFAULT '0',
  `created_by` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('upcoming','active','completed','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'upcoming',
  PRIMARY KEY (`id`),
  KEY `focus_airport_id` (`focus_airport_id`),
  KEY `created_by` (`created_by`),
  KEY `idx_va` (`va_id`),
  KEY `idx_dates` (`start_date`,`end_date`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `flights`
--

DROP TABLE IF EXISTS `flights`;
CREATE TABLE IF NOT EXISTS `flights` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `va_id` int NOT NULL,
  `route_id` int NOT NULL,
  `fleet_id` int DEFAULT NULL,
  `flight_number` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('reserved','in_progress','completed','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'reserved',
  `departure_time` timestamp NULL DEFAULT NULL,
  `arrival_time` timestamp NULL DEFAULT NULL,
  `reserved_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `route_id` (`route_id`),
  KEY `fleet_id` (`fleet_id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_va` (`va_id`),
  KEY `idx_status` (`status`),
  KEY `idx_departure_time` (`departure_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `flight_reports`
--

DROP TABLE IF EXISTS `flight_reports`;
CREATE TABLE IF NOT EXISTS `flight_reports` (
  `id` int NOT NULL AUTO_INCREMENT,
  `flight_id` int NOT NULL,
  `validation_status` enum('pending','approved','rejected') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `admin_id` int DEFAULT NULL,
  `admin_notes` text COLLATE utf8mb4_unicode_ci,
  `actual_departure_time` timestamp NULL DEFAULT NULL,
  `actual_arrival_time` timestamp NULL DEFAULT NULL,
  `flight_duration` int DEFAULT NULL COMMENT 'Duration in minutes',
  `distance_flown` decimal(10,2) DEFAULT NULL,
  `fuel_used` decimal(10,2) DEFAULT NULL,
  `landing_rate` decimal(6,2) DEFAULT NULL COMMENT 'Landing rate in fpm',
  `telemetry_data` json DEFAULT NULL COMMENT 'Full flight telemetry data',
  `points_awarded` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `validated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `flight_id` (`flight_id`),
  KEY `admin_id` (`admin_id`),
  KEY `idx_flight` (`flight_id`),
  KEY `idx_status` (`validation_status`),
  KEY `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `first_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_login` timestamp NULL DEFAULT NULL,
  `status` enum('active','suspended','inactive') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `username` (`username`),
  KEY `idx_email` (`email`),
  KEY `idx_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `user_achievements`
--

DROP TABLE IF EXISTS `user_achievements`;
CREATE TABLE IF NOT EXISTS `user_achievements` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `achievement_id` int NOT NULL,
  `va_id` int DEFAULT NULL COMMENT 'VA-specific achievement',
  `earned_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_achievement` (`user_id`,`achievement_id`,`va_id`),
  KEY `achievement_id` (`achievement_id`),
  KEY `va_id` (`va_id`),
  KEY `idx_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `va_fleet`
--

DROP TABLE IF EXISTS `va_fleet`;
CREATE TABLE IF NOT EXISTS `va_fleet` (
  `id` int NOT NULL AUTO_INCREMENT,
  `va_id` int NOT NULL,
  `registration` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `aircraft_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `aircraft_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `home_airport` varchar(4) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('active','maintenance','retired') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `total_flights` int DEFAULT '0',
  `total_hours` decimal(10,2) DEFAULT '0.00',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_registration` (`va_id`,`registration`),
  KEY `idx_va` (`va_id`),
  KEY `idx_status` (`status`),
  KEY `idx_home_airport` (`home_airport`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `va_members`
--

DROP TABLE IF EXISTS `va_members`;
CREATE TABLE IF NOT EXISTS `va_members` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `va_id` int NOT NULL,
  `role` enum('Owner','Admin','Pilot','Member') COLLATE utf8mb4_unicode_ci DEFAULT 'Member',
  `points` int DEFAULT '0',
  `total_flights` int DEFAULT '0',
  `total_hours` decimal(10,2) DEFAULT '0.00',
  `join_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('active','suspended','left') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_membership` (`user_id`,`va_id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_va` (`va_id`),
  KEY `idx_points` (`points` DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `va_routes`
--

DROP TABLE IF EXISTS `va_routes`;
CREATE TABLE IF NOT EXISTS `va_routes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `va_id` int NOT NULL,
  `flight_number` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `route_type` enum('Civil','Cargo','Private') COLLATE utf8mb4_unicode_ci DEFAULT 'Civil',
  `departure_icao` varchar(4) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `departure_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `arrival_icao` varchar(4) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `arrival_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `aircraft_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('active','inactive','seasonal') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_flight` (`va_id`,`flight_number`),
  KEY `idx_va` (`va_id`),
  KEY `idx_route_type` (`route_type`),
  KEY `idx_departure_icao` (`departure_icao`),
  KEY `idx_arrival_icao` (`arrival_icao`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `virtual_airlines`
--

DROP TABLE IF EXISTS `virtual_airlines`;
CREATE TABLE IF NOT EXISTS `virtual_airlines` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `callsign` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `icao_code` varchar(4) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `iata_code` varchar(3) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `owner_id` int NOT NULL,
  `logo_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `website` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `status` enum('active','suspended','inactive') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  PRIMARY KEY (`id`),
  UNIQUE KEY `callsign` (`callsign`),
  UNIQUE KEY `icao_code` (`icao_code`),
  UNIQUE KEY `iata_code` (`iata_code`),
  KEY `idx_owner` (`owner_id`),
  KEY `idx_callsign` (`callsign`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `downloads`
--
ALTER TABLE `downloads`
  ADD CONSTRAINT `downloads_ibfk_1` FOREIGN KEY (`va_id`) REFERENCES `virtual_airlines` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `downloads_ibfk_2` FOREIGN KEY (`aircraft_id`) REFERENCES `aircraft` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `downloads_ibfk_3` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT;

--
-- Contraintes pour la table `events`
--
ALTER TABLE `events`
  ADD CONSTRAINT `events_ibfk_1` FOREIGN KEY (`va_id`) REFERENCES `virtual_airlines` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `events_ibfk_2` FOREIGN KEY (`focus_airport_id`) REFERENCES `airports` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `events_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT;

--
-- Contraintes pour la table `flights`
--
ALTER TABLE `flights`
  ADD CONSTRAINT `flights_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `flights_ibfk_2` FOREIGN KEY (`va_id`) REFERENCES `virtual_airlines` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `flights_ibfk_3` FOREIGN KEY (`route_id`) REFERENCES `va_routes` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `flights_ibfk_4` FOREIGN KEY (`fleet_id`) REFERENCES `va_fleet` (`id`) ON DELETE SET NULL;

--
-- Contraintes pour la table `flight_reports`
--
ALTER TABLE `flight_reports`
  ADD CONSTRAINT `flight_reports_ibfk_1` FOREIGN KEY (`flight_id`) REFERENCES `flights` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `flight_reports_ibfk_2` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Contraintes pour la table `user_achievements`
--
ALTER TABLE `user_achievements`
  ADD CONSTRAINT `user_achievements_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_achievements_ibfk_2` FOREIGN KEY (`achievement_id`) REFERENCES `achievements` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_achievements_ibfk_3` FOREIGN KEY (`va_id`) REFERENCES `virtual_airlines` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `va_fleet`
--
ALTER TABLE `va_fleet`
  ADD CONSTRAINT `va_fleet_ibfk_1` FOREIGN KEY (`va_id`) REFERENCES `virtual_airlines` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `va_members`
--
ALTER TABLE `va_members`
  ADD CONSTRAINT `va_members_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `va_members_ibfk_2` FOREIGN KEY (`va_id`) REFERENCES `virtual_airlines` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `va_routes`
--
ALTER TABLE `va_routes`
  ADD CONSTRAINT `va_routes_ibfk_1` FOREIGN KEY (`va_id`) REFERENCES `virtual_airlines` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `virtual_airlines`
--
ALTER TABLE `virtual_airlines`
  ADD CONSTRAINT `virtual_airlines_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
