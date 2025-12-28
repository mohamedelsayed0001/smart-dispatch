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
  ('Operator 010', 'operator010@sim.local', 'password', 'OPERATOR'),
  ('Operator 011', 'operator011@sim.local', 'password', 'OPERATOR'),
  ('Operator 012', 'operator012@sim.local', 'password', 'OPERATOR'),
  ('Operator 013', 'operator013@sim.local', 'password', 'OPERATOR'),
  ('Operator 014', 'operator014@sim.local', 'password', 'OPERATOR'),
  ('Operator 015', 'operator015@sim.local', 'password', 'OPERATOR'),
  ('Operator 016', 'operator016@sim.local', 'password', 'OPERATOR'),
  ('Operator 017', 'operator017@sim.local', 'password', 'OPERATOR'),
  ('Operator 018', 'operator018@sim.local', 'password', 'OPERATOR'),
  ('Operator 019', 'operator019@sim.local', 'password', 'OPERATOR'),
  ('Operator 020', 'operator020@sim.local', 'password', 'OPERATOR'),
  ('Operator 021', 'operator021@sim.local', 'password', 'OPERATOR'),
  ('Operator 022', 'operator022@sim.local', 'password', 'OPERATOR'),
  ('Operator 023', 'operator023@sim.local', 'password', 'OPERATOR'),
  ('Operator 024', 'operator024@sim.local', 'password', 'OPERATOR'),
  ('Operator 025', 'operator025@sim.local', 'password', 'OPERATOR'),
  ('Operator 026', 'operator026@sim.local', 'password', 'OPERATOR'),
  ('Operator 027', 'operator027@sim.local', 'password', 'OPERATOR'),
  ('Operator 028', 'operator028@sim.local', 'password', 'OPERATOR'),
  ('Operator 029', 'operator029@sim.local', 'password', 'OPERATOR'),
  ('Operator 030', 'operator030@sim.local', 'password', 'OPERATOR'),
  ('Operator 031', 'operator031@sim.local', 'password', 'OPERATOR'),
  ('Operator 032', 'operator032@sim.local', 'password', 'OPERATOR'),
  ('Operator 033', 'operator033@sim.local', 'password', 'OPERATOR'),
  ('Operator 034', 'operator034@sim.local', 'password', 'OPERATOR'),
  ('Operator 035', 'operator035@sim.local', 'password', 'OPERATOR'),
  ('Operator 036', 'operator036@sim.local', 'password', 'OPERATOR'),
  ('Operator 037', 'operator037@sim.local', 'password', 'OPERATOR'),
  ('Operator 038', 'operator038@sim.local', 'password', 'OPERATOR'),
  ('Operator 039', 'operator039@sim.local', 'password', 'OPERATOR'),
  ('Operator 040', 'operator040@sim.local', 'password', 'OPERATOR'),
  ('Operator 041', 'operator041@sim.local', 'password', 'OPERATOR'),
  ('Operator 042', 'operator042@sim.local', 'password', 'OPERATOR'),
  ('Operator 043', 'operator043@sim.local', 'password', 'OPERATOR'),
  ('Operator 044', 'operator044@sim.local', 'password', 'OPERATOR'),
  ('Operator 045', 'operator045@sim.local', 'password', 'OPERATOR'),
  ('Operator 046', 'operator046@sim.local', 'password', 'OPERATOR'),
  ('Operator 047', 'operator047@sim.local', 'password', 'OPERATOR'),
  ('Operator 048', 'operator048@sim.local', 'password', 'OPERATOR'),
  ('Operator 049', 'operator049@sim.local', 'password', 'OPERATOR'),
  ('Operator 050', 'operator050@sim.local', 'password', 'OPERATOR');

-- Capture first inserted user id
SET @first_new_user_id = LAST_INSERT_ID();
SET @num = 50;


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
LIMIT 50;

