INSERT INTO `User` (name, email, password, role) VALUES
  ('Operator 001', 'operator001@sim.local', 'password', 'OPERATOR'),
  ('Operator 002', 'operator002@sim.local', 'password', 'OPERATOR'),
  ('Operator 003', 'operator003@sim.local', 'password', 'OPERATOR'),
  ('Operator 004', 'operator004@sim.local', 'password', 'OPERATOR'),
  ('Operator 005', 'operator005@sim.local', 'password', 'OPERATOR'),
  ('Operator 006', 'operator006@sim.local', 'password', 'OPERATOR'),
  ('Operator 007', 'operator007@sim.local', 'password', 'OPERATOR'),
  ('Operator 008', 'operator008@sim.local', 'password', 'OPERATOR'),
  ('Operator 009', 'operator009@sim.local', 'password', 'OPERATOR'),
  ('Operator 010', 'operator010@sim.local', 'password', 'OPERATOR');

-- Capture first inserted user id
SET @first_new_user_id = LAST_INSERT_ID();
SET @num = 10;


INSERT INTO `User` (name, email, password, role) VALUES
('admin', 'admin@sim.local', 'password', 'ADMIN'),
('citizen', 'citizen@sim.local', 'password', 'CITIZEN'),
('dispatcher', 'dispatcher@sim.local', 'password', 'DISPATCHER');


SET @r := -1;
INSERT INTO Vehicle (type, status, capacity, operator_id)
SELECT
  CASE MOD(@r := @r + 1, 3)
    WHEN 0 THEN 'AMBULANCE'
    WHEN 1 THEN 'FIRETRUCK'
    ELSE 'POLICE'
  END AS type,
  'AVAILABLE' AS status,
  CASE MOD(@r, 3)
    WHEN 0 THEN 2
    WHEN 1 THEN 8
    ELSE 4
  END AS capacity,
  u.id AS operator_id
FROM `User` u
WHERE u.email LIKE 'operator%@sim.local'
ORDER BY u.id
LIMIT 10;

INSERT INTO vehicle_location (vehicle_id, longitude, latitude, time_stamp) VALUES
  (1, 28.34975251, 28.86929154, CURRENT_TIMESTAMP),
  (2, 28.04430201, 31.20815448, CURRENT_TIMESTAMP),
  (3, 31.63917331, 28.4480296, CURRENT_TIMESTAMP),
  (4, 28.38344461, 29.24073351, CURRENT_TIMESTAMP),
  (5, 31.3472012, 30.07794806, CURRENT_TIMESTAMP),
  (6, 29.66618017, 29.84979814, CURRENT_TIMESTAMP),
  (7, 28.93508486, 31.39965681, CURRENT_TIMESTAMP),
  (8, 29.52671987, 28.13256366, CURRENT_TIMESTAMP),
  (9, 29.63084463, 29.13196177, CURRENT_TIMESTAMP),
  (10, 29.63802443, 28.5853754, CURRENT_TIMESTAMP);



  SET @citizen_id = NULL;

-- Batch insert for all incidents (optimized for performance)
INSERT INTO Incident (type, level, description, latitude, longitude, status, time_reported, time_resolved, citizen_id) VALUES
-- January 2024 (15 incidents)
('FIRE', 'HIGH', 'Residential building fire', 30.0444, 31.2357, 'RESOLVED', '2024-01-05 10:30:00', '2024-01-05 13:45:00', @citizen_id),
('FIRE', 'MEDIUM', 'Vehicle fire on highway', 30.0626, 31.2497, 'RESOLVED', '2024-01-08 14:20:00', '2024-01-08 15:30:00', @citizen_id),
('FIRE', 'MEDIUM', 'Kitchen fire in apartment', 30.0555, 31.2280, 'RESOLVED', '2024-01-20 18:45:00', '2024-01-20 20:00:00', @citizen_id),
('MEDICAL', 'HIGH', 'Heart attack emergency', 30.0444, 31.2357, 'RESOLVED', '2024-01-03 08:30:00', '2024-01-03 09:15:00', @citizen_id),
('MEDICAL', 'HIGH', 'Car accident with injuries', 30.0626, 31.2497, 'RESOLVED', '2024-01-07 16:45:00', '2024-01-07 17:30:00', @citizen_id),
('MEDICAL', 'MEDIUM', 'Broken leg fall', 30.0331, 31.2331, 'RESOLVED', '2024-01-10 11:20:00', '2024-01-10 12:00:00', @citizen_id),
('MEDICAL', 'HIGH', 'Severe allergic reaction', 30.0555, 31.2280, 'RESOLVED', '2024-01-18 19:00:00', '2024-01-18 19:45:00', @citizen_id),
('MEDICAL', 'MEDIUM', 'Sports injury', 30.0444, 31.2357, 'RESOLVED', '2024-01-25 14:30:00', '2024-01-25 15:15:00', @citizen_id),
('CRIME', 'HIGH', 'Armed robbery in progress', 30.0444, 31.2357, 'RESOLVED', '2024-01-06 23:15:00', '2024-01-07 00:30:00', @citizen_id),
('CRIME', 'MEDIUM', 'Shoplifting incident', 30.0626, 31.2497, 'RESOLVED', '2024-01-11 15:30:00', '2024-01-11 16:15:00', @citizen_id),
('CRIME', 'MEDIUM', 'Vandalism report', 30.0876, 31.3421, 'RESOLVED', '2024-01-22 07:30:00', '2024-01-22 08:30:00', @citizen_id),
('CRIME', 'HIGH', 'Domestic violence call', 30.0555, 31.2280, 'RESOLVED', '2024-01-25 02:15:00', '2024-01-25 03:30:00', @citizen_id),
('MEDICAL', 'LOW', 'Minor cuts', 30.0876, 31.3421, 'RESOLVED', '2024-01-14 13:30:00', '2024-01-14 14:15:00', @citizen_id),
('FIRE', 'LOW', 'Trash bin fire', 30.0331, 31.2331, 'RESOLVED', '2024-01-12 09:15:00', '2024-01-12 09:45:00', @citizen_id),
('CRIME', 'LOW', 'Noise complaint', 30.0331, 31.2331, 'RESOLVED', '2024-01-16 21:00:00', '2024-01-16 21:45:00', @citizen_id),

