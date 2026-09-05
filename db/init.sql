CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'doctor', 'nurse', 'viewer')),
  is_authorized BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 0 AND age <= 130),
  diagnosis TEXT NOT NULL,
  doctor TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS login_attempts (
  ip TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 0,
  last_attempt TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS security_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ip TEXT NOT NULL,
  country TEXT,
  city TEXT,
  device TEXT,
  browser TEXT,
  os TEXT,
  attack_type TEXT NOT NULL,
  attempt_count INTEGER NOT NULL DEFAULT 1,
  attempted_email TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO users (email, role, is_authorized) VALUES
  ('admin@stcatherine.local', 'admin', TRUE),
  ('doctor@stcatherine.local', 'doctor', TRUE),
  ('nurse@stcatherine.local', 'nurse', TRUE),
  ('locked@stcatherine.local', 'viewer', FALSE)
ON CONFLICT (email) DO NOTHING;

INSERT INTO patients (name, age, diagnosis, doctor) VALUES
  ('Amina Hassan', 44, 'Type 2 diabetes follow-up', 'Dr. Lina Farouk'),
  ('Omar Nasser', 67, 'Hypertension and atrial fibrillation', 'Dr. Rami Khalil'),
  ('Maya Stone', 29, 'Migraine management', 'Dr. Sofia Grant'),
  ('Elias Haddad', 52, 'Post-operative knee evaluation', 'Dr. Noah Barrett'),
  ('Fatima Alawi', 35, 'Prenatal wellness visit', 'Dr. Lina Farouk'),
  ('Daniel Brooks', 73, 'COPD exacerbation review', 'Dr. Sofia Grant'),
  ('Sara Mitchell', 41, 'Anemia workup', 'Dr. Rami Khalil'),
  ('Yusuf Kareem', 58, 'Chronic kidney disease monitoring', 'Dr. Noah Barrett'),
  ('Nora Evans', 12, 'Asthma action plan', 'Dr. Priya Mehta'),
  ('Hana Ibrahim', 63, 'Rheumatoid arthritis medication review', 'Dr. Priya Mehta')
ON CONFLICT DO NOTHING;
