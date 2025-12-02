<<<<<<< HEAD
-- Emergency Response System Database - Test Data Population (MySQL Version)
-- Simplified data for development and testing
=======
-- --------------------
-- TEST DATA (adjusted)
-- --------------------
>>>>>>> e1d40a6 (Update Schema & Data)

SET FOREIGN_KEY_CHECKS = 0;

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

-- ==================== INCIDENT DATA (Alexandria, EGYPT) ====================
-- Note: Incident.type limited to ('FIRE','MEDICAL','CRIME') in schema.
-- I mapped non-supported types to the closest allowed type:
--   Accident -> MEDICAL, Flood -> MEDICAL, Gas Leak -> FIRE, Other -> MEDICAL

INSERT INTO Incident (type, level, description, latitude, longitude, status, time_reported, time_resolved, citizen_id) VALUES
-- Pending incidents
('FIRE', 'HIGH', 'Large building fire, multiple floors affected', 31.2100, 29.9550, 'PENDING', DATE_SUB(NOW(), INTERVAL 10 MINUTE), NULL, 6),
('MEDICAL', 'HIGH', 'Heart attack patient, needs immediate attention', 31.2058, 29.9537, 'PENDING', DATE_SUB(NOW(), INTERVAL 5 MINUTE), NULL, 7),
('MEDICAL', 'MEDIUM', 'Vehicle collision at intersection', 31.2190, 29.9488, 'PENDING', DATE_SUB(NOW(), INTERVAL 15 MINUTE), NULL, 8),
('CRIME', 'HIGH', 'Armed robbery in progress', 31.2009, 29.9187, 'PENDING', DATE_SUB(NOW(), INTERVAL 2 MINUTE), NULL, NULL), -- Anonymous report

-- Assigned incidents
('FIRE', 'HIGH', 'Apartment fire, 3rd floor', 31.2360, 29.9760, 'ASSIGNED', DATE_SUB(NOW(), INTERVAL 30 MINUTE), NULL, 9),
('MEDICAL', 'HIGH', 'Multiple casualty accident', 31.2620, 29.9678, 'ASSIGNED', DATE_SUB(NOW(), INTERVAL 20 MINUTE), NULL, 10),
('MEDICAL', 'MEDIUM', 'Water main break, street flooding (mapped to MEDICAL for schema)', 31.2410, 29.9660, 'ASSIGNED', DATE_SUB(NOW(), INTERVAL 45 MINUTE), NULL, 11),
('FIRE', 'HIGH', 'Natural gas odor reported, building evacuated (mapped to FIRE)', 31.2390, 29.9700, 'ASSIGNED', DATE_SUB(NOW(), INTERVAL 25 MINUTE), NULL, 12),

-- Resolved incidents
('FIRE', 'LOW', 'Small kitchen fire, extinguished', 31.2149, 29.9258, 'RESOLVED', DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_SUB(NOW(), INTERVAL 90 MINUTE), 6),
('MEDICAL', 'MEDIUM', 'Elderly person fallen, minor injuries', 31.2001, 29.9219, 'RESOLVED', DATE_SUB(NOW(), INTERVAL 3 HOUR), DATE_SUB(NOW(), INTERVAL 2 HOUR), 7),
('MEDICAL', 'LOW', 'Minor fender bender', 31.2190, 29.9488, 'RESOLVED', DATE_SUB(NOW(), INTERVAL 5 HOUR), DATE_SUB(NOW(), INTERVAL 4 HOUR), 8),
('CRIME', 'MEDIUM', 'Theft reported at store', 31.2050, 29.9480, 'RESOLVED', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 23 HOUR), 11),

-- Edge cases: Multiple incidents at same location
('MEDICAL', 'LOW', 'Person feeling faint', 31.2050, 29.9480, 'PENDING', DATE_SUB(NOW(), INTERVAL 3 MINUTE), NULL, 12),

