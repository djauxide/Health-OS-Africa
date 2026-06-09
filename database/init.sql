CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  subscription_plan VARCHAR(50) NOT NULL DEFAULT 'STARTER',
  status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS clinics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  name VARCHAR(255) NOT NULL,
  address TEXT,
  phone VARCHAR(50),
  email VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  email VARCHAR(255) NOT NULL,
  password_hash TEXT NOT NULL,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, email)
);

CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  patient_number VARCHAR(50) NOT NULL,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  dob DATE,
  gender VARCHAR(20) NOT NULL DEFAULT 'UNKNOWN',
  phone VARCHAR(50),
  email VARCHAR(255),
  address TEXT,
  medical_aid_name VARCHAR(255),
  emergency_contact_name VARCHAR(255),
  emergency_contact_phone VARCHAR(50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, patient_number)
);

CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  patient_id UUID NOT NULL REFERENCES patients(id),
  scheduled_start TIMESTAMPTZ NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'BOOKED',
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS triage_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  patient_id UUID NOT NULL REFERENCES patients(id),
  systolic_bp INTEGER,
  diastolic_bp INTEGER,
  pulse INTEGER,
  temperature_c NUMERIC(4,1),
  spo2 INTEGER,
  weight_kg NUMERIC(6,2),
  height_cm NUMERIC(6,2),
  bmi NUMERIC(5,2),
  priority VARCHAR(20) NOT NULL DEFAULT 'GREEN',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  patient_id UUID NOT NULL REFERENCES patients(id),
  doctor_id UUID REFERENCES users(id),
  subjective TEXT,
  objective TEXT,
  assessment TEXT,
  plan TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  generic_name VARCHAR(255) NOT NULL,
  brand_name VARCHAR(255),
  strength VARCHAR(100),
  quantity_on_hand INTEGER NOT NULL DEFAULT 0,
  reorder_threshold INTEGER NOT NULL DEFAULT 10,
  expiry_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  clinic_id UUID REFERENCES clinics(id),
  actor_user_id UUID REFERENCES users(id),
  event_type VARCHAR(100) NOT NULL,
  target_type VARCHAR(100),
  target_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_patients_tenant ON patients(tenant_id, clinic_id);
CREATE INDEX IF NOT EXISTS idx_appointments_tenant ON appointments(tenant_id, clinic_id, scheduled_start);
CREATE INDEX IF NOT EXISTS idx_audit_tenant ON audit_logs(tenant_id, created_at DESC);

INSERT INTO tenants (id, name, subscription_plan, status)
VALUES ('11111111-1111-1111-1111-111111111111', 'HealthOS Demo Tenant', 'STARTER', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

INSERT INTO clinics (id, tenant_id, name, address, phone, email)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  'Ubuntu Family Clinic',
  '12 Nelson Mandela Drive, Johannesburg',
  '+27 11 555 0100',
  'admin@ubuntuclinic.example'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO users (id, tenant_id, clinic_id, email, password_hash, first_name, last_name, role)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  'admin@healthos.test',
  '$2a$10$DeO954RjOjzboluWMH/WmO2OlbZDoQbzpcWR1TUSF6lmA7PhyNbNm',
  'Clinic',
  'Admin',
  'CLINIC_ADMIN'
)
ON CONFLICT (tenant_id, email) DO NOTHING;

INSERT INTO patients (tenant_id, clinic_id, patient_number, first_name, last_name, dob, gender, phone, email, address, medical_aid_name, emergency_contact_name, emergency_contact_phone)
VALUES
  ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'HAF-2026-000001', 'Amina', 'Mokoena', '1988-04-12', 'FEMALE', '+27 82 555 0101', 'amina@example.com', 'Soweto, Johannesburg', 'Discovery Health', 'Thabo Mokoena', '+27 82 555 0199'),
  ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'HAF-2026-000002', 'Sipho', 'Dlamini', '1976-09-21', 'MALE', '+27 73 555 0102', 'sipho@example.com', 'Sandton, Johannesburg', 'Bonitas', 'Naledi Dlamini', '+27 73 555 0198')
ON CONFLICT (tenant_id, patient_number) DO NOTHING;

INSERT INTO appointments (tenant_id, clinic_id, patient_id, scheduled_start, status, reason)
SELECT p.tenant_id, p.clinic_id, p.id, now() + interval '2 hours', 'BOOKED', 'Follow-up consultation'
FROM patients p
WHERE p.patient_number = 'HAF-2026-000001'
ON CONFLICT DO NOTHING;

INSERT INTO medications (tenant_id, generic_name, brand_name, strength, quantity_on_hand, reorder_threshold, expiry_date)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Paracetamol', 'Panado', '500mg', 240, 50, '2027-06-30'),
  ('11111111-1111-1111-1111-111111111111', 'Amoxicillin', 'Amoxil', '250mg', 28, 30, '2026-11-30')
ON CONFLICT DO NOTHING;
