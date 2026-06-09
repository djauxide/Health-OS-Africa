# HealthOS Africa Technical Design Document

Version: 0.1  
Date: 2026-06-09  
Status: MVP engineering baseline  
Audience: founders, product owners, engineers, pilot clinic stakeholders, security reviewers

## 1. Executive Summary

HealthOS Africa is a multi-tenant clinical operating system for clinics that need to run paperless patient registration, appointment booking, triage, consultation notes, e-prescriptions, basic pharmacy operations, and operational reporting.

The MVP is designed for a 90-day pilot deployment in a real clinic. It prioritizes reliability, auditability, clinical workflow fit, tenant isolation, and deployability over broad feature count.

The MVP supports:

- Tenant and clinic administration
- User authentication, refresh tokens, MFA foundation, RBAC, and audit logging
- Patient registration with patient numbers and QR identifiers
- Appointment booking, check-in, queue management, and visit state tracking
- Nurse triage with vitals and priority classification
- Doctor consultation workspace using SOAP notes
- E-prescriptions and pharmacy dispensing
- Basic inventory and stock alerts
- Operational and clinical dashboards
- Docker Compose development deployment
- Kubernetes-ready production deployment path

Out of scope for MVP:

- AI clinical assistance
- Claims processing
- Telemedicine
- Laboratory integrations
- National health system integrations
- Full billing and payment reconciliation
- Offline-first mobile apps

## 2. Product Objective

Enable a clinic to operate paperless for the following daily workflows:

1. Register a patient.
2. Book or check in an appointment.
3. Move the patient through the queue.
4. Capture triage vitals.
5. Record consultation notes.
6. Issue a prescription.
7. Dispense medication.
8. Review clinic activity through dashboards and reports.

MVP success requires that the system can be piloted by receptionists, nurses, doctors, pharmacists, and clinic administrators with minimal manual workaround.

## 3. System Context

```text
Patients / Clinic Staff
        |
        v
Web Application / Mobile Browser
        |
        v
Cloudflare WAF
        |
        v
Load Balancer
        |
        v
Nginx API Gateway
        |
        v
NestJS Backend API
        |
        +--> PostgreSQL 16
        +--> Redis
        +--> MinIO Object Storage
        +--> Event Bus
        +--> Notification Provider
```

## 4. Architecture Style

The MVP uses a modular monolith backend with service boundaries expressed as NestJS modules. This gives the pilot the operational simplicity of one deployable backend while preserving clear domain boundaries for future extraction into microservices.

Initial backend modules:

- Auth
- Users
- Tenants
- Patients
- Appointments
- Queue
- Triage
- Consultations
- Prescriptions
- Pharmacy
- Reports
- Audit
- Notifications
- Storage

The frontend is a Next.js application with role-aware dashboards and workflow pages.

## 5. Technology Stack

Frontend:

- Next.js 15
- TypeScript
- TailwindCSS
- ShadCN UI
- Recharts
- Zod client validation

Backend:

- NestJS
- TypeScript
- Prisma ORM
- REST API for MVP workflows
- GraphQL reserved for analytics and complex clinical data queries
- Zod validation at API boundaries

Database:

- PostgreSQL 16

Cache and transient state:

- Redis

Object storage:

- MinIO for local and pilot deployments
- S3-compatible storage in production if required

Infrastructure:

- Docker Compose for development and pilot rehearsal
- Kubernetes for staging and production
- Terraform for cloud infrastructure
- GitHub Actions for CI/CD

## 6. Repository Layout

```text
healthos-africa/
  frontend/
  backend/
  database/
  infra/
    docker/
    kubernetes/
    terraform/
  docs/
    healthos-africa-technical-design.md
  docker-compose.yml
  .env.example
  README.md
```

## 7. Bounded Contexts

### 7.1 Identity Domain

Owns:

- Login
- Logout
- Password reset
- MFA device registration
- Refresh token sessions
- Roles
- Permissions
- User activation and deactivation

### 7.2 Administration Domain

Owns:

- Tenants
- Clinics
- Clinic configuration
- User management
- Tenant-level settings

### 7.3 Clinical Domain

Owns:

- Patients
- Allergies
- Chronic conditions
- Appointments
- Queue movement
- Triage
- Consultations
- Diagnoses
- Prescriptions

### 7.4 Pharmacy Domain

Owns:

- Medication master
- Stock batches
- Inventory movements
- Dispensing
- Low-stock and expiry alerts

### 7.5 Reporting Domain

Owns:

- Operational metrics
- Clinical metrics
- Audit summaries
- Dashboard aggregation

### 7.6 Audit Domain

Owns:

- Immutable event logging
- Actor, target, and metadata capture
- Security event tracking
- Compliance evidence

## 8. Tenant Isolation Model

Every tenant-owned table includes `tenant_id`. Clinic-scoped records also include `clinic_id`.