-- February 2024 (18 incidents)
('FIRE', 'HIGH', 'Factory warehouse fire', 30.0626, 31.2497, 'RESOLVED', '2024-02-09 20:15:00', '2024-02-10 02:45:00', @citizen_id),
('FIRE', 'MEDIUM', 'Electrical fire in office', 30.0444, 31.2357, 'RESOLVED', '2024-02-02 11:30:00', '2024-02-02 13:00:00', @citizen_id),
('FIRE', 'MEDIUM', 'Car fire in parking lot', 30.0876, 31.3421, 'RESOLVED', '2024-02-19 09:45:00', '2024-02-19 10:30:00', @citizen_id),
('FIRE', 'HIGH', 'Multi-unit apartment fire', 30.0555, 31.2280, 'RESOLVED', '2024-02-24 03:00:00', '2024-02-24 07:15:00', @citizen_id),
('MEDICAL', 'HIGH', 'Stroke emergency', 30.0444, 31.2357, 'RESOLVED', '2024-02-01 06:45:00', '2024-02-01 07:30:00', @citizen_id),
('MEDICAL', 'HIGH', 'Motorcycle accident', 30.0331, 31.2331, 'RESOLVED', '2024-02-10 12:30:00', '2024-02-10 13:45:00', @citizen_id),
('MEDICAL', 'MEDIUM', 'Sports injury at gym', 30.0626, 31.2497, 'RESOLVED', '2024-02-05 17:20:00', '2024-02-05 18:00:00', @citizen_id),
('MEDICAL', 'MEDIUM', 'Diabetic emergency', 30.0555, 31.2280, 'RESOLVED', '2024-02-20 16:00:00', '2024-02-20 16:45:00', @citizen_id),
('MEDICAL', 'HIGH', 'Construction accident', 30.0876, 31.3421, 'RESOLVED', '2024-02-15 10:30:00', '2024-02-15 12:00:00', @citizen_id),
('CRIME', 'HIGH', 'Bank robbery', 30.0626, 31.2497, 'RESOLVED', '2024-02-08 14:15:00', '2024-02-08 16:00:00', @citizen_id),
('CRIME', 'MEDIUM', 'Break-in attempt', 30.0444, 31.2357, 'RESOLVED', '2024-02-03 04:30:00', '2024-02-03 05:45:00', @citizen_id),
('CRIME', 'MEDIUM', 'Public intoxication', 30.0876, 31.3421, 'RESOLVED', '2024-02-18 22:45:00', '2024-02-18 23:30:00', @citizen_id),
('CRIME', 'HIGH', 'Assault case', 30.0555, 31.2280, 'RESOLVED', '2024-02-23 01:15:00', '2024-02-23 02:30:00', @citizen_id),
('MEDICAL', 'LOW', 'Minor burn treatment', 30.0876, 31.3421, 'RESOLVED', '2024-02-15 10:15:00', '2024-02-15 10:45:00', @citizen_id),
('FIRE', 'LOW', 'Grass fire in park', 30.0331, 31.2331, 'RESOLVED', '2024-02-14 14:20:00', '2024-02-14 15:00:00', @citizen_id),
('CRIME', 'LOW', 'Parking dispute', 30.0331, 31.2331, 'RESOLVED', '2024-02-13 18:30:00', '2024-02-13 19:00:00', @citizen_id),
('MEDICAL', 'MEDIUM', 'Chest pain', 30.0444, 31.2357, 'RESOLVED', '2024-02-27 09:00:00', '2024-02-27 10:15:00', @citizen_id),
('CRIME', 'MEDIUM', 'Vehicle theft', 30.0626, 31.2497, 'RESOLVED', '2024-02-28 03:00:00', '2024-02-28 04:30:00', @citizen_id),

