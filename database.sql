-- Create database
CREATE DATABASE IF NOT EXISTS chicken_hatching_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE chicken_hatching_db;

-- Create hatching records table
CREATE TABLE IF NOT EXISTS hatching_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sequence_number INT NOT NULL UNIQUE,
    timestamp DATETIME NOT NULL,
    start_prod_time VARCHAR(50),
    cabinet_rows JSON,
    summary TEXT,
    passed_cabinets INT DEFAULT 0,
    total_cabinets INT DEFAULT 0,
    hatch_time VARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_sequence_number (sequence_number),
    INDEX idx_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create sequence counter table
CREATE TABLE IF NOT EXISTS sequence_counter (
    id INT PRIMARY KEY DEFAULT 1,
    last_sequence INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert initial sequence counter
INSERT INTO sequence_counter (id, last_sequence) 
VALUES (1, 0) 
ON DUPLICATE KEY UPDATE last_sequence = 0;
