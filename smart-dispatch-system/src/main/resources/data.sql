-- Emergency Response System Database - Test Data Population (MySQL Version)
-- Simplified data for development and testing

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
-- Operators
('John Smith', 'john.smith@emergency.gov', 'hashed_pass_1', 'OPERATOR'),
('María García', 'maria.garcia@emergency.gov', 'hashed_pass_2', 'OPERATOR'),
('李明 (Li Ming)', 'li.ming@emergency.gov', 'hashed_pass_3', 'OPERATOR'),
('Sarah O''Connor', 'sarah.oconnor@emergency.gov', 'hashed_pass_4', 'OPERATOR'),
('Inactive Operator', 'inactive.operator@emergency.gov', 'hashed_pass_5', 'OPERATOR'),

-- Citizens
('Alice Johnson', 'alice.j@gmail.com', 'hashed_pass_6', 'CITIZEN'),
('Bob Brown', 'bob.brown@yahoo.com', 'hashed_pass_7', 'CITIZEN'),
('Charlie Davis-Wilson', 'charlie+test@email.com', 'hashed_pass_8', 'CITIZEN'),
('Deleted User Name', 'deleted@email.com', 'hashed_pass_9', 'CITIZEN'),
('Anonymous Reporter', 'anon123@protonmail.com', 'hashed_pass_10', 'CITIZEN'),
('Test Citizen', 'test.citizen@test.com', 'hashed_pass_11', 'CITIZEN'),
('José Hernández', 'jose.hernandez@mail.com', 'hashed_pass_12', 'CITIZEN'),

-- Dispatchers
('Emma Wilson', 'emma.wilson@dispatch.gov', 'hashed_pass_13', 'DISPATCHER'),
('Michael Chen', 'michael.chen@dispatch.gov', 'hashed_pass_14', 'DISPATCHER'),
('Rebecca Taylor', 'rebecca.taylor@dispatch.gov', 'hashed_pass_15', 'DISPATCHER'),
('David Kim', 'david.kim@dispatch.gov', 'hashed_pass_16', 'DISPATCHER'),

('fff', 'bomb@gmail.com', '123', 'ADMIN');

-- ==================== INCIDENT DATA ====================
-- Using Cairo, Egypt coordinates (approximately 30.0444°N, 31.2357°E)
INSERT INTO Incident (type, level, description, latitude, longitude, status, time_reported, time_resolved, citizen_id) VALUES
('Fire', 'Critical', 'Large building fire in downtown Cairo', 30.0444, 31.2357, 'pending', DATE_SUB(NOW(), INTERVAL 10 MINUTE), NULL, 4),
('Medical', 'High', 'Heart attack patient, needs immediate attention', 30.0500, 31.2400, 'pending', DATE_SUB(NOW(), INTERVAL 5 MINUTE), NULL, 5),
('Accident', 'Medium', 'Vehicle collision at Tahrir Square', 30.0381, 31.2360, 'pending', DATE_SUB(NOW(), INTERVAL 15 MINUTE), NULL, 6),
('Medical', 'Critical', 'Multiple casualty accident on Nile Corniche', 30.0520, 31.2500, 'assigned', DATE_SUB(NOW(), INTERVAL 20 MINUTE), NULL, 5),
('Crime', 'High', 'Robbery in progress near Khan el-Khalili', 30.0612, 31.2617, 'pending', DATE_SUB(NOW(), INTERVAL 2 MINUTE), NULL, NULL);

-- ==================== VEHICLE DATA ====================
INSERT INTO Vehicle (type, status, capacity, operator_id) VALUES
('Ambulance', 'AVAILABLE', 2, 1),
('Fire Truck', 'ON_ROUTE', 6, 2),
('Police Car', 'RESOLVING', 4, 3),
('Ambulance', 'AVAILABLE', 2, NULL),
('Fire Truck', 'AVAILABLE', 8, NULL);

-- ==================== VEHICLE LOCATION DATA ====================
-- Using Cairo coordinates
INSERT INTO vehicle_location (vehicle_id, longitude, latitude, time_stamp) VALUES
-- Vehicle 1 (Ambulance - John Smith) - Near Tahrir Square
(1, 31.2360, 30.0381, NOW()),
(1, 31.2350, 30.0375, DATE_SUB(NOW(), INTERVAL 5 MINUTE)),
-- Vehicle 2 (Fire Truck - María García) - Near downtown Cairo
(2, 31.2357, 30.0444, NOW()),
(2, 31.2340, 30.0440, DATE_SUB(NOW(), INTERVAL 10 MINUTE)),
-- Vehicle 3 (Police Car - Li Ming) - Near Khan el-Khalili
(3, 31.2617, 30.0612, NOW()),
(3, 31.2600, 30.0600, DATE_SUB(NOW(), INTERVAL 15 MINUTE)),
-- Vehicle 4 (Unassigned Ambulance) - Nile Corniche
(4, 31.2500, 30.0520, NOW()),
-- Vehicle 5 (Unassigned Fire Truck) - West bank
(5, 31.2250, 30.0400, NOW());

-- ==================== ASSIGNMENT DATA ====================
INSERT INTO Assignment (dispatcher_id, incident_id, vehicle_id, time_assigned, time_resolved, status) VALUES
(7, 1, 1, DATE_SUB(NOW(), INTERVAL 8 MINUTE), NULL, 'active'),
(7, 4, 2, DATE_SUB(NOW(), INTERVAL 15 MINUTE), NULL, 'active'),
(8, 2, 1, DATE_SUB(NOW(), INTERVAL 3 MINUTE), NULL, 'active'),
(8, 3, 3, DATE_SUB(NOW(), INTERVAL 10 MINUTE), NULL, 'active'),
(7, 5, 2, DATE_SUB(NOW(), INTERVAL 1 MINUTE), NULL, 'active');

-- ==================== NOTIFICATION DATA ====================
INSERT INTO Notification (notified_id, notification_type, content, time_sent, time_delivered) VALUES
(1, 'assignment_request', 'New assignment: Critical Fire incident at 40.7128, -74.0060', DATE_SUB(NOW(), INTERVAL 8 MINUTE), DATE_SUB(NOW(), INTERVAL 8 MINUTE)),
(2, 'assignment_request', 'New assignment: Multiple casualty accident at 40.7549, -73.9840', DATE_SUB(NOW(), INTERVAL 15 MINUTE), DATE_SUB(NOW(), INTERVAL 15 MINUTE)),
(3, 'assignment_request', 'New assignment: Vehicle collision at 40.7489, -73.9680', DATE_SUB(NOW(), INTERVAL 10 MINUTE), DATE_SUB(NOW(), INTERVAL 10 MINUTE)),
(7, 'incident_alert', 'New incident: Large building fire reported', DATE_SUB(NOW(), INTERVAL 10 MINUTE), DATE_SUB(NOW(), INTERVAL 10 MINUTE)),
(7, 'incident_alert', 'New incident: Heart attack patient needs emergency response', DATE_SUB(NOW(), INTERVAL 5 MINUTE), DATE_SUB(NOW(), INTERVAL 5 MINUTE));