-- March 2024 (16 incidents)
('FIRE', 'HIGH', 'Chemical plant fire', 30.0331, 31.2331, 'RESOLVED', '2024-03-16 15:45:00', '2024-03-17 01:00:00', @citizen_id),
('FIRE', 'MEDIUM', 'Restaurant kitchen fire', 30.0626, 31.2497, 'RESOLVED', '2024-03-11 21:00:00', '2024-03-11 23:30:00', @citizen_id),
('FIRE', 'MEDIUM', 'Garage fire', 30.0876, 31.3421, 'RESOLVED', '2024-03-22 08:20:00', '2024-03-22 09:45:00', @citizen_id),
('MEDICAL', 'HIGH', 'Choking emergency', 30.0444, 31.2357, 'RESOLVED', '2024-03-02 12:15:00', '2024-03-02 12:45:00', @citizen_id),
('MEDICAL', 'HIGH', 'Construction site injury', 30.0331, 31.2331, 'RESOLVED', '2024-03-12 10:00:00', '2024-03-12 11:30:00', @citizen_id),
('MEDICAL', 'HIGH', 'Poisoning case', 30.0555, 31.2280, 'RESOLVED', '2024-03-23 20:00:00', '2024-03-23 21:15:00', @citizen_id),
('MEDICAL', 'MEDIUM', 'Asthma attack', 30.0626, 31.2497, 'RESOLVED', '2024-03-07 14:30:00', '2024-03-07 15:15:00', @citizen_id),
('MEDICAL', 'MEDIUM', 'Burn injury', 30.0876, 31.3421, 'RESOLVED', '2024-03-18 11:00:00', '2024-03-18 12:00:00', @citizen_id),
('CRIME', 'HIGH', 'Armed assault', 30.0331, 31.2331, 'RESOLVED', '2024-03-15 23:00:00', '2024-03-16 00:45:00', @citizen_id),
('CRIME', 'MEDIUM', 'Vehicle theft', 30.0444, 31.2357, 'RESOLVED', '2024-03-05 05:30:00', '2024-03-05 07:00:00', @citizen_id),
('CRIME', 'MEDIUM', 'Fraud report', 30.0876, 31.3421, 'RESOLVED', '2024-03-20 09:15:00', '2024-03-20 10:30:00', @citizen_id),
('CRIME', 'MEDIUM', 'Burglary', 30.0555, 31.2280, 'RESOLVED', '2024-03-28 02:30:00', '2024-03-28 04:00:00', @citizen_id),
('FIRE', 'LOW', 'Small kitchen fire', 30.0444, 31.2357, 'RESOLVED', '2024-03-04 19:30:00', '2024-03-04 20:15:00', @citizen_id),
('MEDICAL', 'LOW', 'Sprained ankle', 30.0876, 31.3421, 'RESOLVED', '2024-03-17 16:45:00', '2024-03-17 17:15:00', @citizen_id),
('CRIME', 'LOW', 'Trespassing', 30.0626, 31.2497, 'RESOLVED', '2024-03-10 13:45:00', '2024-03-10 14:30:00', @citizen_id),
('CRIME', 'LOW', 'Bicycle theft', 30.0555, 31.2280, 'RESOLVED', '2024-03-25 11:30:00', '2024-03-25 12:15:00', @citizen_id),

-- April 2024 (14 incidents)
('FIRE', 'HIGH', 'School building fire', 30.0444, 31.2357, 'RESOLVED', '2024-04-03 16:00:00', '2024-04-03 20:30:00', @citizen_id),
('FIRE', 'MEDIUM', 'Attic fire', 30.0626, 31.2497, 'RESOLVED', '2024-04-09 13:15:00', '2024-04-09 14:45:00', @citizen_id),
('FIRE', 'MEDIUM', 'Basement fire', 30.0876, 31.3421, 'RESOLVED', '2024-04-19 22:15:00', '2024-04-19 23:45:00', @citizen_id),
('MEDICAL', 'HIGH', 'Cardiac arrest', 30.0444, 31.2357, 'RESOLVED', '2024-04-01 07:00:00', '2024-04-01 08:00:00', @citizen_id),
('MEDICAL', 'HIGH', 'Pedestrian hit by car', 30.0331, 31.2331, 'RESOLVED', '2024-04-11 11:45:00', '2024-04-11 13:00:00', @citizen_id),
('MEDICAL', 'MEDIUM', 'Seizure episode', 30.0626, 31.2497, 'RESOLVED', '2024-04-06 15:30:00', '2024-04-06 16:15:00', @citizen_id),
('MEDICAL', 'MEDIUM', 'Heat exhaustion', 30.0555, 31.2280, 'RESOLVED', '2024-04-21 13:30:00', '2024-04-21 14:15:00', @citizen_id),
('MEDICAL', 'MEDIUM', 'Workplace injury', 30.0876, 31.3421, 'RESOLVED', '2024-04-27 10:00:00', '2024-04-27 11:15:00', @citizen_id),
('CRIME', 'HIGH', 'Kidnapping attempt', 30.0331, 31.2331, 'RESOLVED', '2024-04-13 06:15:00', '2024-04-13 08:30:00', @citizen_id),
('CRIME', 'MEDIUM', 'Package theft', 30.0626, 31.2497, 'RESOLVED', '2024-04-08 10:30:00', '2024-04-08 11:30:00', @citizen_id),
('CRIME', 'MEDIUM', 'Property damage', 30.0876, 31.3421, 'RESOLVED', '2024-04-18 12:00:00', '2024-04-18 13:15:00', @citizen_id),
('FIRE', 'LOW', 'BBQ fire contained', 30.0331, 31.2331, 'RESOLVED', '2024-04-14 17:30:00', '2024-04-14 18:00:00', @citizen_id),
('MEDICAL', 'LOW', 'Minor laceration', 30.0876, 31.3421, 'RESOLVED', '2024-04-16 14:00:00', '2024-04-16 14:30:00', @citizen_id),
('CRIME', 'LOW', 'Loitering complaint', 30.0444, 31.2357, 'RESOLVED', '2024-04-04 19:00:00', '2024-04-04 19:45:00', @citizen_id),