-- Edge cases: "extreme" coordinates mapped inside Alex bounds
('MEDICAL', 'MEDIUM', 'Incident near northern Alexandria boundary', 31.30000000, 29.70000000, 'PENDING', DATE_SUB(NOW(), INTERVAL 1 HOUR), NULL, 6),
('MEDICAL', 'HIGH', 'Incident near southern Alexandria boundary', 31.00000000, 30.00000000, 'PENDING', DATE_SUB(NOW(), INTERVAL 30 MINUTE), NULL, 7),

-- Edge cases: Very old incident (recently resolved)
('FIRE', 'HIGH', 'Historical incident - warehouse fire', 31.2415, 29.9665, 'RESOLVED', DATE_SUB(NOW(), INTERVAL 30 DAY), DATE_SUB(NOW(), INTERVAL 29 DAY), 8),

-- Edge cases: Long description
('MEDICAL', 'MEDIUM', 'This is an incident with a very long description that goes into extensive detail about the situation. The reporter has provided multiple paragraphs of information including the exact sequence of events, all parties involved, potential hazards, and specific requests for assistance. This tests how the system handles larger text fields and ensures that database character limits are appropriate for real-world usage scenarios.', 31.2395, 29.9710, 'PENDING', DATE_SUB(NOW(), INTERVAL 8 MINUTE), NULL, 10),

-- Edge cases: Minimal description
('MEDICAL', 'LOW', 'Help', 31.2360, 29.9760, 'RESOLVED', DATE_SUB(NOW(), INTERVAL 6 HOUR), DATE_SUB(NOW(), INTERVAL 345 MINUTE), 11),

-- Edge cases: NULL description
('MEDICAL', 'MEDIUM', NULL, 31.2195, 29.9480, 'PENDING', DATE_SUB(NOW(), INTERVAL 12 MINUTE), NULL, 12);

-- ==================== VEHICLE DATA ====================
-- Normalize vehicle type/status values to schema ENUMs (all uppercase where required)
UPDATE Vehicle SET type = 'AMBULANCE' WHERE type IN ('Ambulance', 'ambulance');
UPDATE Vehicle SET type = 'FIRETRUCK' WHERE type IN ('Fire Truck', 'FireTruck', 'firetruck');
UPDATE Vehicle SET type = 'POLICE' WHERE type IN ('Police Car', 'Police', 'police');

DELETE FROM Vehicle WHERE type NOT IN ('AMBULANCE', 'FIRETRUCK', 'POLICE');

INSERT INTO Vehicle (type, status, capacity, operator_id) VALUES
('AMBULANCE', 'AVAILABLE', 2, 1),
('AMBULANCE', 'AVAILABLE', 2, 4),
('AMBULANCE', 'AVAILABLE', 2, NULL),
('AMBULANCE', 'ONROUTE', 2, 4),
('AMBULANCE', 'ONROUTE', 4, 3),
('AMBULANCE', 'RESOLVING', 2, 1),

('FIRETRUCK', 'AVAILABLE', 8, 1),
('FIRETRUCK', 'AVAILABLE', 6, NULL),
('FIRETRUCK', 'ONROUTE', 6, 2),
('FIRETRUCK', 'ONROUTE', 4, 1),
('FIRETRUCK', 'RESOLVING', 6, 1),

('POLICE', 'AVAILABLE', 4, 3),
('POLICE', 'AVAILABLE', 4, NULL),
('POLICE', 'AVAILABLE', 2, 2),
('POLICE', 'AVAILABLE', 10, NULL),
('POLICE', 'RESOLVING', 4, 3);

