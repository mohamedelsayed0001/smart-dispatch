import pathlib
import sys
import random

LAT_MAX = 30.175387750587074
LAT_MIN = 29.775256780776914
LON_MAX = 31.5624047385323
LON_MIN = 30.996555009635973

if len(sys.argv) != 2:
    print("Usage: python generate_vehicles.py <N>")
    sys.exit(1)

N = int(sys.argv[1])

out = []

# Insert N operators
users_values = []
for i in range(1, N + 1):
    name = f"Operator {i:03d}"
    email = f"operator{i:03d}@sim.local"
    password = "password"
    role = "OPERATOR"
    users_values.append(f"('{name}', '{email}', '{password}', '{role}')")

out.append(
    "INSERT INTO `User` (name, email, password, role) VALUES\n  "
    + ",\n  ".join(users_values)
    + ";"
)

out.append(f"""
-- Capture first inserted user id
SET @first_new_user_id = LAST_INSERT_ID();
SET @num = {N};
""")

# Insert N vehicles
out.append(f"""
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
LIMIT {N};
""")

print(f"Generating {N} initial vehicle locations within Cairo boundaries...")
location_values = []
for i in range(1, N + 1):
    lat = round(random.uniform(LAT_MIN, LAT_MAX), 8)
    lon = round(random.uniform(LON_MIN, LON_MAX), 8)
    location_values.append(f"({i}, {lon}, {lat}, CURRENT_TIMESTAMP)")

# Insert locations in batches of 100
BATCH_SIZE = 100
for batch_start in range(0, len(location_values), BATCH_SIZE):
    batch_end = min(batch_start + BATCH_SIZE, len(location_values))
    batch_vals = ",\n  ".join(location_values[batch_start:batch_end])
    out.append(
        "INSERT INTO vehicle_location (vehicle_id, longitude, latitude, time_stamp) VALUES\n  "
        + batch_vals
        + ";"
    )

analysis_path = pathlib.Path(__file__).with_name("analysis_mock_data.txt")
try:
  analysis_sql = analysis_path.read_text(encoding="utf-8")
  out.append(analysis_sql)
  print(f"✓ Appended analysis mock data")
except FileNotFoundError:
  print(f"⚠ Analysis mock data file not found: {analysis_path.resolve()}")

if N < 9:
  print(f"⚠ Analysis data references vehicle_id up to 9; generated {N} vehicles.")

# Resolve path relative to repo root
p = pathlib.Path(__file__).parent.parent.parent / "smart-dispatch-system" / "src" / "main" / "resources" / "data.sql"
p.write_text("\n".join(out), encoding="utf-8")
# print(f"✓ Wrote {p.resolve()} ({N} operators, {N} vehicles, {N} locations)")
print(f"✓ Wrote ({N} operators, {N} vehicles, {N} locations)")