INSERT INTO vehicle_location (vehicle_id, longitude, latitude, time_stamp) VALUES
  (1, 31.38982113, 30.13884009, CURRENT_TIMESTAMP),
  (2, 31.30650887, 30.1455002, CURRENT_TIMESTAMP),
  (3, 31.47059181, 29.8638435, CURRENT_TIMESTAMP),
  (4, 31.44960433, 30.10664649, CURRENT_TIMESTAMP),
  (5, 31.01758823, 29.90609697, CURRENT_TIMESTAMP),
  (6, 31.43512183, 30.07865804, CURRENT_TIMESTAMP),
  (7, 31.07328043, 30.01211822, CURRENT_TIMESTAMP),
  (8, 31.48154016, 29.91118629, CURRENT_TIMESTAMP),
  (9, 31.4598403, 29.97731834, CURRENT_TIMESTAMP),
  (10, 31.33025861, 29.87434292, CURRENT_TIMESTAMP),
  (11, 31.05187021, 30.05303116, CURRENT_TIMESTAMP),
  (12, 31.08156006, 29.8132524, CURRENT_TIMESTAMP),
  (13, 31.25703155, 29.97616477, CURRENT_TIMESTAMP),
  (14, 31.28805845, 29.77657098, CURRENT_TIMESTAMP),
  (15, 31.19123382, 30.16894452, CURRENT_TIMESTAMP),
  (16, 31.5621948, 30.15208504, CURRENT_TIMESTAMP),
  (17, 31.41084709, 29.80421884, CURRENT_TIMESTAMP),
  (18, 31.3191875, 30.0211178, CURRENT_TIMESTAMP),
  (19, 31.2598925, 30.1026523, CURRENT_TIMESTAMP),
  (20, 31.3795261, 29.90715766, CURRENT_TIMESTAMP),
  (21, 31.25273198, 30.12731909, CURRENT_TIMESTAMP),
  (22, 31.51785736, 29.90113153, CURRENT_TIMESTAMP),
  (23, 31.11829042, 29.9074081, CURRENT_TIMESTAMP),
  (24, 31.16069348, 29.78959351, CURRENT_TIMESTAMP),
  (25, 31.19535311, 30.16825372, CURRENT_TIMESTAMP),
  (26, 31.5032685, 29.83963102, CURRENT_TIMESTAMP),
  (27, 31.17218766, 29.97035071, CURRENT_TIMESTAMP),
  (28, 31.4537293, 29.92324973, CURRENT_TIMESTAMP),
  (29, 31.55321323, 30.02841045, CURRENT_TIMESTAMP),
  (30, 31.34423306, 29.99507553, CURRENT_TIMESTAMP),
  (31, 31.22123302, 30.15336887, CURRENT_TIMESTAMP),
  (32, 31.39271518, 29.87958127, CURRENT_TIMESTAMP),
  (33, 31.04305353, 29.98734368, CURRENT_TIMESTAMP),
  (34, 31.29437624, 29.90932682, CURRENT_TIMESTAMP),
  (35, 31.19873038, 30.09509059, CURRENT_TIMESTAMP),
  (36, 31.36848333, 29.78721204, CURRENT_TIMESTAMP),
  (37, 31.2207828, 29.80626616, CURRENT_TIMESTAMP),
  (38, 31.05290897, 30.16492232, CURRENT_TIMESTAMP),
  (39, 31.44355102, 29.80129309, CURRENT_TIMESTAMP),
  (40, 31.10056764, 30.04493012, CURRENT_TIMESTAMP),
  (41, 31.00670959, 29.84372051, CURRENT_TIMESTAMP),
  (42, 31.49893422, 30.1212553, CURRENT_TIMESTAMP),
  (43, 31.32511525, 30.06078843, CURRENT_TIMESTAMP),
  (44, 31.49724402, 29.97045496, CURRENT_TIMESTAMP),
  (45, 31.06040037, 29.97434134, CURRENT_TIMESTAMP),
  (46, 31.11859984, 30.02259742, CURRENT_TIMESTAMP),
  (47, 31.19539026, 29.86549585, CURRENT_TIMESTAMP),
  (48, 31.45393556, 29.93574854, CURRENT_TIMESTAMP),
  (49, 31.07357487, 29.87432791, CURRENT_TIMESTAMP),
  (50, 30.99937231, 30.03610338, CURRENT_TIMESTAMP);