-- ==================== VEHICLE LOCATION DATA (Alexandria) ====================
INSERT INTO vehicle_location (vehicle_id, longitude, latitude, time_stamp) VALUES
-- Vehicle 1 (Ambulance) tracking history (Downtown / Sidi Gaber area)
(1, 29.9550, 31.2100, DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(1, 29.9540, 31.2110, DATE_SUB(NOW(), INTERVAL 45 MINUTE)),
(1, 29.9530, 31.2120, DATE_SUB(NOW(), INTERVAL 30 MINUTE)),
(1, 29.9520, 31.2130, DATE_SUB(NOW(), INTERVAL 15 MINUTE)),
(1, 29.9510, 31.2140, NOW()),

-- Vehicle 2 (Fire Truck) tracking - on route to incident (Smouha / Gleem)
(2, 29.9537, 31.2058, DATE_SUB(NOW(), INTERVAL 30 MINUTE)),
(2, 29.9527, 31.2048, DATE_SUB(NOW(), INTERVAL 25 MINUTE)),
(2, 29.9517, 31.2038, DATE_SUB(NOW(), INTERVAL 20 MINUTE)),
(2, 29.9760, 31.2360, NOW()), -- At incident location (Stanley/Gleem area)

-- Vehicle 3 (Police Car) - stationary (near Alexandria center)
(3, 29.9488, 31.2190, DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(3, 29.9488, 31.2190, DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(3, 29.9488, 31.2190, NOW()),

-- Vehicle 4 (Ambulance) - rapid movement (Miami / Montaza corridor)
(4, 29.9678, 31.2620, DATE_SUB(NOW(), INTERVAL 10 MINUTE)),
(4, 29.9688, 31.2610, DATE_SUB(NOW(), INTERVAL 8 MINUTE)),
(4, 29.9698, 31.2600, DATE_SUB(NOW(), INTERVAL 6 MINUTE)),
(4, 29.9708, 31.2590, DATE_SUB(NOW(), INTERVAL 4 MINUTE)),
(4, 29.9718, 31.2580, DATE_SUB(NOW(), INTERVAL 2 MINUTE)),
(4, 29.9700, 31.2390, NOW()),

-- Vehicles 5-10 - current locations only (various neighborhoods)
(5, 29.9660, 31.2410, NOW()),
(6, 29.9258, 31.2149, DATE_SUB(NOW(), INTERVAL 3 DAY)), -- Old location for maintenance vehicle
(7, 29.9765, 31.2354, DATE_SUB(NOW(), INTERVAL 5 DAY)), -- Old location for maintenance vehicle
(8, 29.9710, 31.2395, DATE_SUB(NOW(), INTERVAL 10 DAY)), -- Very old location for out_of_service
(9, 29.9488, 31.2190, NOW()),
(10, 29.9678, 31.2620, NOW()),

-- Edge case: "extreme" coordinates kept inside Alexandria bounding area
(11, 29.70000000, 31.30000000, NOW()),
(12, 30.00000000, 31.00000000, NOW()),

-- Multiple vehicles at same station (downtown)
(13, 29.9550, 31.2100, NOW()),
(14, 29.9550, 31.2100, NOW()),
(15, 29.9550, 31.2100, NOW());

-- ==================== NOTIFICATION DATA ====================
-- Normalize notification_type values to schema ENUMs (uppercase)
INSERT INTO Notification (notified_id, notification_type, content, time_sent, time_delivered) VALUES
(6, 'INCIDENT_ALERT', 'Your reported fire incident has been assigned to Fire Truck #2', DATE_SUB(NOW(), INTERVAL 25 MINUTE), DATE_SUB(NOW(), INTERVAL 25 MINUTE)),
(7, 'INCIDENT_ALERT', 'Medical emergency assigned. Ambulance en route.', DATE_SUB(NOW(), INTERVAL 18 MINUTE), DATE_SUB(NOW(), INTERVAL 18 MINUTE)),
(8, 'INCIDENT_ALERT', 'Your accident report is being processed', DATE_SUB(NOW(), INTERVAL 12 MINUTE), NULL), -- Undelivered

(1, 'ASSIGNMENT_REQUEST', 'New assignment: Fire incident at 31.2360, 29.9760', DATE_SUB(NOW(), INTERVAL 30 MINUTE), DATE_SUB(NOW(), INTERVAL 29 MINUTE)),
(2, 'ASSIGNMENT_REQUEST', 'Emergency medical response needed at intersection', DATE_SUB(NOW(), INTERVAL 20 MINUTE), DATE_SUB(NOW(), INTERVAL 19 MINUTE)),
(3, 'ASSIGNMENT_REQUEST', 'Crime in progress - immediate response required', DATE_SUB(NOW(), INTERVAL 2 MINUTE), NULL), -- Just sent
(4, 'ASSIGNMENT_REQUEST', 'Gas leak emergency - proceed to location', DATE_SUB(NOW(), INTERVAL 25 MINUTE), DATE_SUB(NOW(), INTERVAL 24 MINUTE)),

(13, 'ASSIGNMENT_RESPONSE', 'Operator John Smith accepted assignment #1', DATE_SUB(NOW(), INTERVAL 29 MINUTE), DATE_SUB(NOW(), INTERVAL 29 MINUTE)),
(14, 'ASSIGNMENT_RESPONSE', 'Assignment #2 completed successfully', DATE_SUB(NOW(), INTERVAL 10 MINUTE), DATE_SUB(NOW(), INTERVAL 10 MINUTE)),
(15, 'ASSIGNMENT_RESPONSE', 'Assignment #3 rejected by operator - vehicle unavailable', DATE_SUB(NOW(), INTERVAL 5 MINUTE), DATE_SUB(NOW(), INTERVAL 5 MINUTE)),

(1, 'GENERAL', 'System maintenance scheduled for tonight at 2 AM', DATE_SUB(NOW(), INTERVAL 5 HOUR), DATE_SUB(NOW(), INTERVAL 4 HOUR)),
(13, 'GENERAL', 'New dispatch protocol effective immediately', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 23 HOUR)),
(14, 'GENERAL', 'Training session scheduled for next week', DATE_SUB(NOW(), INTERVAL 2 DAY), NULL), -- Unread

(6, 'GENERAL', 'This is a notification with extensive content that provides detailed information about multiple topics. It includes instructions, warnings, procedural updates, and contact information. This tests the system''s ability to handle longer notification messages that might be sent during complex emergency situations or for administrative purposes that require detailed explanations.', DATE_SUB(NOW(), INTERVAL 30 MINUTE), DATE_SUB(NOW(), INTERVAL 25 MINUTE)),

(1, 'ASSIGNMENT_REQUEST', 'Additional assignment - backup requested', DATE_SUB(NOW(), INTERVAL 15 MINUTE), DATE_SUB(NOW(), INTERVAL 14 MINUTE)),
(1, 'ASSIGNMENT_REQUEST', 'Priority assignment - update on previous incident', DATE_SUB(NOW(), INTERVAL 10 MINUTE), DATE_SUB(NOW(), INTERVAL 9 MINUTE)),
(1, 'GENERAL', 'Shift change reminder', DATE_SUB(NOW(), INTERVAL 1 HOUR), NULL),

(2, 'INCIDENT_ALERT', 'Notification sent but delayed', DATE_SUB(NOW(), INTERVAL 1 HOUR), DATE_SUB(NOW(), INTERVAL 30 MINUTE)), -- 30 min delay
(3, 'GENERAL', 'System alert', DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_SUB(NOW(), INTERVAL 10 MINUTE)), -- Very delayed

(10, 'INCIDENT_ALERT', 'Incident status update 1', DATE_SUB(NOW(), INTERVAL 5 MINUTE), DATE_SUB(NOW(), INTERVAL 5 MINUTE)),
(10, 'INCIDENT_ALERT', 'Incident status update 2', DATE_SUB(NOW(), INTERVAL 4 MINUTE), DATE_SUB(NOW(), INTERVAL 4 MINUTE)),
(10, 'INCIDENT_ALERT', 'Incident status update 3', DATE_SUB(NOW(), INTERVAL 3 MINUTE), DATE_SUB(NOW(), INTERVAL 3 MINUTE));

-- ==================== ASSIGNMENT DATA ====================
-- Normalize assignment.status to schema ENUMs (uppercase)
INSERT INTO Assignment (dispatcher_id, incident_id, vehicle_id, time_assigned, time_resolved, status) VALUES
(13, 5, 2, DATE_SUB(NOW(), INTERVAL 30 MINUTE), NULL, 'ACTIVE'),
(14, 6, 4, DATE_SUB(NOW(), INTERVAL 20 MINUTE), NULL, 'ACTIVE'),
(15, 7, 9, DATE_SUB(NOW(), INTERVAL 45 MINUTE), NULL, 'ACTIVE'),
(16, 8, 15, DATE_SUB(NOW(), INTERVAL 25 MINUTE), NULL, 'ACTIVE'),

(13, 9, 1, DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_SUB(NOW(), INTERVAL 90 MINUTE), 'COMPLETED'),
(14, 10, 3, DATE_SUB(NOW(), INTERVAL 3 HOUR), DATE_SUB(NOW(), INTERVAL 2 HOUR), 'COMPLETED'),
(15, 11, 5, DATE_SUB(NOW(), INTERVAL 5 HOUR), DATE_SUB(NOW(), INTERVAL 4 HOUR), 'COMPLETED'),
(16, 12, 10, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 23 HOUR), 'COMPLETED'),

(13, 1, 6, DATE_SUB(NOW(), INTERVAL 15 MINUTE), DATE_SUB(NOW(), INTERVAL 10 MINUTE), 'CANCELED'), -- Vehicle went to maintenance
(14, 2, 7, DATE_SUB(NOW(), INTERVAL 8 MINUTE), DATE_SUB(NOW(), INTERVAL 5 MINUTE), 'CANCELED'), -- Incident resolved by others

(15, 3, 8, DATE_SUB(NOW(), INTERVAL 20 MINUTE), DATE_SUB(NOW(), INTERVAL 18 MINUTE), 'REJECTED'), -- Operator rejected
(16, 4, 11, DATE_SUB(NOW(), INTERVAL 3 MINUTE), DATE_SUB(NOW(), INTERVAL 2 MINUTE), 'REJECTED'), -- Vehicle not suitable

(13, 1, 1, DATE_SUB(NOW(), INTERVAL 5 MINUTE), NULL, 'ACTIVE'), -- Re-assigned after cancellation

(13, 16, 1, DATE_SUB(NOW(), INTERVAL 6 HOUR), DATE_SUB(NOW(), INTERVAL 345 MINUTE), 'COMPLETED'),

(14, 18, 3, DATE_SUB(NOW(), INTERVAL 30 MINUTE), DATE_SUB(NOW(), INTERVAL 28 MINUTE), 'COMPLETED'), -- 2 min response

(15, 16, 2, DATE_SUB(NOW(), INTERVAL 30 DAY), DATE_SUB(NOW(), INTERVAL 29 DAY), 'COMPLETED'),

(16, 13, 12, DATE_SUB(NOW(), INTERVAL 3 MINUTE), NULL, 'ACTIVE'),

(13, 14, 14, DATE_SUB(NOW(), INTERVAL 1 HOUR), DATE_SUB(NOW(), INTERVAL 59 MINUTE), 'COMPLETED'),
(13, 15, 14, DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_SUB(NOW(), INTERVAL 90 MINUTE), 'COMPLETED');

-- ==================== VERIFICATION QUERIES (optional) ====================
-- SELECT role, COUNT(*) as count FROM User GROUP BY role;
-- SELECT status, COUNT(*) as count FROM Incident GROUP BY status;
-- SELECT status, COUNT(*) as count FROM Vehicle GROUP BY status;
-- SELECT notification_type, COUNT(*) as count FROM Notification GROUP BY notification_type;
-- SELECT status, COUNT(*) as count FROM Assignment GROUP BY status;