Application-level enforcement:

- `tenant_id` is extracted from the authenticated session.
- API handlers never accept trusted tenant IDs from clients for scoped writes.
- Prisma queries are wrapped by tenant-aware service methods.
- Audit logs capture attempted cross-tenant access.

Database-level hardening:

- Foreign keys require tenant-consistent relationships where practical.
- Unique indexes include `tenant_id` when values are tenant-local.
- PostgreSQL row-level security may be introduced after MVP stabilization.

Example rule:

```sql
SELECT * FROM patients
WHERE tenant_id = :current_tenant_id
ORDER BY created_at DESC;
```

## 9. Roles and Permissions

MVP roles:

- `SUPER_ADMIN`
- `CLINIC_ADMIN`
- `DOCTOR`
- `NURSE`
- `PHARMACIST`
- `RECEPTIONIST`

Core permissions:

- `TENANT_MANAGE`
- `USER_VIEW`
- `USER_CREATE`
- `USER_EDIT`
- `PATIENT_VIEW`
- `PATIENT_CREATE`
- `PATIENT_EDIT`
- `APPOINTMENT_VIEW`
- `APPOINTMENT_CREATE`
- `APPOINTMENT_EDIT`
- `TRIAGE_CREATE`
- `TRIAGE_VIEW`
- `CONSULTATION_CREATE`
- `CONSULTATION_VIEW`
- `PRESCRIPTION_CREATE`
- `PRESCRIPTION_VIEW`
- `PHARMACY_VIEW`
- `PHARMACY_DISPENSE`
- `PHARMACY_STOCK_EDIT`
- `REPORT_VIEW`
- `AUDIT_VIEW`

Recommended MVP mapping:

| Role | Permissions |
| --- | --- |
| SUPER_ADMIN | All permissions across tenants |
| CLINIC_ADMIN | User, patient, appointment, report, audit, pharmacy overview |
| DOCTOR | Patient view, consultation, diagnosis, prescription |
| NURSE | Patient view, appointment view, triage |
| PHARMACIST | Prescription view, pharmacy dispense, stock edit |
| RECEPTIONIST | Patient create/edit, appointment create/edit, queue check-in |

## 10. Authentication Design

Authentication uses access tokens and refresh tokens.

Access token:

- JWT
- Short lifetime, recommended 15 minutes
- Contains user ID, tenant ID, clinic ID, role, and permissions

Refresh token:

- Opaque random token
- Stored hashed in `sessions`
- Rotated on refresh
- Revoked on logout or suspicious activity

Example JWT claims:

```json
{
  "sub": "user_01JZ...",
  "tenant_id": "tenant_01JZ...",
  "clinic_id": "clinic_01JZ...",
  "role": "DOCTOR",
  "permissions": ["PATIENT_VIEW", "CONSULTATION_CREATE", "PRESCRIPTION_CREATE"],
  "iat": 1781013600,
  "exp": 1781014500
}
```

MFA MVP:

- TOTP setup for privileged roles
- Recovery codes
- Enforced for `SUPER_ADMIN` and `CLINIC_ADMIN`
- Optional for clinical users during first pilot unless clinic policy requires it

## 11. Database Schema

The following schema is the MVP baseline. Production implementation should use Prisma migrations generated from equivalent Prisma models.

### 11.1 Shared Types

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE tenant_status AS ENUM ('ACTIVE', 'SUSPENDED', 'CANCELLED');
CREATE TYPE user_role AS ENUM (
  'SUPER_ADMIN',
  'CLINIC_ADMIN',
  'DOCTOR',
  'NURSE',
  'PHARMACIST',
  'RECEPTIONIST'
);
CREATE TYPE gender AS ENUM ('MALE', 'FEMALE', 'OTHER', 'UNKNOWN');
CREATE TYPE appointment_status AS ENUM (
  'BOOKED',
  'CONFIRMED',
  'CHECKED_IN',
  'IN_TRIAGE',
  'CONSULTING',
  'COMPLETED',
  'NO_SHOW',
  'CANCELLED'
);
CREATE TYPE queue_status AS ENUM (
  'WAITING',
  'IN_TRIAGE',
  'WAITING_FOR_DOCTOR',
  'WITH_DOCTOR',
  'WAITING_FOR_PHARMACY',
  'WITH_PHARMACY',
  'COMPLETED',
  'CANCELLED'
);
CREATE TYPE triage_priority AS ENUM ('RED', 'ORANGE', 'YELLOW', 'GREEN');
CREATE TYPE prescription_status AS ENUM ('DRAFT', 'SIGNED', 'DISPENSED', 'CANCELLED');
CREATE TYPE stock_movement_type AS ENUM ('RECEIVED', 'ADJUSTED', 'DISPENSED', 'EXPIRED', 'RETURNED');
```

### 11.2 Tenants and Clinics

```sql
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  subscription_plan VARCHAR(50) NOT NULL DEFAULT 'STARTER',
  status tenant_status NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE clinics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  name VARCHAR(255) NOT NULL,
  address TEXT,
  phone VARCHAR(50),
  email VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_clinics_tenant_id ON clinics(tenant_id);
