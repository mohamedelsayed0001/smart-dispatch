-- Emergency Response System Database - Test Data Population (MySQL Version)
-- This script populates the database with comprehensive edge cases

-- Disable foreign key checks temporarily for clean data loading
SET FOREIGN_KEY_CHECKS = 0;

-- Clear existing data (if any)
TRUNCATE TABLE Assignment;
TRUNCATE TABLE Notification;
TRUNCATE TABLE vehicle_location;
TRUNCATE TABLE Vehicle;
TRUNCATE TABLE Incident;
TRUNCATE TABLE User;

SET FOREIGN_KEY_CHECKS = 1;

-- ==================== USER DATA ====================
INSERT INTO User (name, email, password, role) VALUES
('John Smith', 'john.smith@emergency.gov', 'hashed_pass_1', 'OPERATOR'),
('María García', 'maria.garcia@emergency.gov', 'hashed_pass_2', 'OPERATOR'),
('李明 (Li Ming)', 'li.ming@emergency.gov', 'hashed_pass_3', 'OPERATOR'),
('Sarah O''Connor', 'sarah.oconnor@emergency.gov', 'hashed_pass_4', 'OPERATOR'),
('Inactive Operator', 'inactive.operator@emergency.gov', 'hashed_pass_5', 'OPERATOR'),
('Alice Johnson', 'alice.j@gmail.com', 'hashed_pass_6', 'CITIZEN'),
('Bob Brown', 'bob.brown@yahoo.com', 'hashed_pass_7', 'CITIZEN'),
('Charlie Davis-Wilson', 'charlie+test@email.com', 'hashed_pass_8', 'CITIZEN'),
('Deleted User Name', 'deleted@email.com', 'hashed_pass_9', 'CITIZEN'),
('Anonymous Reporter', 'anon123@protonmail.com', 'hashed_pass_10', 'CITIZEN'),
('Test Citizen', 'test.citizen@test.com', 'hashed_pass_11', 'CITIZEN'),
('José Hernández', 'jose.hernandez@mail.com', 'hashed_pass_12', 'CITIZEN'),
('Emma Wilson', 'emma.wilson@dispatch.gov', 'hashed_pass_13', 'DISPATCHER'),
('Michael Chen', 'michael.chen@dispatch.gov', 'hashed_pass_14', 'DISPATCHER'),
('Rebecca Taylor', 'rebecca.taylor@dispatch.gov', 'hashed_pass_15', 'DISPATCHER'),
('David Kim', 'david.kim@dispatch.gov', 'hashed_pass_16', 'DISPATCHER'),
('fff', 'bomb@gmail.com', '123', 'ADMIN');

-- ==================== INCIDENT DATA ====================
INSERT INTO Incident (type, level, description, latitude, longitude, status, time_reported, time_resolved, citizen_id) VALUES
('Fire', 'High', 'Large building fire, multiple floors affected', 40.7128, -74.0060, 'pending', DATE_SUB(NOW(), INTERVAL 10 MINUTE), NULL, 6),
('Medical', 'High', 'Heart attack patient, needs immediate attention', 40.7580, -73.9855, 'pending', DATE_SUB(NOW(), INTERVAL 5 MINUTE), NULL, 7),
('Crime', 'Medium', 'Vehicle collision at intersection', 40.7489, -73.9680, 'pending', DATE_SUB(NOW(), INTERVAL 15 MINUTE), NULL, 8),
('Crime', 'High', 'Armed robbery in progress', 40.7614, -73.9776, 'pending', DATE_SUB(NOW(), INTERVAL 2 MINUTE), NULL, NULL),
('Crime', 'High', 'Armed robbery in progress', 40.7614, -73.9776, 'pending', DATE_SUB(NOW(), INTERVAL 2 MINUTE), NULL, NULL),
('Fire', 'High', 'Apartment fire, 3rd floor', 40.7306, -73.9352, 'assigned', DATE_SUB(NOW(), INTERVAL 30 MINUTE), NULL, 9),
('Medical', 'High', 'Multiple casualty accident', 40.7549, -73.9840, 'assigned', DATE_SUB(NOW(), INTERVAL 20 MINUTE), NULL, 10),
('Medical', 'Medium', 'Water main break, street flooding', 40.7282, -74.0776, 'assigned', DATE_SUB(NOW(), INTERVAL 45 MINUTE), NULL, 11),
('Fire', 'High', 'Natural gas odor reported, building evacuated', 40.7589, -73.9851, 'assigned', DATE_SUB(NOW(), INTERVAL 25 MINUTE), NULL, 12),
('Fire', 'Low', 'Small kitchen fire, extinguished', 40.7480, -73.9862, 'resolved', DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_SUB(NOW(), INTERVAL 90 MINUTE), 6),
('Medical', 'Medium', 'Elderly person fallen, minor injuries', 40.7614, -73.9776, 'resolved', DATE_SUB(NOW(), INTERVAL 3 HOUR), DATE_SUB(NOW(), INTERVAL 2 HOUR), 7),
('Crime', 'Low', 'Minor fender bender', 40.7580, -73.9855, 'resolved', DATE_SUB(NOW(), INTERVAL 5 HOUR), DATE_SUB(NOW(), INTERVAL 4 HOUR), 8),
('Crime', 'Medium', 'Theft reported at store', 40.7128, -74.0060, 'resolved', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 23 HOUR), 11),
('Medical', 'Low', 'Person feeling faint', 40.7128, -74.0060, 'pending', DATE_SUB(NOW(), INTERVAL 3 MINUTE), NULL, 12),
('Crime', 'Medium', 'Incident at northern boundary', 89.999999, -180.0, 'pending', DATE_SUB(NOW(), INTERVAL 1 HOUR), NULL, 6),
('Medical', 'High', 'Incident at southern boundary', -89.999999, 180.0, 'pending', DATE_SUB(NOW(), INTERVAL 30 MINUTE), NULL, 7),
('Fire', 'High', 'Historical incident - warehouse fire', 40.7282, -73.9776, 'resolved', DATE_SUB(NOW(), INTERVAL 30 DAY), DATE_SUB(NOW(), INTERVAL 29 DAY), 8),
('Medical', 'Medium', 'This is an incident with a very long description that goes into extensive detail...', 40.7589, -73.9680, 'pending', DATE_SUB(NOW(), INTERVAL 8 MINUTE), NULL, 10),
('Medical', 'Medium', 'This is an incident with a very long description that goes into extensive detail...', 40.7589, -73.9680, 'pending', DATE_SUB(NOW(), INTERVAL 8 MINUTE), NULL, 10),
('Medical', 'Low', 'Help', 40.7306, -73.9840, 'resolved', DATE_SUB(NOW(), INTERVAL 6 HOUR), DATE_SUB(NOW(), INTERVAL 345 MINUTE), 11),
('Medical', 'Medium', NULL, 40.7489, -74.0776, 'pending', DATE_SUB(NOW(), INTERVAL 12 MINUTE), NULL, 12);