-- May 2024 (17 incidents)
('FIRE', 'HIGH', 'High-rise building fire', 30.0626, 31.2497, 'RESOLVED', '2024-05-12 18:45:00', '2024-05-13 02:00:00', @citizen_id),
('FIRE', 'MEDIUM', 'Warehouse fire', 30.0444, 31.2357, 'RESOLVED', '2024-05-05 04:30:00', '2024-05-05 07:15:00', @citizen_id),
('FIRE', 'MEDIUM', 'Electrical panel fire', 30.0876, 31.3421, 'RESOLVED', '2024-05-23 14:15:00', '2024-05-23 15:30:00', @citizen_id),
('FIRE', 'MEDIUM', 'Vehicle fire', 30.0555, 31.2280, 'RESOLVED', '2024-05-28 16:00:00', '2024-05-28 17:15:00', @citizen_id),
('MEDICAL', 'HIGH', 'Severe bleeding trauma', 30.0444, 31.2357, 'RESOLVED', '2024-05-02 21:00:00', '2024-05-02 22:15:00', @citizen_id),
('MEDICAL', 'HIGH', 'Drug overdose', 30.0331, 31.2331, 'RESOLVED', '2024-05-14 03:15:00', '2024-05-14 04:45:00', @citizen_id),
('MEDICAL', 'HIGH', 'Multi-vehicle crash', 30.0626, 31.2497, 'RESOLVED', '2024-05-20 17:30:00', '2024-05-20 19:00:00', @citizen_id),
('MEDICAL', 'MEDIUM', 'Broken arm', 30.0626, 31.2497, 'RESOLVED', '2024-05-08 10:30:00', '2024-05-08 11:30:00', @citizen_id),
('MEDICAL', 'MEDIUM', 'Allergic reaction', 30.0555, 31.2280, 'RESOLVED', '2024-05-25 12:45:00', '2024-05-25 13:30:00', @citizen_id),
('CRIME', 'HIGH', 'Home invasion', 30.0444, 31.2357, 'RESOLVED', '2024-05-06 02:30:00', '2024-05-06 04:15:00', @citizen_id),
('CRIME', 'HIGH', 'Armed robbery', 30.0331, 31.2331, 'RESOLVED', '2024-05-18 23:00:00', '2024-05-19 00:45:00', @citizen_id),
('CRIME', 'MEDIUM', 'Cyber fraud', 30.0626, 31.2497, 'RESOLVED', '2024-05-11 11:00:00', '2024-05-11 12:30:00', @citizen_id),
('CRIME', 'MEDIUM', 'Public disturbance', 30.0876, 31.3421, 'RESOLVED', '2024-05-22 20:00:00', '2024-05-22 21:00:00', @citizen_id),
('FIRE', 'LOW', 'Dumpster fire', 30.0331, 31.2331, 'RESOLVED', '2024-05-17 09:00:00', '2024-05-17 09:30:00', @citizen_id),
('MEDICAL', 'LOW', 'Mild dehydration', 30.0876, 31.3421, 'RESOLVED', '2024-05-19 16:00:00', '2024-05-19 16:30:00', @citizen_id),
('CRIME', 'LOW', 'Traffic violation', 30.0331, 31.2331, 'RESOLVED', '2024-05-16 15:30:00', '2024-05-16 16:00:00', @citizen_id),
('MEDICAL', 'MEDIUM', 'Fall injury', 30.0444, 31.2357, 'RESOLVED', '2024-05-30 14:00:00', '2024-05-30 15:00:00', @citizen_id),

-- June 2024 (15 incidents)
('FIRE', 'HIGH', 'Gas station fire', 30.0331, 31.2331, 'RESOLVED', '2024-06-16 05:45:00', '2024-06-16 09:30:00', @citizen_id),
('FIRE', 'MEDIUM', 'Shop fire', 30.0626, 31.2497, 'RESOLVED', '2024-06-10 11:30:00', '2024-06-10 13:15:00', @citizen_id),
('FIRE', 'MEDIUM', 'Deck fire', 30.0876, 31.3421, 'RESOLVED', '2024-06-23 16:30:00', '2024-06-23 17:45:00', @citizen_id),
('MEDICAL', 'HIGH', 'Drowning rescue', 30.0444, 31.2357, 'RESOLVED', '2024-06-01 14:00:00', '2024-06-01 15:15:00', @citizen_id),
('MEDICAL', 'HIGH', 'Multi-vehicle accident', 30.0331, 31.2331, 'RESOLVED', '2024-06-13 17:45:00', '2024-06-13 19:30:00', @citizen_id),
('MEDICAL', 'HIGH', 'Severe chest pain', 30.0555, 31.2280, 'RESOLVED', '2024-06-28 08:30:00', '2024-06-28 09:45:00', @citizen_id),
('MEDICAL', 'MEDIUM', 'Snake bite', 30.0626, 31.2497, 'RESOLVED', '2024-06-07 08:30:00', '2024-06-07 09:15:00', @citizen_id),
('MEDICAL', 'MEDIUM', 'Concussion from fall', 30.0555, 31.2280, 'RESOLVED', '2024-06-25 10:15:00', '2024-06-25 11:00:00', @citizen_id),
('CRIME', 'HIGH', 'Carjacking', 30.0626, 31.2497, 'RESOLVED', '2024-06-09 23:30:00', '2024-06-10 01:15:00', @citizen_id),
('CRIME', 'MEDIUM', 'Graffiti vandalism', 30.0444, 31.2357, 'RESOLVED', '2024-06-04 06:00:00', '2024-06-04 07:15:00', @citizen_id),
('CRIME', 'MEDIUM', 'ATM theft attempt', 30.0876, 31.3421, 'RESOLVED', '2024-06-21 03:45:00', '2024-06-21 05:00:00', @citizen_id),
('FIRE', 'LOW', 'Campfire out of control', 30.0444, 31.2357, 'RESOLVED', '2024-06-03 19:15:00', '2024-06-03 20:00:00', @citizen_id),
('MEDICAL', 'LOW', 'Bee sting reaction', 30.0876, 31.3421, 'RESOLVED', '2024-06-19 13:00:00', '2024-06-19 13:30:00', @citizen_id),
('CRIME', 'LOW', 'Lost child found', 30.0331, 31.2331, 'RESOLVED', '2024-06-15 12:30:00', '2024-06-15 13:00:00', @citizen_id),
('MEDICAL', 'MEDIUM', 'Dislocated shoulder', 30.0331, 31.2331, 'RESOLVED', '2024-06-30 15:00:00', '2024-06-30 16:00:00', @citizen_id),

