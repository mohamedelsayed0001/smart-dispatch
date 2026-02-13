
INSERT INTO `User` (name, email, password, role) VALUES
('admin', 'admin@sim.local', 'password', 'ADMIN'),
('citizen', 'citizen@sim.local', 'password', 'CITIZEN'),
('dispatcher', 'dispatcher@sim.local', 'password', 'DISPATCHER');

INSERT INTO `User` (name, email, password, role) VALUES
  ('Operator 001', 'operator001@sim.local', 'password', 'OPERATOR');

-- Capture first inserted user id
SET @first_new_user_id = LAST_INSERT_ID();
SET @num = 1;



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
LIMIT 1;

INSERT INTO vehicle_location (vehicle_id, longitude, latitude, time_stamp) VALUES
  (1, 31.0, 30.0, CURRENT_TIMESTAMP);