```

### 11.3 Users, Roles, Sessions, MFA

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  clinic_id UUID REFERENCES clinics(id),
  email VARCHAR(255) NOT NULL,
  password_hash TEXT NOT NULL,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  role user_role NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, email)
);

CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(100) NOT NULL UNIQUE,
  description TEXT
);

CREATE TABLE role_permissions (
  role user_role NOT NULL,
  permission_id UUID NOT NULL REFERENCES permissions(id),
  PRIMARY KEY (role, permission_id)
);

CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  refresh_token_hash TEXT NOT NULL,
  user_agent TEXT,
  ip_address INET,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE mfa_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  type VARCHAR(50) NOT NULL DEFAULT 'TOTP',
  secret_encrypted TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_users_clinic_id ON users(clinic_id);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
```

### 11.4 Patients

```sql
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  patient_number VARCHAR(50) NOT NULL,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  id_number VARCHAR(30),
  dob DATE,
  gender gender NOT NULL DEFAULT 'UNKNOWN',
  phone VARCHAR(50),
  email VARCHAR(255),
  address TEXT,
  medical_aid_name VARCHAR(255),
  medical_aid_number VARCHAR(100),
  emergency_contact_name VARCHAR(255),
  emergency_contact_phone VARCHAR(50),
  qr_code_value TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, patient_number)
);

CREATE TABLE patient_allergies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  patient_id UUID NOT NULL REFERENCES patients(id),
  allergen VARCHAR(255) NOT NULL,
  reaction TEXT,
  severity VARCHAR(50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE patient_chronic_conditions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  patient_id UUID NOT NULL REFERENCES patients(id),
  condition_name VARCHAR(255) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_patients_tenant_clinic ON patients(tenant_id, clinic_id);
CREATE INDEX idx_patients_name ON patients(tenant_id, last_name, first_name);
CREATE INDEX idx_patient_allergies_patient ON patient_allergies(patient_id);
```

### 11.5 Appointments and Queue

```sql
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  patient_id UUID NOT NULL REFERENCES patients(id),
  provider_id UUID REFERENCES users(id),
  scheduled_start TIMESTAMPTZ NOT NULL,
  scheduled_end TIMESTAMPTZ,
  status appointment_status NOT NULL DEFAULT 'BOOKED',
  reason TEXT,
  cancellation_reason TEXT,
  checked_in_at TIMESTAMPTZ,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE queue_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  patient_id UUID NOT NULL REFERENCES patients(id),
  appointment_id UUID REFERENCES appointments(id),
  queue_number VARCHAR(20) NOT NULL,
  status queue_status NOT NULL DEFAULT 'WAITING',
  priority triage_priority,
  checked_in_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, clinic_id, queue_number, checked_in_at)
);

CREATE INDEX idx_appointments_schedule ON appointments(tenant_id, clinic_id, scheduled_start);
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_queue_active ON queue_entries(tenant_id, clinic_id, status, checked_in_at);
```

### 11.6 Triage

```sql
CREATE TABLE triage_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  patient_id UUID NOT NULL REFERENCES patients(id),
  appointment_id UUID REFERENCES appointments(id),
  queue_entry_id UUID REFERENCES queue_entries(id),
  nurse_id UUID NOT NULL REFERENCES users(id),
  systolic_bp INTEGER,
  diastolic_bp INTEGER,
  pulse INTEGER,
  respiratory_rate INTEGER,
  temperature_c NUMERIC(4,1),
  spo2 INTEGER,
  weight_kg NUMERIC(6,2),
  height_cm NUMERIC(6,2),
  bmi NUMERIC(5,2),
  priority triage_priority NOT NULL DEFAULT 'GREEN',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_triage_patient ON triage_records(patient_id, created_at DESC);
CREATE INDEX idx_triage_queue ON triage_records(queue_entry_id);
```

### 11.7 Consultations, Diagnoses, Prescriptions

