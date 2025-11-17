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
-- Edge cases: All three roles, special characters in names, various email formats

INSERT INTO User (name, email, password, role) VALUES
-- Operators
('John Smith', 'john.smith@emergency.gov', 'hashed_pass_1', 'operator'),
('María García', 'maria.garcia@emergency.gov', 'hashed_pass_2', 'operator'),
('李明 (Li Ming)', 'li.ming@emergency.gov', 'hashed_pass_3', 'operator'),
('Sarah O''Connor', 'sarah.oconnor@emergency.gov', 'hashed_pass_4', 'operator'),
('Inactive Operator', 'inactive.operator@emergency.gov', 'hashed_pass_5', 'operator'),

-- Citizens
('Alice Johnson', 'alice.j@gmail.com', 'hashed_pass_6', 'citizen'),
('Bob Brown', 'bob.brown@yahoo.com', 'hashed_pass_7', 'citizen'),
('Charlie Davis-Wilson', 'charlie+test@email.com', 'hashed_pass_8', 'citizen'),
('Deleted User Name', 'deleted@email.com', 'hashed_pass_9', 'citizen'),
('Anonymous Reporter', 'anon123@protonmail.com', 'hashed_pass_10', 'citizen'),
('Test Citizen', 'test.citizen@test.com', 'hashed_pass_11', 'citizen'),
('José Hernández', 'jose.hernandez@mail.com', 'hashed_pass_12', 'citizen'),

-- Dispatchers
('Emma Wilson', 'emma.wilson@dispatch.gov', 'hashed_pass_13', 'dispatcher'),
('Michael Chen', 'michael.chen@dispatch.gov', 'hashed_pass_14', 'dispatcher'),
('Rebecca Taylor', 'rebecca.taylor@dispatch.gov', 'hashed_pass_15', 'dispatcher'),
('David Kim', 'david.kim@dispatch.gov', 'hashed_pass_16', 'dispatcher');

-- ==================== INCIDENT DATA ====================
-- Edge cases: All statuses, NULL citizen_id, same location incidents,
-- extreme coordinates, time edge cases, various types

INSERT INTO Incident (type, level, description, latitude, longitude, status, time_reported, time_resolved, citizen_id) VALUES
-- Pending incidents
('Fire', 'Critical', 'Large building fire, multiple floors affected', 40.7128, -74.0060, 'pending', DATE_SUB(NOW(), INTERVAL 10 MINUTE), NULL, 6),
('Medical', 'High', 'Heart attack patient, needs immediate attention', 40.7580, -73.9855, 'pending', DATE_SUB(NOW(), INTERVAL 5 MINUTE), NULL, 7),
('Accident', 'Medium', 'Vehicle collision at intersection', 40.7489, -73.9680, 'pending', DATE_SUB(NOW(), INTERVAL 15 MINUTE), NULL, 8),
('Crime', 'High', 'Armed robbery in progress', 40.7614, -73.9776, 'pending', DATE_SUB(NOW(), INTERVAL 2 MINUTE), NULL, NULL), -- Anonymous report

-- Assigned incidents
('Fire', 'High', 'Apartment fire, 3rd floor', 40.7306, -73.9352, 'assigned', DATE_SUB(NOW(), INTERVAL 30 MINUTE), NULL, 9),
('Medical', 'Critical', 'Multiple casualty accident', 40.7549, -73.9840, 'assigned', DATE_SUB(NOW(), INTERVAL 20 MINUTE), NULL, 10),
('Flood', 'Medium', 'Water main break, street flooding', 40.7282, -74.0776, 'assigned', DATE_SUB(NOW(), INTERVAL 45 MINUTE), NULL, 11),
('Gas Leak', 'High', 'Natural gas odor reported, building evacuated', 40.7589, -73.9851, 'assigned', DATE_SUB(NOW(), INTERVAL 25 MINUTE), NULL, 12),