-- July 2024 (16 incidents)
('FIRE', 'HIGH', 'Industrial facility fire', 30.0626, 31.2497, 'RESOLVED', '2024-07-09 20:30:00', '2024-07-10 03:15:00', @citizen_id),
('FIRE', 'MEDIUM', 'Brush fire', 30.0444, 31.2357, 'RESOLVED', '2024-07-02 15:00:00', '2024-07-02 17:30:00', @citizen_id),
('FIRE', 'MEDIUM', 'Boat fire at marina', 30.0876, 31.3421, 'RESOLVED', '2024-07-18 13:45:00', '2024-07-18 15:30:00', @citizen_id),
('FIRE', 'MEDIUM', 'Commercial building', 30.0555, 31.2280, 'RESOLVED', '2024-07-25 11:00:00', '2024-07-25 13:30:00', @citizen_id),
('MEDICAL', 'HIGH', 'Heat stroke', 30.0444, 31.2357, 'RESOLVED', '2024-07-06 14:30:00', '2024-07-06 15:45:00', @citizen_id),
('MEDICAL', 'HIGH', 'Swimming pool accident', 30.0331, 31.2331, 'RESOLVED', '2024-07-12 16:00:00', '2024-07-12 17:15:00', @citizen_id),
('MEDICAL', 'HIGH', 'Severe dehydration', 30.0626, 31.2497, 'RESOLVED', '2024-07-22 13:00:00', '2024-07-22 14:15:00', @citizen_id),
('MEDICAL', 'MEDIUM', 'Firework injury', 30.0626, 31.2497, 'RESOLVED', '2024-07-04 23:15:00', '2024-07-05 00:00:00', @citizen_id),
('MEDICAL', 'MEDIUM', 'Food poisoning', 30.0555, 31.2280, 'RESOLVED', '2024-07-27 11:00:00', '2024-07-27 12:15:00', @citizen_id),
('CRIME', 'HIGH', 'Gang-related incident', 30.0331, 31.2331, 'RESOLVED', '2024-07-17 21:30:00', '2024-07-17 23:45:00', @citizen_id),
('CRIME', 'MEDIUM', 'Pickpocketing', 30.0626, 31.2497, 'RESOLVED', '2024-07-11 14:15:00', '2024-07-11 15:30:00', @citizen_id),
('CRIME', 'MEDIUM', 'Burglary', 30.0876, 31.3421, 'RESOLVED', '2024-07-24 04:00:00', '2024-07-24 05:30:00', @citizen_id),
('FIRE', 'LOW', 'Fireworks mishap', 30.0331, 31.2331, 'RESOLVED', '2024-07-04 22:00:00', '2024-07-04 22:30:00', @citizen_id),
('MEDICAL', 'LOW', 'Sunburn treatment', 30.0876, 31.3421, 'RESOLVED', '2024-07-20 18:30:00', '2024-07-20 19:00:00', @citizen_id),
('CRIME', 'LOW', 'Noise violation', 30.0444, 31.2357, 'RESOLVED', '2024-07-05 01:00:00', '2024-07-05 01:45:00', @citizen_id),
('MEDICAL', 'MEDIUM', 'Bicycle crash', 30.0444, 31.2357, 'RESOLVED', '2024-07-31 09:30:00', '2024-07-31 10:30:00', @citizen_id),

-- August 2024 (14 incidents)
('FIRE', 'HIGH', 'Apartment complex fire', 30.0444, 31.2357, 'RESOLVED', '2024-08-05 19:00:00', '2024-08-06 01:30:00', @citizen_id),
('FIRE', 'MEDIUM', 'Forest fire edge', 30.0626, 31.2497, 'RESOLVED', '2024-08-12 16:15:00', '2024-08-12 19:00:00', @citizen_id),
('FIRE', 'MEDIUM', 'Garage workshop fire', 30.0876, 31.3421, 'RESOLVED', '2024-08-26 10:00:00', '2024-08-26 11:45:00', @citizen_id),
('MEDICAL', 'HIGH', 'Electric shock', 30.0444, 31.2357, 'RESOLVED', '2024-08-02 09:30:00', '2024-08-02 10:45:00', @citizen_id),
('MEDICAL', 'HIGH', 'Workplace injury', 30.0331, 31.2331, 'RESOLVED', '2024-08-14 13:30:00', '2024-08-14 15:00:00', @citizen_id),
('MEDICAL', 'MEDIUM', 'Bicycle accident', 30.0626, 31.2497, 'RESOLVED', '2024-08-08 07:15:00', '2024-08-08 08:00:00', @citizen_id),
('MEDICAL', 'MEDIUM', 'Anxiety attack', 30.0555, 31.2280, 'RESOLVED', '2024-08-28 15:00:00', '2024-08-28 15:45:00', @citizen_id),
('MEDICAL', 'MEDIUM', 'Elderly fall', 30.0876, 31.3421, 'RESOLVED', '2024-08-20 10:30:00', '2024-08-20 11:30:00', @citizen_id),
('CRIME', 'HIGH', 'Armed robbery at store', 30.0626, 31.2497, 'RESOLVED', '2024-08-10 22:15:00', '2024-08-11 00:00:00', @citizen_id);

-- ============================================
-- ASSIGNMENT DATA POPULATION
-- Run this AFTER the main database seed script
-- ============================================

-- Get dispatcher ID
SET @dispatcher_id = (SELECT id FROM User WHERE role = 'DISPATCHER' LIMIT 1);

-- ============================================
-- January 2024 Assignments (15 assignments)
-- ============================================