```sql
CREATE TABLE consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  patient_id UUID NOT NULL REFERENCES patients(id),
  appointment_id UUID REFERENCES appointments(id),
  queue_entry_id UUID REFERENCES queue_entries(id),
  doctor_id UUID NOT NULL REFERENCES users(id),
  visit_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  subjective TEXT,
  objective TEXT,
  assessment TEXT,
  plan TEXT,
  follow_up_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE diagnoses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  consultation_id UUID NOT NULL REFERENCES consultations(id),
  icd10_code VARCHAR(20),
  description TEXT NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  generic_name VARCHAR(255) NOT NULL,
  brand_name VARCHAR(255),
  strength VARCHAR(100),
  dosage_form VARCHAR(100),
  schedule VARCHAR(50),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  consultation_id UUID NOT NULL REFERENCES consultations(id),
  patient_id UUID NOT NULL REFERENCES patients(id),
  doctor_id UUID NOT NULL REFERENCES users(id),
  status prescription_status NOT NULL DEFAULT 'DRAFT',
  signed_at TIMESTAMPTZ,
  digital_signature_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE prescription_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  prescription_id UUID NOT NULL REFERENCES prescriptions(id),
  medication_id UUID REFERENCES medications(id),
  medication_name VARCHAR(255) NOT NULL,
  strength VARCHAR(100),
  dose VARCHAR(100) NOT NULL,
  frequency VARCHAR(100) NOT NULL,
  duration VARCHAR(100) NOT NULL,
  instructions TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_consultations_patient ON consultations(patient_id, visit_date DESC);
CREATE INDEX idx_diagnoses_consultation ON diagnoses(consultation_id);
CREATE INDEX idx_prescriptions_patient ON prescriptions(patient_id, created_at DESC);
CREATE INDEX idx_prescription_items_prescription ON prescription_items(prescription_id);
```

### 11.8 Pharmacy

```sql
CREATE TABLE medication_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  medication_id UUID NOT NULL REFERENCES medications(id),
  batch_number VARCHAR(100) NOT NULL,
  expiry_date DATE NOT NULL,
  quantity_on_hand INTEGER NOT NULL DEFAULT 0,
  reorder_threshold INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, clinic_id, medication_id, batch_number)
);

CREATE TABLE pharmacy_dispensing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  prescription_id UUID NOT NULL REFERENCES prescriptions(id),
  prescription_item_id UUID NOT NULL REFERENCES prescription_items(id),
  medication_batch_id UUID REFERENCES medication_batches(id),
  pharmacist_id UUID NOT NULL REFERENCES users(id),
  quantity_dispensed INTEGER NOT NULL,
  dispensed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT
);

CREATE TABLE stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  medication_batch_id UUID NOT NULL REFERENCES medication_batches(id),
  movement_type stock_movement_type NOT NULL,
  quantity INTEGER NOT NULL,
  reference_id UUID,
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_batches_stock ON medication_batches(tenant_id, clinic_id, medication_id);
CREATE INDEX idx_batches_expiry ON medication_batches(tenant_id, clinic_id, expiry_date);
CREATE INDEX idx_dispensing_prescription ON pharmacy_dispensing(prescription_id);
```

### 11.9 Documents and Audit

```sql
CREATE TABLE patient_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  patient_id UUID NOT NULL REFERENCES patients(id),
  uploaded_by UUID NOT NULL REFERENCES users(id),
  document_type VARCHAR(100) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  object_key TEXT NOT NULL,
  mime_type VARCHAR(100),
  size_bytes BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  clinic_id UUID REFERENCES clinics(id),
  actor_user_id UUID REFERENCES users(id),
  event_type VARCHAR(100) NOT NULL,
  target_type VARCHAR(100),
  target_id UUID,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_documents_patient ON patient_documents(patient_id, created_at DESC);
CREATE INDEX idx_audit_tenant_created ON audit_logs(tenant_id, created_at DESC);
CREATE INDEX idx_audit_target ON audit_logs(target_type, target_id);
```

## 12. Patient Number Generation

Format:

```text
HAF-YYYY-000001
```

Rules:

- Generated server-side only.
- Unique per tenant.
- Uses a transactional counter to avoid collisions.
- Never reused after deletion.

Recommended table:

```sql
CREATE TABLE tenant_sequences (
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  sequence_name VARCHAR(100) NOT NULL,
  current_value BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, sequence_name)
);
```

## 13. API Specification

The MVP exposes REST APIs. All secured endpoints require:

```http
Authorization: Bearer <access_token>
X-Request-Id: <uuid>
```

Standard response envelope:

```json
{
  "data": {},
  "meta": {
    "requestId": "uuid"
  }
}
```

Standard error envelope:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request payload",
    "details": []
  },
  "meta": {
    "requestId": "uuid"
  }
}
```

### 13.1 Auth API

```yaml
POST /auth/login:
  body:
    email: string
    password: string
  response:
    accessToken: string
    refreshToken: string
    user:
      id: uuid
      role: string
      permissions: string[]

POST /auth/refresh:
  body:
    refreshToken: string
  response:
    accessToken: string
    refreshToken: string

POST /auth/logout:
  body:
    refreshToken: string
  response:
    success: boolean

POST /auth/mfa/verify:
  body:
    code: string
  response:
    verified: boolean
```

### 13.2 Tenant and User API

```yaml
GET /tenants/current:
  permissions: [USER_VIEW]

GET /users:
  permissions: [USER_VIEW]

POST /users:
  permissions: [USER_CREATE]

PUT /users/{id}:
  permissions: [USER_EDIT]