-- Resolved incidents
('Fire', 'Low', 'Small kitchen fire, extinguished', 40.7480, -73.9862, 'resolved', DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_SUB(NOW(), INTERVAL 90 MINUTE), 6),
('Medical', 'Medium', 'Elderly person fallen, minor injuries', 40.7614, -73.9776, 'resolved', DATE_SUB(NOW(), INTERVAL 3 HOUR), DATE_SUB(NOW(), INTERVAL 2 HOUR), 7),
('Accident', 'Low', 'Minor fender bender', 40.7580, -73.9855, 'resolved', DATE_SUB(NOW(), INTERVAL 5 HOUR), DATE_SUB(NOW(), INTERVAL 4 HOUR), 8),
('Crime', 'Medium', 'Theft reported at store', 40.7128, -74.0060, 'resolved', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 23 HOUR), 11),

-- Edge cases: Multiple incidents at same location
('Medical', 'Low', 'Person feeling faint', 40.7128, -74.0060, 'pending', DATE_SUB(NOW(), INTERVAL 3 MINUTE), NULL, 12),

-- Edge cases: Extreme coordinates (valid range boundaries)
('Accident', 'Medium', 'Incident at northern boundary', 89.999999, -180.0, 'pending', DATE_SUB(NOW(), INTERVAL 1 HOUR), NULL, 6),
('Medical', 'High', 'Incident at southern boundary', -89.999999, 180.0, 'pending', DATE_SUB(NOW(), INTERVAL 30 MINUTE), NULL, 7),

-- Edge cases: Very old incident (recently resolved)
('Fire', 'High', 'Historical incident - warehouse fire', 40.7282, -73.9776, 'resolved', DATE_SUB(NOW(), INTERVAL 30 DAY), DATE_SUB(NOW(), INTERVAL 29 DAY), 8),

-- Edge cases: Long description
('Other', 'Medium', 'This is an incident with a very long description that goes into extensive detail about the situation. The reporter has provided multiple paragraphs of information including the exact sequence of events, all parties involved, potential hazards, and specific requests for assistance. This tests how the system handles larger text fields and ensures that database character limits are appropriate for real-world usage scenarios.', 40.7589, -73.9680, 'pending', DATE_SUB(NOW(), INTERVAL 8 MINUTE), NULL, 10),

-- Edge cases: Minimal description
('Other', 'Low', 'Help', 40.7306, -73.9840, 'resolved', DATE_SUB(NOW(), INTERVAL 6 HOUR), DATE_SUB(NOW(), INTERVAL 345 MINUTE), 11),

-- Edge cases: NULL description
('Medical', 'Medium', NULL, 40.7489, -74.0776, 'pending', DATE_SUB(NOW(), INTERVAL 12 MINUTE), NULL, 12);

-- ==================== VEHICLE DATA ====================
-- Edge cases: Various types, all statuses, NULL operator_id,
-- different capacities, vehicles without operators

INSERT INTO Vehicle (type, status, capacity, operator_id) VALUES
-- Active vehicles with operators
('Ambulance', 'available', 2, 1),
('Fire Truck', 'on_duty', 6, 2),
('Police Car', 'available', 4, 3),
('Ambulance', 'on_duty', 2, 4),
('Fire Truck', 'available', 8, 1),

-- Vehicles in maintenance
('Ambulance', 'maintenance', 2, NULL),
('Police Car', 'maintenance', 4, NULL),

-- Out of service vehicles
('Fire Truck', 'out_of_service', 6, NULL),

-- Vehicles with various capacities
('Rescue Boat', 'available', 12, 2),
('Helicopter', 'available', 4, 3),
('Motorcycle', 'available', 1, 4), -- Minimum capacity edge case

-- Vehicles without assigned operators (available pool)
('Ambulance', 'available', 2, NULL),
('Police Car', 'available', 4, NULL),
('Fire Truck', 'available', 6, NULL),

-- Special vehicle types
('Hazmat Unit', 'on_duty', 4, 1),
('K9 Unit', 'available', 2, 2),
('SWAT Van', 'available', 10, NULL);

-- ==================== VEHICLE LOCATION DATA ====================
-- Edge cases: Multiple locations per vehicle (tracking over time),
-- extreme coordinates, same location different times