INSERT INTO Assignment (dispatcher_id, incident_id, vehicle_id, time_assigned, time_resolved, status) VALUES
(@dispatcher_id, 1, 2, '2024-01-05 10:35:00', '2024-01-05 13:45:00', 'COMPLETED'),
(@dispatcher_id, 2, 2, '2024-01-08 14:25:00', '2024-01-08 15:30:00', 'COMPLETED'),
(@dispatcher_id, 3, 5, '2024-01-20 18:50:00', '2024-01-20 20:00:00', 'COMPLETED'),
(@dispatcher_id, 4, 1, '2024-01-03 08:33:00', '2024-01-03 09:15:00', 'COMPLETED'),
(@dispatcher_id, 5, 4, '2024-01-07 16:48:00', '2024-01-07 17:30:00', 'COMPLETED'),
(@dispatcher_id, 6, 1, '2024-01-10 11:25:00', '2024-01-10 12:00:00', 'COMPLETED'),
(@dispatcher_id, 7, 4, '2024-01-18 19:03:00', '2024-01-18 19:45:00', 'COMPLETED'),
(@dispatcher_id, 8, 1, '2024-01-25 14:35:00', '2024-01-25 15:15:00', 'COMPLETED'),
(@dispatcher_id, 9, 3, '2024-01-06 23:20:00', '2024-01-07 00:30:00', 'COMPLETED'),
(@dispatcher_id, 10, 6, '2024-01-11 15:35:00', '2024-01-11 16:15:00', 'COMPLETED'),
(@dispatcher_id, 11, 3, '2024-01-22 07:35:00', '2024-01-22 08:30:00', 'COMPLETED'),
(@dispatcher_id, 12, 6, '2024-01-25 02:20:00', '2024-01-25 03:30:00', 'COMPLETED'),
(@dispatcher_id, 13, 7, '2024-01-14 13:35:00', '2024-01-14 14:15:00', 'COMPLETED'),
(@dispatcher_id, 14, 8, '2024-01-12 09:20:00', '2024-01-12 09:45:00', 'COMPLETED'),
(@dispatcher_id, 15, 9, '2024-01-16 21:05:00', '2024-01-16 21:45:00', 'COMPLETED');

-- ============================================
-- February 2024 Assignments (18 assignments)
-- ============================================

INSERT INTO Assignment (dispatcher_id, incident_id, vehicle_id, time_assigned, time_resolved, status) VALUES
(@dispatcher_id, 16, 2, '2024-02-09 20:20:00', '2024-02-10 02:45:00', 'COMPLETED'),
(@dispatcher_id, 17, 5, '2024-02-02 11:35:00', '2024-02-02 13:00:00', 'COMPLETED'),
(@dispatcher_id, 18, 2, '2024-02-19 09:50:00', '2024-02-19 10:30:00', 'COMPLETED'),
(@dispatcher_id, 19, 8, '2024-02-24 03:05:00', '2024-02-24 07:15:00', 'COMPLETED'),
(@dispatcher_id, 20, 1, '2024-02-01 06:48:00', '2024-02-01 07:30:00', 'COMPLETED'),
(@dispatcher_id, 21, 4, '2024-02-10 12:35:00', '2024-02-10 13:45:00', 'COMPLETED'),
(@dispatcher_id, 22, 1, '2024-02-05 17:25:00', '2024-02-05 18:00:00', 'COMPLETED'),
(@dispatcher_id, 23, 4, '2024-02-20 16:05:00', '2024-02-20 16:45:00', 'COMPLETED'),
(@dispatcher_id, 24, 7, '2024-02-15 10:35:00', '2024-02-15 12:00:00', 'COMPLETED'),
(@dispatcher_id, 25, 3, '2024-02-08 14:20:00', '2024-02-08 16:00:00', 'COMPLETED'),
(@dispatcher_id, 26, 6, '2024-02-03 04:35:00', '2024-02-03 05:45:00', 'COMPLETED'),
(@dispatcher_id, 27, 3, '2024-02-18 22:50:00', '2024-02-18 23:30:00', 'COMPLETED'),
(@dispatcher_id, 28, 9, '2024-02-23 01:20:00', '2024-02-23 02:30:00', 'COMPLETED'),
(@dispatcher_id, 29, 7, '2024-02-15 10:20:00', '2024-02-15 10:45:00', 'COMPLETED'),
(@dispatcher_id, 30, 5, '2024-02-14 14:25:00', '2024-02-14 15:00:00', 'COMPLETED'),
(@dispatcher_id, 31, 6, '2024-02-13 18:35:00', '2024-02-13 19:00:00', 'COMPLETED'),
(@dispatcher_id, 32, 1, '2024-02-27 09:05:00', '2024-02-27 10:15:00', 'COMPLETED'),
(@dispatcher_id, 33, 3, '2024-02-28 03:05:00', '2024-02-28 04:30:00', 'COMPLETED');

-- ============================================
-- March 2024 Assignments (16 assignments)
-- ============================================

INSERT INTO Assignment (dispatcher_id, incident_id, vehicle_id, time_assigned, time_resolved, status) VALUES
(@dispatcher_id, 34, 2, '2024-03-16 15:50:00', '2024-03-17 01:00:00', 'COMPLETED'),
(@dispatcher_id, 35, 5, '2024-03-11 21:05:00', '2024-03-11 23:30:00', 'COMPLETED'),
(@dispatcher_id, 36, 8, '2024-03-22 08:25:00', '2024-03-22 09:45:00', 'COMPLETED'),
(@dispatcher_id, 37, 1, '2024-03-02 12:18:00', '2024-03-02 12:45:00', 'COMPLETED'),
(@dispatcher_id, 38, 4, '2024-03-12 10:05:00', '2024-03-12 11:30:00', 'COMPLETED'),
(@dispatcher_id, 39, 7, '2024-03-23 20:05:00', '2024-03-23 21:15:00', 'COMPLETED'),
(@dispatcher_id, 40, 1, '2024-03-07 14:35:00', '2024-03-07 15:15:00', 'COMPLETED'),
(@dispatcher_id, 41, 4, '2024-03-18 11:05:00', '2024-03-18 12:00:00', 'COMPLETED'),
(@dispatcher_id, 42, 3, '2024-03-15 23:05:00', '2024-03-16 00:45:00', 'COMPLETED'),
(@dispatcher_id, 43, 6, '2024-03-05 05:35:00', '2024-03-05 07:00:00', 'COMPLETED'),
(@dispatcher_id, 44, 9, '2024-03-20 09:20:00', '2024-03-20 10:30:00', 'COMPLETED'),
(@dispatcher_id, 45, 3, '2024-03-28 02:35:00', '2024-03-28 04:00:00', 'COMPLETED'),
(@dispatcher_id, 46, 2, '2024-03-04 19:35:00', '2024-03-04 20:15:00', 'COMPLETED'),
(@dispatcher_id, 47, 7, '2024-03-17 16:50:00', '2024-03-17 17:15:00', 'COMPLETED'),
(@dispatcher_id, 48, 6, '2024-03-10 13:50:00', '2024-03-10 14:30:00', 'COMPLETED'),
(@dispatcher_id, 49, 9, '2024-03-25 11:35:00', '2024-03-25 12:15:00', 'COMPLETED');