POST /users/{id}/deactivate:
  permissions: [USER_EDIT]
```

### 13.3 Patient API

```yaml
POST /patients:
  permissions: [PATIENT_CREATE]
  body:
    firstName: string
    lastName: string
    idNumber: string?
    dob: date?
    gender: string
    phone: string?
    email: string?
    address: string?
    medicalAidName: string?
    medicalAidNumber: string?
    emergencyContactName: string?
    emergencyContactPhone: string?
  response:
    id: uuid
    patientNumber: string

GET /patients:
  permissions: [PATIENT_VIEW]
  query:
    search: string?
    page: number
    pageSize: number

GET /patients/{id}:
  permissions: [PATIENT_VIEW]

PUT /patients/{id}:
  permissions: [PATIENT_EDIT]

DELETE /patients/{id}:
  permissions: [PATIENT_EDIT]
  note: Soft delete should be used in production implementation.
```

### 13.4 Appointment API

```yaml
POST /appointments:
  permissions: [APPOINTMENT_CREATE]

GET /appointments:
  permissions: [APPOINTMENT_VIEW]
  query:
    date: yyyy-mm-dd?
    status: string?
    providerId: uuid?

PUT /appointments/{id}:
  permissions: [APPOINTMENT_EDIT]

POST /appointments/{id}/check-in:
  permissions: [APPOINTMENT_EDIT]
  response:
    queueEntryId: uuid
    queueNumber: string

POST /appointments/{id}/cancel:
  permissions: [APPOINTMENT_EDIT]
```

### 13.5 Queue API

```yaml
GET /queue:
  permissions: [APPOINTMENT_VIEW]
  query:
    status: string?

POST /queue/{id}/move:
  permissions: [APPOINTMENT_EDIT]
  body:
    status: string

POST /queue/walk-in:
  permissions: [APPOINTMENT_CREATE]
  body:
    patientId: uuid
    reason: string?
```

### 13.6 Triage API

```yaml
POST /triage-records:
  permissions: [TRIAGE_CREATE]
  body:
    patientId: uuid
    appointmentId: uuid?
    queueEntryId: uuid?
    systolicBp: number?
    diastolicBp: number?
    pulse: number?
    respiratoryRate: number?
    temperatureC: number?
    spo2: number?
    weightKg: number?
    heightCm: number?
    notes: string?

GET /patients/{id}/triage-records:
  permissions: [TRIAGE_VIEW]
```

### 13.7 Consultation API

```yaml
POST /consultations:
  permissions: [CONSULTATION_CREATE]
  body:
    patientId: uuid
    appointmentId: uuid?
    queueEntryId: uuid?
    subjective: string?
    objective: string?
    assessment: string?
    plan: string?
    diagnoses:
      - icd10Code: string?
        description: string
        isPrimary: boolean

GET /consultations/{id}:
  permissions: [CONSULTATION_VIEW]

GET /patients/{id}/consultations:
  permissions: [CONSULTATION_VIEW]

PUT /consultations/{id}:
  permissions: [CONSULTATION_CREATE]
```

### 13.8 Prescription API

```yaml
POST /prescriptions:
  permissions: [PRESCRIPTION_CREATE]

POST /prescriptions/{id}/sign:
  permissions: [PRESCRIPTION_CREATE]
  response:
    status: SIGNED
    signedAt: datetime

GET /prescriptions/{id}:
  permissions: [PRESCRIPTION_VIEW]

GET /pharmacy/prescription-queue:
  permissions: [PHARMACY_VIEW]
```

### 13.9 Pharmacy API

```yaml
GET /medications:
  permissions: [PHARMACY_VIEW]

POST /medications:
  permissions: [PHARMACY_STOCK_EDIT]

GET /pharmacy/batches:
  permissions: [PHARMACY_VIEW]

POST /pharmacy/batches:
  permissions: [PHARMACY_STOCK_EDIT]

POST /pharmacy/dispense:
  permissions: [PHARMACY_DISPENSE]
  body:
    prescriptionItemId: uuid
    medicationBatchId: uuid
    quantityDispensed: number

GET /pharmacy/alerts:
  permissions: [PHARMACY_VIEW]
```

### 13.10 Reporting API

```yaml
GET /reports/dashboard:
  permissions: [REPORT_VIEW]

GET /reports/daily:
  permissions: [REPORT_VIEW]
  query:
    date: yyyy-mm-dd

GET /reports/clinical/top-diagnoses:
  permissions: [REPORT_VIEW]

GET /reports/pharmacy/medicine-usage:
  permissions: [REPORT_VIEW]
