-- Emergency Response System Database Schema - MySQL Version
-- Drop tables if they exist (in reverse order of dependencies)
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS Assignment;
DROP TABLE IF EXISTS Notification;
DROP TABLE IF EXISTS vehicle_location;
DROP TABLE IF EXISTS Vehicle;
DROP TABLE IF EXISTS Incident;
DROP TABLE IF EXISTS User;

SET FOREIGN_KEY_CHECKS = 1;

-- Create User table
CREATE TABLE User (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role ENUM('OPERATOR', 'CITIZEN', 'DISPATCHER', 'ADMIN') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_role (role),
    INDEX idx_user_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Incident table
CREATE TABLE Incident (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('FIRE', 'MEDICAL', 'CRIME') NOT NULL,
    level ENUM('HIGH', 'MEDIUM', 'LOW') NOT NULL,
    description TEXT,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    status ENUM('PENDING', 'ASSIGNED', 'RESOLVED') NOT NULL,
    time_reported TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    time_resolved TIMESTAMP NULL,
    citizen_id INT NULL,
    FOREIGN KEY (citizen_id) REFERENCES User(id) ON DELETE SET NULL,
    CONSTRAINT check_resolved_time CHECK (time_resolved IS NULL OR time_resolved >= time_reported),
    INDEX idx_incident_status (status),
    INDEX idx_incident_citizen (citizen_id),
    INDEX idx_incident_time_reported (time_reported),
    INDEX idx_incident_location (latitude, longitude),
    INDEX idx_incident_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Vehicle table
CREATE TABLE Vehicle (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('AMBULANCE', 'FIRETRUCK', 'POLICE')  NOT NULL,
    status ENUM('AVAILABLE', 'ONROUTE', 'RESOLVING') NOT NULL,
    capacity INT NOT NULL CHECK (capacity > 0),
    operator_id INT NULL,
    FOREIGN KEY (operator_id) REFERENCES User(id) ON DELETE SET NULL,
    INDEX idx_vehicle_status (status),
    INDEX idx_vehicle_operator (operator_id),
    INDEX idx_vehicle_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create vehicle_location table
CREATE TABLE vehicle_location (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vehicle_id INT NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    time_stamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES Vehicle(id) ON DELETE CASCADE,
    INDEX idx_vehicle_location_vehicle (vehicle_id),
    INDEX idx_vehicle_location_timestamp (time_stamp),
    INDEX idx_vehicle_location_coords (latitude, longitude)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Notification table
CREATE TABLE Notification (
    id INT AUTO_INCREMENT PRIMARY KEY,
    notified_id INT NOT NULL,
    notification_type ENUM('INCIDENT_ALERT', 'ASSIGNMENT_REQUEST', 'ASSIGNMENT_RESPONSE', 'GENERAL') NOT NULL,
    content TEXT NOT NULL,
    time_sent TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    time_delivered TIMESTAMP NULL,
    FOREIGN KEY (notified_id) REFERENCES User(id) ON DELETE CASCADE,
    CONSTRAINT check_delivery_time CHECK (time_delivered IS NULL OR time_delivered >= time_sent),
    INDEX idx_notification_type (notification_type),
    INDEX idx_notification_notified (notified_id),
    INDEX idx_notification_time_sent (time_sent)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Assignment table
CREATE TABLE Assignment (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dispatcher_id INT NOT NULL,
    incident_id INT NOT NULL,
    vehicle_id INT NOT NULL,
    time_assigned TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    time_resolved TIMESTAMP NULL,
    status ENUM('ACTIVE', 'COMPLETED', 'CANCELED', 'REJECTED') NOT NULL,
    FOREIGN KEY (dispatcher_id) REFERENCES User(id) ON DELETE RESTRICT,
    FOREIGN KEY (incident_id) REFERENCES Incident(id) ON DELETE RESTRICT,
    FOREIGN KEY (vehicle_id) REFERENCES Vehicle(id) ON DELETE RESTRICT,
    CONSTRAINT check_assignment_resolved_time CHECK (time_resolved IS NULL OR time_resolved >= time_assigned),
    INDEX idx_assignment_status (status),
    INDEX idx_assignment_dispatcher (dispatcher_id),
    INDEX idx_assignment_incident (incident_id),
    INDEX idx_assignment_vehicle (vehicle_id),
    INDEX idx_assignment_time_assigned (time_assigned),
    INDEX idx_assignment_incident_status (incident_id, status),
    INDEX idx_assignment_vehicle_status (vehicle_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