-- ============================================
-- April 2024 Assignments (14 assignments)
-- ============================================

INSERT INTO Assignment (dispatcher_id, incident_id, vehicle_id, time_assigned, time_resolved, status) VALUES
(@dispatcher_id, 50, 2, '2024-04-03 16:05:00', '2024-04-03 20:30:00', 'COMPLETED'),
(@dispatcher_id, 51, 5, '2024-04-09 13:20:00', '2024-04-09 14:45:00', 'COMPLETED'),
(@dispatcher_id, 52, 8, '2024-04-19 22:20:00', '2024-04-19 23:45:00', 'COMPLETED'),
(@dispatcher_id, 53, 1, '2024-04-01 07:03:00', '2024-04-01 08:00:00', 'COMPLETED'),
(@dispatcher_id, 54, 4, '2024-04-11 11:50:00', '2024-04-11 13:00:00', 'COMPLETED'),
(@dispatcher_id, 55, 1, '2024-04-06 15:35:00', '2024-04-06 16:15:00', 'COMPLETED'),
(@dispatcher_id, 56, 7, '2024-04-21 13:35:00', '2024-04-21 14:15:00', 'COMPLETED'),
(@dispatcher_id, 57, 4, '2024-04-27 10:05:00', '2024-04-27 11:15:00', 'COMPLETED'),
(@dispatcher_id, 58, 3, '2024-04-13 06:20:00', '2024-04-13 08:30:00', 'COMPLETED'),
(@dispatcher_id, 59, 6, '2024-04-08 10:35:00', '2024-04-08 11:30:00', 'COMPLETED'),
(@dispatcher_id, 60, 9, '2024-04-18 12:05:00', '2024-04-18 13:15:00', 'COMPLETED'),
(@dispatcher_id, 61, 5, '2024-04-14 17:35:00', '2024-04-14 18:00:00', 'COMPLETED'),
(@dispatcher_id, 62, 7, '2024-04-16 14:05:00', '2024-04-16 14:30:00', 'COMPLETED'),
(@dispatcher_id, 63, 3, '2024-04-04 19:05:00', '2024-04-04 19:45:00', 'COMPLETED');

-- ============================================
-- May 2024 Assignments (17 assignments)
-- ============================================

INSERT INTO Assignment (dispatcher_id, incident_id, vehicle_id, time_assigned, time_resolved, status) VALUES
(@dispatcher_id, 64, 2, '2024-05-12 18:50:00', '2024-05-13 02:00:00', 'COMPLETED'),
(@dispatcher_id, 65, 5, '2024-05-05 04:35:00', '2024-05-05 07:15:00', 'COMPLETED'),
(@dispatcher_id, 66, 8, '2024-05-23 14:20:00', '2024-05-23 15:30:00', 'COMPLETED'),
(@dispatcher_id, 67, 2, '2024-05-28 16:05:00', '2024-05-28 17:15:00', 'COMPLETED'),
(@dispatcher_id, 68, 1, '2024-05-02 21:05:00', '2024-05-02 22:15:00', 'COMPLETED'),
(@dispatcher_id, 69, 4, '2024-05-14 03:20:00', '2024-05-14 04:45:00', 'COMPLETED'),
(@dispatcher_id, 70, 7, '2024-05-20 17:35:00', '2024-05-20 19:00:00', 'COMPLETED'),
(@dispatcher_id, 71, 1, '2024-05-08 10:35:00', '2024-05-08 11:30:00', 'COMPLETED'),
(@dispatcher_id, 72, 4, '2024-05-25 12:50:00', '2024-05-25 13:30:00', 'COMPLETED'),
(@dispatcher_id, 73, 3, '2024-05-06 02:35:00', '2024-05-06 04:15:00', 'COMPLETED'),
(@dispatcher_id, 74, 6, '2024-05-18 23:05:00', '2024-05-19 00:45:00', 'COMPLETED'),
(@dispatcher_id, 75, 9, '2024-05-11 11:05:00', '2024-05-11 12:30:00', 'COMPLETED'),
(@dispatcher_id, 76, 3, '2024-05-22 20:05:00', '2024-05-22 21:00:00', 'COMPLETED'),
(@dispatcher_id, 77, 5, '2024-05-17 09:05:00', '2024-05-17 09:30:00', 'COMPLETED'),
(@dispatcher_id, 78, 7, '2024-05-19 16:05:00', '2024-05-19 16:30:00', 'COMPLETED'),
(@dispatcher_id, 79, 6, '2024-05-16 15:35:00', '2024-05-16 16:00:00', 'COMPLETED'),
(@dispatcher_id, 80, 1, '2024-05-30 14:05:00', '2024-05-30 15:00:00', 'COMPLETED');

-- ============================================
-- June 2024 Assignments (15 assignments)
-- ============================================