```

## 14. Service Contracts

### 14.1 Auth Service

Responsibilities:

- Validate credentials.
- Issue and refresh tokens.
- Enforce MFA when required.
- Record login, logout, refresh, and failed login audit events.

Dependencies:

- Users repository
- Sessions repository
- Audit service
- MFA service

### 14.2 Patient Service

Responsibilities:

- Create and update patient demographics.
- Generate patient numbers and QR values.
- Return patient profile and timeline.
- Manage allergies and chronic conditions.

Dependencies:

- Tenant sequence repository
- Audit service
- Object storage service for documents

### 14.3 Appointment Service

Responsibilities:

- Book, reschedule, cancel, and check in appointments.
- Generate queue entries.
- Update appointment lifecycle states.

Dependencies:

- Patient service
- Queue service
- Notification service
- Audit service

### 14.4 Queue Service

Responsibilities:

- Generate daily queue numbers.
- Track queue state changes.
- Surface real-time queue list.
- Allow priority updates from triage.

Dependencies:

- Appointments repository
- Redis for real-time queue cache
- Audit service

### 14.5 Triage Service

Responsibilities:

- Capture vitals.
- Calculate BMI.
- Assign priority based on configurable thresholds.
- Move queue entry to waiting-for-doctor.

Dependencies:

- Queue service
- Audit service

### 14.6 Consultation Service

Responsibilities:

- Create and update SOAP notes.
- Attach diagnoses.
- Move queue state to pharmacy or completed.
- Provide patient consultation history.

Dependencies:

- Patient service
- Queue service
- Prescription service
- Audit service

### 14.7 Prescription Service

Responsibilities:

- Create prescription drafts.
- Sign prescriptions.
- Generate digital signature hash.
- Add signed prescriptions to pharmacy queue.

Dependencies:

- Consultation service
- Medication repository
- Audit service

### 14.8 Pharmacy Service

Responsibilities:

- Maintain medication master.
- Track batches and stock levels.
- Dispense prescription items.
- Create stock movements.
- Generate low-stock and expiry alerts.

Dependencies:

- Prescription service
- Audit service

### 14.9 Reporting Service

Responsibilities:

- Aggregate daily, weekly, and monthly metrics.
- Expose dashboard data.
- Provide clinical and operational reports.

Dependencies:

- PostgreSQL read models
- Redis cache for expensive dashboard queries

## 15. Event Bus Definitions

MVP may implement events as database-backed outbox records. Future production deployments can move the transport to Kafka, RabbitMQ, or NATS.

Outbox table:

```sql
CREATE TABLE outbox_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  event_type VARCHAR(100) NOT NULL,
  aggregate_type VARCHAR(100) NOT NULL,
  aggregate_id UUID NOT NULL,
  payload JSONB NOT NULL,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_outbox_unpublished ON outbox_events(created_at)