-- ==================== VEHICLE DATA ====================
INSERT INTO Vehicle (type, status, capacity, operator_id) VALUES
('AMBULANCE', 'Available', 2, 1),
('FIRETRUCK', 'OnRoute', 6, 2),
('POLICE', 'Available', 4, 3),
('AMBULANCE', 'OnRoute', 2, 4),
('FIRETRUCK', 'Available', 8, 1),
('AMBULANCE', 'Available', 2, NULL),
('POLICE', 'Available', 4, NULL),
('FIRETRUCK', 'Resolving', 6, NULL),
('AMBULANCE', 'Available', 2, 2),
('POLICE', 'Available', 4, 3),
('FIRETRUCK', 'Available', 6, 4),
('AMBULANCE', 'Available', 2, NULL),
('POLICE', 'Available', 4, NULL),
('FIRETRUCK', 'Available', 6, NULL);

-- ==================== VEHICLE LOCATION DATA ====================
INSERT INTO vehicle_location (vehicle_id, longitude, latitude, time_stamp) VALUES
(1, -74.0060, 40.7128, DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(1, -74.0050, 40.7138, DATE_SUB(NOW(), INTERVAL 45 MINUTE)),
(1, -74.0040, 40.7148, DATE_SUB(NOW(), INTERVAL 30 MINUTE)),
(1, -74.0030, 40.7158, DATE_SUB(NOW(), INTERVAL 15 MINUTE)),
(1, -74.0020, 40.7168, NOW()),
(2, -73.9855, 40.7580, DATE_SUB(NOW(), INTERVAL 30 MINUTE)),
(2, -73.9865, 40.7570, DATE_SUB(NOW(), INTERVAL 25 MINUTE)),
(2, -73.9875, 40.7560, DATE_SUB(NOW(), INTERVAL 20 MINUTE)),
(2, -73.9352, 40.7306, NOW()),
(2, -73.9352, 40.7306, NOW()),
(3, -73.9680, 40.7489, DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(3, -73.9680, 40.7489, DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(3, -73.9680, 40.7489, NOW()),
(3, -73.9680, 40.7489, NOW());

-- ==================== NOTIFICATION DATA ====================
-- Keep notifications as-is (no schema conflicts)
-- Keep notifications as-is (no schema conflicts)
INSERT INTO Notification (notified_id, notification_type, content, time_sent, time_delivered) VALUES
(6, 'incident_alert', 'Your reported fire incident has been assigned to Fire Truck #2', DATE_SUB(NOW(), INTERVAL 25 MINUTE), DATE_SUB(NOW(), INTERVAL 25 MINUTE)),
(7, 'incident_alert', 'Medical emergency assigned. Ambulance en route.', DATE_SUB(NOW(), INTERVAL 18 MINUTE), DATE_SUB(NOW(), INTERVAL 18 MINUTE));

-- ==================== ASSIGNMENT DATA ====================
INSERT INTO Assignment (dispatcher_id, incident_id, vehicle_id, time_assigned, time_resolved, status) VALUES
(13, 5, 2, DATE_SUB(NOW(), INTERVAL 30 MINUTE), NULL, 'active'),
(14, 6, 4, DATE_SUB(NOW(), INTERVAL 20 MINUTE), NULL, 'active'),
(15, 7, 9, DATE_SUB(NOW(), INTERVAL 45 MINUTE), NULL, 'active');