INSERT INTO Assignment (dispatcher_id, incident_id, vehicle_id, time_assigned, time_resolved, status) VALUES
(@dispatcher_id, 81, 2, '2024-06-16 05:50:00', '2024-06-16 09:30:00', 'COMPLETED'),
(@dispatcher_id, 82, 5, '2024-06-10 11:35:00', '2024-06-10 13:15:00', 'COMPLETED'),
(@dispatcher_id, 83, 8, '2024-06-23 16:35:00', '2024-06-23 17:45:00', 'COMPLETED'),
(@dispatcher_id, 84, 1, '2024-06-01 14:05:00', '2024-06-01 15:15:00', 'COMPLETED'),
(@dispatcher_id, 85, 4, '2024-06-13 17:50:00', '2024-06-13 19:30:00', 'COMPLETED'),
(@dispatcher_id, 86, 7, '2024-06-28 08:35:00', '2024-06-28 09:45:00', 'COMPLETED'),
(@dispatcher_id, 87, 1, '2024-06-07 08:35:00', '2024-06-07 09:15:00', 'COMPLETED'),
(@dispatcher_id, 88, 4, '2024-06-25 10:20:00', '2024-06-25 11:00:00', 'COMPLETED'),
(@dispatcher_id, 89, 3, '2024-06-09 23:35:00', '2024-06-10 01:15:00', 'COMPLETED'),
(@dispatcher_id, 90, 6, '2024-06-04 06:05:00', '2024-06-04 07:15:00', 'COMPLETED'),
(@dispatcher_id, 91, 9, '2024-06-21 03:50:00', '2024-06-21 05:00:00', 'COMPLETED'),
(@dispatcher_id, 92, 2, '2024-06-03 19:20:00', '2024-06-03 20:00:00', 'COMPLETED'),
(@dispatcher_id, 93, 7, '2024-06-19 13:05:00', '2024-06-19 13:30:00', 'COMPLETED'),
(@dispatcher_id, 94, 3, '2024-06-15 12:35:00', '2024-06-15 13:00:00', 'COMPLETED'),
(@dispatcher_id, 95, 4, '2024-06-30 15:05:00', '2024-06-30 16:00:00', 'COMPLETED');

-- ============================================
-- July 2024 Assignments (16 assignments)
-- ============================================

INSERT INTO Assignment (dispatcher_id, incident_id, vehicle_id, time_assigned, time_resolved, status) VALUES
(@dispatcher_id, 96, 2, '2024-07-09 20:35:00', '2024-07-10 03:15:00', 'COMPLETED'),
(@dispatcher_id, 97, 5, '2024-07-02 15:05:00', '2024-07-02 17:30:00', 'COMPLETED'),
(@dispatcher_id, 98, 8, '2024-07-18 13:50:00', '2024-07-18 15:30:00', 'COMPLETED'),
(@dispatcher_id, 99, 2, '2024-07-25 11:05:00', '2024-07-25 13:30:00', 'COMPLETED'),
(@dispatcher_id, 100, 1, '2024-07-06 14:35:00', '2024-07-06 15:45:00', 'COMPLETED'),
(@dispatcher_id, 101, 4, '2024-07-12 16:05:00', '2024-07-12 17:15:00', 'COMPLETED'),
(@dispatcher_id, 102, 7, '2024-07-22 13:05:00', '2024-07-22 14:15:00', 'COMPLETED'),
(@dispatcher_id, 103, 1, '2024-07-04 23:20:00', '2024-07-05 00:00:00', 'COMPLETED'),
(@dispatcher_id, 104, 4, '2024-07-27 11:05:00', '2024-07-27 12:15:00', 'COMPLETED'),
(@dispatcher_id, 105, 3, '2024-07-17 21:35:00', '2024-07-17 23:45:00', 'COMPLETED'),
(@dispatcher_id, 106, 6, '2024-07-11 14:20:00', '2024-07-11 15:30:00', 'COMPLETED'),
(@dispatcher_id, 107, 9, '2024-07-24 04:05:00', '2024-07-24 05:30:00', 'COMPLETED'),
(@dispatcher_id, 108, 5, '2024-07-04 22:05:00', '2024-07-04 22:30:00', 'COMPLETED'),
(@dispatcher_id, 109, 7, '2024-07-20 18:35:00', '2024-07-20 19:00:00', 'COMPLETED'),
(@dispatcher_id, 110, 3, '2024-07-05 01:05:00', '2024-07-05 01:45:00', 'COMPLETED'),
(@dispatcher_id, 111, 1, '2024-07-31 09:35:00', '2024-07-31 10:30:00', 'COMPLETED');

-- ============================================
-- August 2024 Assignments (9 assignments)
-- ============================================

INSERT INTO Assignment (dispatcher_id, incident_id, vehicle_id, time_assigned, time_resolved, status) VALUES
(@dispatcher_id, 112, 2, '2024-08-05 19:05:00', '2024-08-06 01:30:00', 'COMPLETED'),
(@dispatcher_id, 113, 5, '2024-08-12 16:20:00', '2024-08-12 19:00:00', 'COMPLETED'),
(@dispatcher_id, 114, 8, '2024-08-26 10:05:00', '2024-08-26 11:45:00', 'COMPLETED'),
(@dispatcher_id, 115, 1, '2024-08-02 09:35:00', '2024-08-02 10:45:00', 'COMPLETED'),
(@dispatcher_id, 116, 4, '2024-08-14 13:35:00', '2024-08-14 15:00:00', 'COMPLETED'),
(@dispatcher_id, 117, 1, '2024-08-08 08:20:00', '2024-08-08 09:00:00', 'COMPLETED'),
(@dispatcher_id, 118, 7, '2024-08-28 15:00:00', '2024-08-28 15:45:00', 'COMPLETED'),
(@dispatcher_id, 119, 4, '2024-08-20 10:35:00', '2024-08-20 11:30:00', 'COMPLETED'),
(@dispatcher_id, 120, 3, '2024-08-10 22:20:00', '2024-08-11 00:00:00', 'COMPLETED');