WHERE published_at IS NULL;
```

Core events:

| Event | Producer | Consumers |
| --- | --- | --- |
| `USER_LOGGED_IN` | Auth | Audit, Security |
| `PATIENT_CREATED` | Patient | Audit, Reporting |
| `APPOINTMENT_BOOKED` | Appointment | Audit, Notification, Reporting |
| `PATIENT_CHECKED_IN` | Appointment | Queue, Audit, Reporting |
| `TRIAGE_COMPLETED` | Triage | Queue, Audit, Reporting |
| `CONSULTATION_CREATED` | Consultation | Audit, Reporting |
| `PRESCRIPTION_SIGNED` | Prescription | Pharmacy, Audit |
| `MEDICATION_DISPENSED` | Pharmacy | Audit, Reporting, Inventory |
| `STOCK_LOW` | Pharmacy | Notification, Reporting |
| `MEDICATION_EXPIRING` | Pharmacy | Notification, Reporting |

Example event payload:

```json
{
  "eventId": "01JZ...",
  "eventType": "PATIENT_CREATED",
  "tenantId": "tenant_01JZ...",
  "aggregateType": "Patient",
  "aggregateId": "patient_01JZ...",
  "occurredAt": "2026-06-09T14:00:00Z",
  "actorUserId": "user_01JZ...",
  "payload": {
    "patientNumber": "HAF-2026-000001",
    "clinicId": "clinic_01JZ..."
  }
}
```

## 16. Frontend Design

Primary routes:

```text
/login
/dashboard
/patients
/patients/new
/patients/[id]
/appointments
/queue
/triage
/triage/[queueEntryId]
/consultations
/consultations/[id]
/pharmacy
/pharmacy/inventory
/reports
/settings/users
/settings/clinic
```

Core layout:

- Role-aware sidebar navigation
- Clinic switcher for privileged users
- Top bar with current user, clinic, and logout
- Dashboard widgets for daily operations
- Search-first patient workflow
- Queue-centered clinical workflow

Important UI states:

- Loading skeletons
- Empty states
- Form validation errors
- Permission denied
- Session expired
- Network failure retry
- Unsaved changes warning in consultation notes

## 17. Validation Rules

All API payloads use Zod schemas or equivalent runtime validation.

Examples:

- Email must be valid format.
- Phone must allow regional formats.
- Date of birth cannot be in the future.
- Appointment end must be after start.
- Vitals must fall within medically plausible ranges.
- Dispense quantity cannot exceed available stock.
- Prescription can only be dispensed after it is signed.
- Consultation updates require the same tenant and clinic context.

## 18. Audit Requirements

Every high-value action writes an immutable audit log.

Required audit fields:

- Tenant ID
- Clinic ID
- Actor user ID
- Event type
- Target type
- Target ID
- IP address
- User agent
- Metadata
- Timestamp

Audited events:

- Login success
- Login failure
- Logout
- Token refresh
- User created
- User deactivated
- Patient created
- Patient updated
- Appointment created
- Appointment checked in
- Triage completed
- Consultation created
- Prescription signed
- Medication dispensed
- Stock adjusted
- Report exported

Audit log records must not be updated through application code.

## 19. Security Architecture

### 19.1 Transport Security

- TLS 1.3 at public ingress
- HTTPS-only cookies where cookies are used
- HSTS in production

### 19.2 Password Security

- Argon2id password hashing
- Minimum password policy
- Credential stuffing protection through rate limiting
- Account lock or step-up verification after repeated failures

### 19.3 Authorization

- RBAC enforced with NestJS guards
- Permission checks at controller and service level
- Tenant scope injected from authenticated principal

### 19.4 Secrets

Development:

- `.env`

Production:

- Kubernetes Secrets
- Cloud Key Vault or equivalent
- No secrets committed to repository

### 19.5 Data Protection

- Database encryption at rest from cloud provider
- Object storage encryption
- Minimize sensitive data in logs
- Mask patient identifiers in non-clinical logs

### 19.6 Rate Limits

Recommended MVP limits:

- `/auth/login`: 5 attempts per minute per IP and email combination
- `/auth/refresh`: 20 requests per minute per session
- General API: 300 requests per minute per authenticated user

## 20. Docker Compose Stack

Development stack:

```yaml
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_USER: healthos
      POSTGRES_PASSWORD: healthos
      POSTGRES_DB: healthos
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7
    ports:
      - "6379:6379"

  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: healthos
      MINIO_ROOT_PASSWORD: healthos-password
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - minio_data:/data

  backend:
    build:
      context: ./backend
    env_file:
      - .env
    depends_on:
      - postgres
      - redis
      - minio
    ports:
      - "4000:4000"

  frontend:
    build:
      context: ./frontend
    env_file:
      - .env
    depends_on:
      - backend
    ports:
      - "3000:3000"

volumes:
  postgres_data:
  minio_data:
```

## 21. Kubernetes Deployment Design

Namespaces:

- `healthos-staging`
- `healthos-production`
- `monitoring`

Core workloads:

- `frontend` Deployment, 2 replicas
- `backend` Deployment, 2 replicas
- `nginx-gateway` Deployment, 2 replicas
- `redis` StatefulSet or managed Redis
- `postgres` managed cloud database preferred
- `minio` StatefulSet for self-hosted object storage or managed S3 equivalent

Recommended production baseline:

- Horizontal pod autoscaling for frontend and backend
- Pod disruption budgets
- Readiness and liveness probes
- Separate node pool for monitoring if budget allows
- Network policies between namespaces

Example backend probes:

```yaml
readinessProbe:
  httpGet:
    path: /health/ready
    port: 4000
  initialDelaySeconds: 10
  periodSeconds: 10
livenessProbe:
  httpGet:
    path: /health/live
    port: 4000
  initialDelaySeconds: 30
  periodSeconds: 20