INSERT INTO vehicle_location (vehicle_id, longitude, latitude, time_stamp) VALUES
-- Vehicle 1 (Ambulance) tracking history
(1, -74.0060, 40.7128, DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(1, -74.0050, 40.7138, DATE_SUB(NOW(), INTERVAL 45 MINUTE)),
(1, -74.0040, 40.7148, DATE_SUB(NOW(), INTERVAL 30 MINUTE)),
(1, -74.0030, 40.7158, DATE_SUB(NOW(), INTERVAL 15 MINUTE)),
(1, -74.0020, 40.7168, NOW()),

-- Vehicle 2 (Fire Truck) tracking - on route to incident
(2, -73.9855, 40.7580, DATE_SUB(NOW(), INTERVAL 30 MINUTE)),
(2, -73.9865, 40.7570, DATE_SUB(NOW(), INTERVAL 25 MINUTE)),
(2, -73.9875, 40.7560, DATE_SUB(NOW(), INTERVAL 20 MINUTE)),
(2, -73.9352, 40.7306, NOW()), -- At incident location

-- Vehicle 3 (Police Car) - stationary
(3, -73.9680, 40.7489, DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(3, -73.9680, 40.7489, DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(3, -73.9680, 40.7489, NOW()),

-- Vehicle 4 (Ambulance) - rapid movement
(4, -73.9840, 40.7549, DATE_SUB(NOW(), INTERVAL 10 MINUTE)),
(4, -73.9850, 40.7559, DATE_SUB(NOW(), INTERVAL 8 MINUTE)),
(4, -73.9860, 40.7569, DATE_SUB(NOW(), INTERVAL 6 MINUTE)),
(4, -73.9870, 40.7579, DATE_SUB(NOW(), INTERVAL 4 MINUTE)),
(4, -73.9880, 40.7589, DATE_SUB(NOW(), INTERVAL 2 MINUTE)),
(4, -73.9851, 40.7589, NOW()),

-- Vehicles 5-10 - current locations only
(5, -74.0776, 40.7282, NOW()),
(6, -73.9862, 40.7480, DATE_SUB(NOW(), INTERVAL 3 DAY)), -- Old location for maintenance vehicle
(7, -73.9776, 40.7614, DATE_SUB(NOW(), INTERVAL 5 DAY)), -- Old location for maintenance vehicle
(8, -73.9855, 40.7580, DATE_SUB(NOW(), INTERVAL 10 DAY)), -- Very old location for out_of_service
(9, -73.9680, 40.7489, NOW()),
(10, -73.9840, 40.7549, NOW()),

-- Edge case: Extreme coordinates
(11, -180.0, 89.999999, NOW()),
(12, 180.0, -89.999999, NOW()),

-- Multiple vehicles at same location (station)
(13, -74.0060, 40.7128, NOW()),
(14, -74.0060, 40.7128, NOW()),
(15, -74.0060, 40.7128, NOW());

-- ==================== NOTIFICATION DATA ====================
-- Edge cases: All notification types, NULL time_delivered (unread),
-- various delivery delays, multiple notifications to same user

INSERT INTO Notification (notified_id, notification_type, content, time_sent, time_delivered) VALUES
-- incident_alert notifications
(6, 'incident_alert', 'Your reported fire incident has been assigned to Fire Truck #2', DATE_SUB(NOW(), INTERVAL 25 MINUTE), DATE_SUB(NOW(), INTERVAL 25 MINUTE)),
(7, 'incident_alert', 'Medical emergency assigned. Ambulance en route.', DATE_SUB(NOW(), INTERVAL 18 MINUTE), DATE_SUB(NOW(), INTERVAL 18 MINUTE)),
(8, 'incident_alert', 'Your accident report is being processed', DATE_SUB(NOW(), INTERVAL 12 MINUTE), NULL), -- Undelivered

-- assignment_request notifications
(1, 'assignment_request', 'New assignment: Fire incident at 40.7306, -73.9352', DATE_SUB(NOW(), INTERVAL 30 MINUTE), DATE_SUB(NOW(), INTERVAL 29 MINUTE)),
(2, 'assignment_request', 'Emergency medical response needed at intersection', DATE_SUB(NOW(), INTERVAL 20 MINUTE), DATE_SUB(NOW(), INTERVAL 19 MINUTE)),
(3, 'assignment_request', 'Crime in progress - immediate response required', DATE_SUB(NOW(), INTERVAL 2 MINUTE), NULL), -- Just sent
(4, 'assignment_request', 'Gas leak emergency - proceed to location', DATE_SUB(NOW(), INTERVAL 25 MINUTE), DATE_SUB(NOW(), INTERVAL 24 MINUTE)),

-- assignment_response notifications
(13, 'assignment_response', 'Operator John Smith accepted assignment #1', DATE_SUB(NOW(), INTERVAL 29 MINUTE), DATE_SUB(NOW(), INTERVAL 29 MINUTE)),
(14, 'assignment_response', 'Assignment #2 completed successfully', DATE_SUB(NOW(), INTERVAL 10 MINUTE), DATE_SUB(NOW(), INTERVAL 10 MINUTE)),
(15, 'assignment_response', 'Assignment #3 rejected by operator - vehicle unavailable', DATE_SUB(NOW(), INTERVAL 5 MINUTE), DATE_SUB(NOW(), INTERVAL 5 MINUTE)),

-- general notifications
(1, 'general', 'System maintenance scheduled for tonight at 2 AM', DATE_SUB(NOW(), INTERVAL 5 HOUR), DATE_SUB(NOW(), INTERVAL 4 HOUR)),
(13, 'general', 'New dispatch protocol effective immediately', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 23 HOUR)),
(14, 'general', 'Training session scheduled for next week', DATE_SUB(NOW(), INTERVAL 2 DAY), NULL), -- Unread

-- Edge cases: Long content
(6, 'general', 'This is a notification with extensive content that provides detailed information about multiple topics. It includes instructions, warnings, procedural updates, and contact information. This tests the system''s ability to handle longer notification messages that might be sent during complex emergency situations or for administrative purposes that require detailed explanations.', DATE_SUB(NOW(), INTERVAL 30 MINUTE), DATE_SUB(NOW(), INTERVAL 25 MINUTE)),

-- Edge cases: Multiple notifications to same user
(1, 'assignment_request', 'Additional assignment - backup requested', DATE_SUB(NOW(), INTERVAL 15 MINUTE), DATE_SUB(NOW(), INTERVAL 14 MINUTE)),
(1, 'assignment_request', 'Priority assignment - update on previous incident', DATE_SUB(NOW(), INTERVAL 10 MINUTE), DATE_SUB(NOW(), INTERVAL 9 MINUTE)),
(1, 'general', 'Shift change reminder', DATE_SUB(NOW(), INTERVAL 1 HOUR), NULL),

-- Edge cases: Delayed delivery
(2, 'incident_alert', 'Notification sent but delayed', DATE_SUB(NOW(), INTERVAL 1 HOUR), DATE_SUB(NOW(), INTERVAL 30 MINUTE)), -- 30 min delay
(3, 'general', 'System alert', DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_SUB(NOW(), INTERVAL 10 MINUTE)), -- Very delayed

-- Edge cases: Rapid succession notifications
(10, 'incident_alert', 'Incident status update 1', DATE_SUB(NOW(), INTERVAL 5 MINUTE), DATE_SUB(NOW(), INTERVAL 5 MINUTE)),
(10, 'incident_alert', 'Incident status update 2', DATE_SUB(NOW(), INTERVAL 4 MINUTE), DATE_SUB(NOW(), INTERVAL 4 MINUTE)),
(10, 'incident_alert', 'Incident status update 3', DATE_SUB(NOW(), INTERVAL 3 MINUTE), DATE_SUB(NOW(), INTERVAL 3 MINUTE));

-- ==================== ASSIGNMENT DATA ====================
-- Edge cases: All statuses, multiple assignments per incident,
-- canceled/rejected assignments, completed assignments with time_resolved

INSERT INTO Assignment (dispatcher_id, incident_id, vehicle_id, time_assigned, time_resolved, status) VALUES
-- active assignments
(13, 5, 2, DATE_SUB(NOW(), INTERVAL 30 MINUTE), NULL, 'active'),
(14, 6, 4, DATE_SUB(NOW(), INTERVAL 20 MINUTE), NULL, 'active'),
(15, 7, 9, DATE_SUB(NOW(), INTERVAL 45 MINUTE), NULL, 'active'),
(16, 8, 15, DATE_SUB(NOW(), INTERVAL 25 MINUTE), NULL, 'active'),

-- completed assignments
(13, 9, 1, DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_SUB(NOW(), INTERVAL 90 MINUTE), 'completed'),
(14, 10, 3, DATE_SUB(NOW(), INTERVAL 3 HOUR), DATE_SUB(NOW(), INTERVAL 2 HOUR), 'completed'),
(15, 11, 5, DATE_SUB(NOW(), INTERVAL 5 HOUR), DATE_SUB(NOW(), INTERVAL 4 HOUR), 'completed'),
(16, 12, 10, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 23 HOUR), 'completed'),

-- canceled assignments
(13, 1, 6, DATE_SUB(NOW(), INTERVAL 15 MINUTE), DATE_SUB(NOW(), INTERVAL 10 MINUTE), 'canceled'), -- Vehicle went to maintenance
(14, 2, 7, DATE_SUB(NOW(), INTERVAL 8 MINUTE), DATE_SUB(NOW(), INTERVAL 5 MINUTE), 'canceled'), -- Incident resolved by others

-- rejected assignments
(15, 3, 8, DATE_SUB(NOW(), INTERVAL 20 MINUTE), DATE_SUB(NOW(), INTERVAL 18 MINUTE), 'rejected'), -- Operator rejected
(16, 4, 11, DATE_SUB(NOW(), INTERVAL 3 MINUTE), DATE_SUB(NOW(), INTERVAL 2 MINUTE), 'rejected'), -- Vehicle not suitable

-- Edge case: Multiple assignments for same incident (first rejected/canceled, then active)
(13, 1, 1, DATE_SUB(NOW(), INTERVAL 5 MINUTE), NULL, 'active'), -- Re-assigned after cancellation

-- Edge case: Same vehicle multiple assignments over time
(13, 16, 1, DATE_SUB(NOW(), INTERVAL 6 HOUR), DATE_SUB(NOW(), INTERVAL 345 MINUTE), 'completed'),

-- Edge case: Very quick completion
(14, 18, 3, DATE_SUB(NOW(), INTERVAL 30 MINUTE), DATE_SUB(NOW(), INTERVAL 28 MINUTE), 'completed'), -- 2 min response

-- Edge case: Long-running assignment
(15, 16, 2, DATE_SUB(NOW(), INTERVAL 30 DAY), DATE_SUB(NOW(), INTERVAL 29 DAY), 'completed'),

-- Edge case: Assignment to vehicle without operator (pool vehicle)
(16, 13, 12, DATE_SUB(NOW(), INTERVAL 3 MINUTE), NULL, 'active'),

-- Edge case: Multiple assignments by same dispatcher
(13, 14, 14, DATE_SUB(NOW(), INTERVAL 1 HOUR), DATE_SUB(NOW(), INTERVAL 59 MINUTE), 'completed'),
(13, 15, 14, DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_SUB(NOW(), INTERVAL 90 MINUTE), 'completed');

-- ==================== VERIFICATION QUERIES ====================
-- Uncomment these to verify the data after insertion

-- SELECT role, COUNT(*) as count FROM User GROUP BY role;
-- SELECT status, COUNT(*) as count FROM Incident GROUP BY status;
-- SELECT status, COUNT(*) as count FROM Vehicle GROUP BY status;
-- SELECT notification_type, COUNT(*) as count FROM Notification GROUP BY notification_type;
-- SELECT status, COUNT(*) as count FROM Assignment GROUP BY status;

-- Check for NULL citizen_id incidents
-- SELECT COUNT(*) as anonymous_incidents FROM Incident WHERE citizen_id IS NULL;

-- Check for undelivered notifications
-- SELECT COUNT(*) as undelivered FROM Notification WHERE time_delivered IS NULL;

-- Verify all enum values are represented
-- SELECT DISTINCT role FROM User ORDER BY role;
-- SELECT DISTINCT status FROM Incident ORDER BY status;
-- SELECT DISTINCT notification_type FROM Notification ORDER BY notification_type;
-- SELECT DISTINCT status FROM Assignment ORDER BY status;