import pathlib
import sys

if len(sys.argv) != 2:
    print("Usage: python generate_users.py <N>")
    sys.exit(1)

N = int(sys.argv[1])

out = []

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

out.append(f"""
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

# Resolve path relative to repo root (go up from simulation/generate to smart-dispatch root)
p = pathlib.Path(__file__).parent.parent.parent / "smart-dispatch-system" / "src" / "main" / "resources" / "data.sql"
p.write_text("\n".join(out), encoding="utf-8")
print(f"Wrote {p.resolve()} (N={N})")