```

## 22. CI/CD Pipeline

GitHub Actions stages:

1. Install dependencies.
2. Lint frontend and backend.
3. Type-check frontend and backend.
4. Run unit tests.
5. Run database migration validation.
6. Run security scan.
7. Build Docker images.
8. Push images to registry.
9. Deploy to staging.
10. Run smoke tests.
11. Manual approval for production.
12. Deploy to production.

Branch policy:

- `main` is protected.
- Pull requests require passing CI.
- Production deploys require tagged release or manual approval.

## 23. Observability

Metrics:

- API request count
- API latency
- API error rate
- Database query duration
- Redis latency
- Queue length
- Failed logins
- Prescription signing failures
- Dispensing failures

Logs:

- Structured JSON logs
- Request ID correlation
- Tenant ID and clinic ID where safe
- No raw patient notes in application logs

Tracing:

- OpenTelemetry instrumentation
- Trace API calls through database and object storage operations

Monitoring stack:

- Prometheus
- Grafana
- Loki
- Alertmanager

Critical alerts:

- API unavailable for more than 2 minutes
- Database CPU above 80%
- Database storage above 85%
- Error rate above 5%
- Failed logins above threshold
- Backup failure
- Low disk space on object storage

## 24. Disaster Recovery

### 24.1 Backup Policy

PostgreSQL:

- Incremental backups every 15 minutes
- Full backup nightly
- 90 days online retention
- 7 years archive retention for compliance-aligned deployments

Object storage:

- Daily bucket replication or snapshot
- Versioning enabled where supported

Redis:

- Treated as recoverable cache for MVP
- No critical data stored only in Redis

### 24.2 Recovery Objectives

MVP pilot target:

- RPO: 15 minutes
- RTO: 4 hours

Production target:

- RPO: 5 minutes
- RTO: 1 hour

### 24.3 Recovery Runbook

1. Declare incident and assign incident lead.
2. Freeze deployments.
3. Identify affected tenant, clinic, service, and time window.
4. Restore PostgreSQL from latest valid backup.
5. Restore object storage if required.
6. Run migration compatibility check.
7. Run smoke tests.
8. Reopen service to pilot users.
9. Write incident report within 48 hours.

## 25. Pilot Deployment Guide

### 25.1 Pre-Pilot Checklist

- Clinic tenant created
- Clinic users imported
- Roles assigned
- MFA configured for administrators
- Medication master loaded
- Initial stock batches loaded
- Patient import completed if legacy data exists
- Daily backup confirmed
- Audit log verified
- Staff training completed
- Support contact assigned

### 25.2 Pilot Day Workflow

1. Reception registers or searches patient.
2. Reception books or checks in appointment.
3. Queue entry appears for nurse.
4. Nurse captures triage and priority.
5. Doctor opens consultation from queue.
6. Doctor writes SOAP note and diagnosis.
7. Doctor signs prescription.
8. Pharmacist dispenses medication.
9. Clinic manager reviews dashboard.

### 25.3 Pilot Success Metrics

Operational:

- 80% reduction in paper records
- 50% faster patient registration
- 40% reduction in queue time
- 95% of consultations recorded digitally

Clinical:

- Complete patient history available during consultation
- Triage vitals captured for applicable visits
- Prescription history available to pharmacist

Financial and inventory:

- Reduced medicine losses
- Improved stock visibility
- Low-stock alerts generated before stockouts

## 26. MVP Implementation Sequence

Sprint 1:

- Repository scaffold
- Docker Compose
- PostgreSQL, Redis, MinIO
- Auth, users, roles, permissions
- Tenant and clinic model
- Audit logging baseline

Sprint 2:

- Patient registration
- Patient search
- Patient profile
- Patient number generation
- QR value generation

Sprint 3:

- Appointment CRUD
- Check-in
- Queue creation
- Queue dashboard

Sprint 4:

- Triage vitals
- BMI calculation
- Priority calculation
- Consultation SOAP notes
- Diagnoses

Sprint 5:

- Prescription creation
- Prescription signing
- Medication master
- Pharmacy queue
- Dispensing
- Stock movements

Sprint 6:

- Dashboard reports
- Audit viewer
- Security hardening
- Backup rehearsal
- Pilot deployment

## 27. Engineering Acceptance Criteria

The MVP is ready for pilot when:

- Users can authenticate and refresh sessions.
- Roles block unauthorized workflows.
- Tenant data is isolated in all tested endpoints.
- Patient registration generates unique patient numbers.
- Appointments can be booked, checked in, and moved through queue states.
- Triage records compute BMI and priority.
- Consultations can store SOAP notes and diagnoses.
- Signed prescriptions appear in pharmacy queue.
- Dispensing reduces stock and records stock movements.
- Daily dashboard returns clinic metrics.
- Audit logs exist for all critical actions.
- Database backup and restore has been tested.
- Smoke tests pass against staging.

## 28. Phase 2 AI Layer

AI remains post-MVP and human-approved.

Candidate capabilities:

- SOAP summary drafts
- ICD-10 suggestions
- Prescription review
- Drug interaction detection
- Inventory shortage prediction
- Population health trend detection

Controls:

- AI never writes directly to clinical record without human approval.
- AI output is marked as generated assistance.
- Prompt and output audit logs are retained.
- Protected health information handling must be reviewed before production use.

## 29. Open Questions

- Which country-specific healthcare compliance framework governs the first pilot?
- Will the pilot clinic require offline mode?
- Which SMS or WhatsApp provider should be used in South Africa?
- Is medical aid validation required for MVP or deferred?
- Should billing be excluded entirely from the first clinic pilot?
- What is the minimum medication master data source?
- Does the clinic need data migration from paper, spreadsheets, or an existing system?

## 30. Next Build Artifacts

After this TDD, the next engineering artifacts should be:

1. `README.md` with local setup instructions.
2. `.env.example`.
3. `docker-compose.yml`.
4. Backend NestJS scaffold.
5. Frontend Next.js scaffold.
6. Prisma schema and first migration.
7. OpenAPI YAML generated from API contracts.
8. Seed data for roles, permissions, demo tenant, demo clinic, and users.

