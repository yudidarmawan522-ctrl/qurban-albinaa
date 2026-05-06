-- SQL Schema for Al Binaa Qurban Management System
-- Compatible with Laragon (MySQL/MariaDB)

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- --------------------------------------------------------
-- Database: qurban_db
-- --------------------------------------------------------
CREATE DATABASE IF NOT EXISTS qurban_db;
USE qurban_db;

-- --------------------------------------------------------
-- Table: users (Admin Authentication)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(50) DEFAULT 'admin',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Insert Default Admin (Password: admin123)
-- In production, you should hash this password!
INSERT INTO `users` (`username`, `password`, `role`) VALUES
('admin', 'admin123', 'admin');

-- --------------------------------------------------------
-- Table: registrations
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `registrations` (
  `id` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `santri_name` varchar(255) NOT NULL,
  `santri_class` varchar(100) NOT NULL,
  `phone` varchar(50) NOT NULL,
  `type_id` varchar(50) NOT NULL,
  `animal_no` varchar(50) DEFAULT NULL,
  `group_status` varchar(100) DEFAULT NULL,
  `purchase_type` enum('Utuh', 'Patungan') DEFAULT 'Utuh',
  `category` enum('SAPI', 'DOMBA') NOT NULL,
  `type_label` varchar(100) NOT NULL,
  `price` decimal(15,2) NOT NULL,
  `payment_method` varchar(100) NOT NULL,
  `notes` text DEFAULT NULL,
  `penyembelih` varchar(255) DEFAULT NULL,
  `status` enum('Pending', 'Confirmed') DEFAULT 'Pending',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table: animal_types
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `animal_types` (
  `id` varchar(50) NOT NULL,
  `category` enum('SAPI', 'DOMBA') NOT NULL,
  `type` varchar(100) NOT NULL,
  `weight` varchar(100) DEFAULT NULL,
  `price` decimal(15,2) NOT NULL,
  `price_per_share` decimal(15,2) DEFAULT NULL,
  `stock` int(11) DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table: settings
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `settings` (
  `id` int(1) NOT NULL DEFAULT 1,
  `target_sapi` int(11) DEFAULT 30,
  `target_domba` int(11) DEFAULT 300,
  `program_name` varchar(255) DEFAULT 'Qurban Al Binaa 1447H',
  `deadline` date DEFAULT '2026-06-15',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Dumping initial data for animal_types
-- --------------------------------------------------------
INSERT INTO `animal_types` (`id`, `category`, `type`, `weight`, `price`, `price_per_share`, `stock`) VALUES
('S-TIPE-A', 'SAPI', 'Tipe A', '390-400 Kg', 35000000.00, 5000000.00, 5),
('S-TIPE-B', 'SAPI', 'Tipe B', '340-350 Kg', 28000000.00, 4000000.00, 8),
('S-TIPE-C', 'SAPI', 'Tipe C', '320-330 Kg', 23100000.00, 3300000.00, 10),
('S-TIPE-D', 'SAPI', 'Tipe D', '230-240 Kg', 19000000.00, NULL, 12),
('D-SUPER', 'DOMBA', 'SUPER', '45-60 Kg', 5300000.00, NULL, 20),
('D-TIPE-A', 'DOMBA', 'A', '31-35 Kg', 3800000.00, NULL, 25),
('D-TIPE-B', 'DOMBA', 'B', '26-30 Kg', 3300000.00, NULL, 30),
('D-TIPE-C', 'DOMBA', 'C', '20-25 Kg', 2800000.00, NULL, 40),
('D-TIPE-D', 'DOMBA', 'D', '15-19 Kg', 2300000.00, NULL, 50);

-- --------------------------------------------------------
-- Dumping initial data for settings
-- --------------------------------------------------------
INSERT INTO `settings` (`id`, `target_sapi`, `target_domba`, `program_name`, `deadline`) VALUES
(1, 30, 300, 'Qurban Al Binaa 1447H', '2026-06-15');

-- --------------------------------------------------------
-- Dumping sample registrations (optional)
-- --------------------------------------------------------
INSERT INTO `registrations` (`id`, `name`, `santri_name`, `santri_class`, `phone`, `type_id`, `purchase_type`, `category`, `type_label`, `price`, `payment_method`, `notes`, `penyembelih`, `status`, `created_at`) VALUES
('REG-1714380000001', 'Bapak Ahmad Fauzi', 'Zaid Ahmad', '7-A', '081234567890', 'D-SUPER', 'Utuh', 'DOMBA', 'SUPER', 5300000.00, 'Transfer BSI', 'Alhamdulillah', 'Ust. Hamzah', 'Confirmed', '2024-04-29 10:00:00'),
('REG-1714380000002', 'Ibu Siti Aminah', 'Maryam Siti', '10-IPA', '089876543210', 'S-TIPE-B', 'Utuh', 'SAPI', 'Tipe B', 28000000.00, 'Cash', 'Sapi kolektif keluarga', 'Petugas Kebersihan', 'Pending', '2024-04-29 10:30:00');

COMMIT;
