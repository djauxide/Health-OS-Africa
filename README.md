# Health-OS Africa

> **A digital operating system for connected, coordinated and equitable healthcare delivery across Africa.**

Health-OS Africa is an African-first, multi-tenant healthcare platform designed to help clinics, mobile health teams, pharmacies, healthcare professionals and health administrators manage the patient journey from **community and registration through triage, consultation, treatment, referral and follow-up**.

The current repository is an **MVP engineering baseline**. The product vision extends beyond the current clinic workflow into mobile clinics, healthcare outreach, ambulance/EMS coordination, offline-capable field operations, multilingual access, operational intelligence and responsible AI assistance.

---

## 1. Product Vision

Health-OS Africa is intended to become a practical digital layer connecting the different parts of healthcare delivery that are often separated by geography, paper processes and disconnected systems.

### The vision

**One patient. One longitudinal record. One coordinated care journey.**

The platform should help healthcare teams answer:

- Who is the patient?
- What happened during the patient's previous visit?
- What care is required today?
- Where is the patient in the clinic workflow?
- What medication was prescribed and dispensed?
- Does the patient need a referral or follow-up?
- Which clinic, mobile unit or service point is available?
- Where are outreach services being delivered?
- Which resources are running low?
- What is happening across the facility, district or mobile programme?

Health-OS Africa is designed to support these questions without replacing qualified healthcare professionals or existing government governance structures.

---

# 2. Core Product

The first release focuses on a **paperless clinic operating workflow**.

### Core clinical workflow

```text
PATIENT
   |
   v
REGISTRATION
   |
   v
APPOINTMENT / CHECK-IN
   |
   v
QUEUE
   |
   v
TRIAGE
   |
   v
CONSULTATION
   |
   +----> DIAGNOSIS / CLINICAL NOTES
   |
   +----> PRESCRIPTION
   |
   v
PHARMACY / DISPENSING
   |
   v
FOLLOW-UP / REFERRAL
   |
   v
CONTINUITY OF CARE
```

The MVP architecture already defines the principal domains for these workflows.

---

# 3. Product Modules

## 3.1 Patient Management

- Patient registration
- Patient number
- Demographic information
- Contact information
- Emergency contact
- Medical-aid information
- Allergies
- Chronic conditions
- Patient search
- QR identifier capability
- Longitudinal patient history

## 3.2 Appointments

- Appointment booking
- Provider allocation
- Appointment status
- Check-in
- Cancellation
- No-show tracking
- Daily appointment view

## 3.3 Queue Management

Designed around the real clinic flow:

- Reception
- Waiting
- Triage
- Waiting for clinician
- Consultation
- Pharmacy
- Completed

The interface should make patient movement visible to the appropriate staff without exposing information unnecessarily.

## 3.4 Nurse Triage

Capture:

- Blood pressure
- Pulse
- Respiratory rate
- Temperature
- Clinical observations
- Priority classification

Triage is a **clinical workflow support tool**. It must not be represented as autonomous diagnosis or as a replacement for professional clinical judgement.

## 3.5 Consultation

Doctor/clinician workspace supporting:

- SOAP notes
- Clinical observations
- Diagnoses
- Treatment plans
- Prescriptions
- Follow-up
- Referral documentation

## 3.6 Pharmacy

- Prescription queue
- Medication master
- Stock batches
- Stock movements
- Dispensing
- Low-stock alerts
- Expiry monitoring
- Inventory reporting

## 3.7 Reporting & Dashboards

Operational visibility for:

- Registered patients
- Appointments
- Consultations
- Queue activity
- Pharmacy activity
- Medicine availability
- Stock alerts
- Facility performance
- Audit activity

---

# 4. Eastern Cape / African Healthcare Extension

Health-OS Africa is intended to support the broader healthcare mobility and access challenge addressed by the Eastern Cape programme concept.

The extended platform will introduce:

### Mobile clinic operations

```text
HEALTH DEPARTMENT
       |
       v
DISTRICT
       |
       v
FACILITY / MOBILE UNIT
       |
       v
OUTREACH SESSION
       |
       v
COMMUNITY / SERVICE POINT
       |
       v
PATIENT
```

Potential capabilities:

- Mobile clinic scheduling
- Outreach calendars
- Service-point management
- Mobile healthcare team allocation
- Patient registration in the field
- Field encounters
- Follow-up lists
- Referral creation
- Medicine availability
- Mobile unit status
- Outreach statistics
- District-level dashboards

### Ambulance / EMS coordination

The longer-term architecture can provide an operational information layer around:

- Ambulance availability
- Vehicle/unit status
- Base/facility information
- Referral requests
- Patient transfer information
- Receiving facility visibility
- Handover documentation
- Incident records
- Operational reporting

**Important:** Health-OS Africa does not claim to dispatch emergency services autonomously. Any EMS integration must be implemented with approved interfaces, governance, clinical protocols and Departmental authorization.

---

# 5. Offline & Connectivity-Aware Healthcare

African healthcare environments can include facilities and mobile teams with unreliable connectivity.

The target field architecture therefore includes:

- Mobile-friendly/PWA workflows
- Local encrypted working data where appropriate
- Offline encounter capture
- Synchronisation queues
- Conflict handling
- Connection status indicators
- Retry mechanisms
- Safe synchronisation
- Auditability

Offline functionality is a planned extension unless specifically marked as implemented and tested in the current release.

---

# 6. Responsible AI Layer

AI is a planned assistance layer rather than the clinical authority of the system.

Potential uses include:

### Clinical administration

- Clinical note summarisation
- Structured documentation assistance
- Patient-history summarisation
- Referral-letter drafting
- Discharge-summary assistance

### Language & accessibility

- Translation assistance
- Plain-language explanations
- Multilingual communication
- Local terminology support

### Operational intelligence

- Dashboard summaries
- Trend identification
- Appointment/queue analysis
- Stock reporting assistance
- Administrative workload summaries

### AI guardrails

Health-OS Africa should **not** autonomously:

- Diagnose patients
- Prescribe medication
- Override clinicians
- Make emergency dispatch decisions
- Determine treatment without qualified human review

AI-generated content must be clearly distinguishable from clinician-authored information.

The initial AI strategy may use Mistral models or another approved model depending on deployment, privacy, cost, performance and governance requirements.

---

# 7. African-First Design Principles

Health-OS Africa is not intended to be a generic healthcare SaaS product simply transplanted into Africa.

The product should be designed around actual African operating environments.

### Principles

**Mobile first**  
Healthcare workers should be able to work from clinics, outreach sites and mobile units.

**Low bandwidth aware**  
The system should remain useful when connectivity is poor.

**Multilingual**  
The interface and patient-facing workflows should support relevant African languages as requirements are confirmed with users.

**Simple workflows**  
A healthcare worker should not need extensive technical training to perform routine tasks.

**Affordable deployment**  
The architecture should support small facilities as well as larger multi-facility deployments.

**Interoperable**  
The platform should be capable of integrating with approved existing systems rather than assuming it will replace everything.

**Secure by design**  
Healthcare information must be protected through authentication, authorization, encryption, auditability and appropriate governance.

**Human-centred AI**  
AI assists healthcare workers; it does not replace clinical accountability.

---

# 8. Look & Feel

The visual identity should communicate:

> **Clinical confidence + African accessibility + modern technology.**

It should feel like a serious healthcare operating system rather than a generic corporate dashboard.

## Design language

### Visual character

- Clean
- Modern
- Calm
- Professional
- Human
- Accessible
- Data-driven
- Mobile-friendly

Avoid:

- Excessive gradients
- Overly decorative interfaces
- Gaming-style dashboards
- Dense spreadsheet-like screens
- Unnecessary animations
- Excessive use of colour for decoration

Colour should primarily communicate **state and meaning**.

For example:

- Normal / operational
- Attention
- Warning
- Critical
- Completed
- Offline
- Synchronising

The exact production colour palette should be defined centrally through design tokens rather than scattered across individual components.

---

# 9. Application Layout

## Desktop

The primary application shell should use:

```text
+----------------------------------------------------------------+
| HEALTH-OS AFRICA                         User / Clinic / Status |
+----------------+-----------------------------------------------+
|                |                                               |
|  Dashboard     |                                               |
|                |  PAGE HEADER                                   |
|  Patients      |  Context / filters / primary action           |
|                |                                               |
|  Appointments  |  +----------------+  +----------------------+  |
|                |  |                |  |                      |  |
|  Queue         |  |    CONTENT     |  |      INSIGHTS        |  |
|                |  |                |  |                      |  |
|  Triage        |  |                |  |                      |  |
|                |  +----------------+  +----------------------+  |
|  Consultations |                                               |
|                |  DATA / WORKFLOW                              |
|  Pharmacy      |                                               |
|                |                                               |
|  Reports       |                                               |
|                |                                               |
|  Mobile Health |                                               |
|                |                                               |
|  Settings      |                                               |
+----------------+-----------------------------------------------+
```

### Sidebar

Primary navigation:

1. Dashboard
2. Patients
3. Appointments
4. Queue
5. Triage
6. Consultations
7. Pharmacy
8. Referrals
9. Mobile Health
10. Ambulance / EMS
11. Reports
12. Administration
13. Audit
14. Settings

Items should be role-aware. A receptionist should not see administrative or clinical functions they do not need.

---

# 10. Dashboard Experience

The dashboard should become the operational command centre.

### Header

- Facility
- Date/time
- Connection status
- Notifications
- User profile
- Role

### Primary KPI cards

- Patients today
- Appointments
- Waiting patients
- Consultations
- Pharmacy activity
- Critical alerts

### Main dashboard

A recommended layout:

```text
+---------------------------------------------------------------+
| TODAY'S CLINIC                                                |
+----------------+----------------+----------------+------------+
| Patients       | Appointments   | Waiting        | Alerts     |
|  128           |      42        |      17        |     3      |
+----------------+----------------+----------------+------------+
|                                                               |
| CLINIC FLOW                    | PRIORITY / ALERTS           |
|                                                               |
| Registration  ███████          | Critical patients            |
| Triage        █████            | Low stock                    |
| Doctor        ████████         | Referrals                    |
| Pharmacy      ████             | Follow-ups                   |
|                                                               |
+-------------------------------+-------------------------------+
| APPOINTMENTS / QUEUE           | RECENT ACTIVITY             |
+-------------------------------+-------------------------------+
```

The existing dashboard already provides a foundation for this experience.

---

# 11. Patient Profile Experience

The patient profile should become the central longitudinal view.

### Header

```text
PATIENT
[Photo/Avatar]  Full Name
Patient No: HOS-00001234
Age | Gender | Phone
Alerts / Allergies
```

### Tabs

- Overview
- Visits
- Clinical Notes
- Diagnoses
- Prescriptions
- Medication
- Allergies
- Chronic Conditions
- Referrals
- Documents
- Audit

### Quick actions

- Book appointment
- Check in
- Start triage
- Start consultation
- Create prescription
- Create referral
- Schedule follow-up

---

# 12. Role-Based Experience

## Receptionist

Primary focus:

**Register → Book → Check-in → Queue**

## Nurse

Primary focus:

**Queue → Triage → Vitals → Priority → Clinician**

## Doctor / Clinician

Primary focus:

**Patient → History → Consultation → Diagnosis → Prescription → Follow-up**

## Pharmacist

Primary focus:

**Prescription → Verify → Dispense → Stock**

## Clinic Administrator

Primary focus:

**People → Operations → Resources → Reports → Compliance**

## District / Programme Manager

Primary focus:

**Facilities → Mobile Units → Outreach → Performance → Resources**

---

# 13. Mobile Health Command Centre

The future Mobile Health module should provide an operational view of outreach services.

### Example layout

```text
+---------------------------------------------------------------+
| MOBILE HEALTH                                                  |
+---------------------------------------------------------------+
| ACTIVE UNITS | TODAY'S OUTREACH | PATIENTS | REFERRALS       |
+---------------------------------------------------------------+
|                                                               |
| OUTREACH MAP / SERVICE POINTS                                 |
|                                                               |
|   [Map / service area visualisation]                           |
|                                                               |
+-------------------------------+-------------------------------+
| MOBILE UNITS                  | UPCOMING OUTREACH             |
|                               |                               |
| Unit 01  ACTIVE               | Monday - Site A               |
| Unit 02  EN ROUTE             | Tuesday - Site B              |
| Unit 03  MAINTENANCE          | Wednesday - Site C            |
+-------------------------------+-------------------------------+
```

The map component should be optional and must not make the core system dependent on a particular mapping provider.

---

# 14. Ambulance / EMS Operations

Future operational screen:

```text
+---------------------------------------------------------------+
| EMS / REFERRALS                                                |
+---------------------------------------------------------------+
| AVAILABLE | ACTIVE | TRANSFER | MAINTENANCE | REFERRALS       |
+---------------------------------------------------------------+
|                                                               |
| UNIT STATUS        CURRENT LOCATION       DESTINATION         |
| EMS-001            Available              ---                 |
| EMS-002            Active                 Regional Hospital   |
| EMS-003            Transfer               District Hospital   |
|                                                               |
+---------------------------------------------------------------+
| REFERRAL / HANDOVER QUEUE                                      |
+---------------------------------------------------------------+
```

This is an operational coordination concept and requires formal integration and governance before live EMS use.

---

# 15. Technical Architecture

The MVP is designed as a modular monolith so that the initial pilot remains manageable while maintaining clear domain boundaries.

```text
Users / Staff / Mobile Teams
          |
          v
Web / PWA
          |
          v
Cloudflare / WAF
          |
          v
Load Balancer
          |
          v
Nginx Gateway
          |
          v
NestJS / TypeScript API
          |
    +-----+-----+----------------+
    |           |                |
 PostgreSQL    Redis           MinIO
    |                            |
    +------------+---------------+
                 |
          Audit / Events
```

### Current technology direction

**Frontend**

- Next.js
- TypeScript
- TailwindCSS
- ShadCN UI
- Recharts
- Zod

**Backend**

- NestJS
- TypeScript
- Prisma
- REST API
- Modular domain architecture

**Data**

- PostgreSQL 16
- Redis
- MinIO / S3-compatible object storage

**Infrastructure**

- Docker / Podman
- Nginx
- Kubernetes-ready architecture
- Terraform
- GitHub Actions

---

# 16. Multi-Tenant Architecture

The platform is intended to support multiple healthcare organisations while maintaining tenant isolation.

Conceptually:

```text
Health-OS Africa
       |
       +--- Organisation / Tenant
       |       |
       |       +--- Clinic
       |       +--- Users
       |       +--- Patients
       |       +--- Pharmacy
       |
       +--- Organisation / Tenant
               |
               +--- Clinic
               +--- Mobile Unit
               +--- Users
               +--- Patients
```

Tenant-owned data should be scoped through `tenant_id`, with clinic-level scoping through `clinic_id` where applicable.

---

# 17. Security & Privacy

Health-OS Africa handles potentially sensitive healthcare information and therefore requires security to be treated as a product requirement rather than an afterthought.

Target controls include:

- Role-based access control
- Tenant isolation
- Short-lived access tokens
- Refresh-token rotation
- MFA for privileged users
- Password hashing
- Audit logging
- Secure secret management
- Encryption in transit
- Appropriate encryption at rest
- Input validation
- Rate limiting
- Secure error handling
- Backup and recovery
- Data retention controls
- Access reviews

The platform must comply with applicable South African privacy, healthcare and information-security requirements before processing real patient information.

No public demonstration environment should contain real patient information.

---

# 18. Auditability

Important system actions should produce auditable events.

Examples:

```text
USER LOGIN
PATIENT CREATED
PATIENT UPDATED
APPOINTMENT CREATED
PATIENT CHECKED IN
TRIAGE RECORDED
CONSULTATION CREATED
PRESCRIPTION CREATED
MEDICATION DISPENSED
STOCK UPDATED
REFERRAL CREATED
USER PERMISSION CHANGED
```

Audit records should capture sufficient context for authorised administrators and security reviewers without unnecessarily exposing sensitive clinical information.

---

# 19. Interoperability

Health-OS Africa should be designed as an integration layer rather than an isolated application.

Potential future integration areas:

- Existing Department of Health systems
- Facility information systems
- Laboratory systems
- Pharmacy systems
- Referral systems
- EMS systems
- Identity services
- Notifications
- Approved health-information exchange interfaces

Integration standards and interfaces must be confirmed with the relevant health authorities and system owners before being represented as deployed integrations.

---

# 20. Notifications

Future notification services can support:

### Patients

- Appointment reminders
- Follow-up reminders
- Medication reminders
- Referral notifications

### Healthcare workers

- Queue alerts
- Appointment changes
- Critical operational alerts
- Referral updates

### Administrators

- Stock alerts
- Expiring medication
- Facility alerts
- Operational exceptions

Channels may include SMS, email, push notifications and approved messaging integrations.

---

# 21. Analytics & Health Intelligence

The long-term platform should provide multiple levels of visibility.

### Facility

"What is happening in my clinic today?"

### Mobile programme

"Which communities are being reached?"

### District

"Which facilities require attention?"

### Programme management

"Are resources and services reaching the intended population?"

### Executive

"What are the operational and service-delivery trends?"

Analytics must distinguish between **reported data**, **derived metrics** and **AI-generated summaries**.

---

# 22. Design System

The UI should use reusable design tokens and components.

### Core components

- App shell
- Sidebar
- Header
- Cards
- KPI cards
- Tables
- Data grids
- Status badges
- Alerts
- Forms
- Modals
- Drawers
- Tabs
- Timelines
- Empty states
- Loading states
- Error states
- Offline indicators
- Synchronisation indicators
- Confirmation dialogs

### UX principles

1. Show the most important action first.
2. Keep clinical workflows short.
3. Avoid unnecessary data entry.
4. Make system status visible.
5. Use consistent terminology.
6. Never hide important warnings.
7. Make destructive actions explicit.
8. Provide useful empty and error states.
9. Design for keyboard and touch.
10. Ensure accessibility is part of the component system.

---

# 23. Demo Mode

The project should support a safe synthetic demonstration environment.

### Demo personas

- Clinic Administrator
- Receptionist
- Nurse
- Doctor
- Pharmacist

### Demonstration journey

```text
LOGIN
  ↓
DASHBOARD
  ↓
REGISTER PATIENT
  ↓
BOOK APPOINTMENT
  ↓
CHECK-IN
  ↓
TRIAGE
  ↓
CONSULTATION
  ↓
PRESCRIPTION
  ↓
PHARMACY
  ↓
DISPENSING
  ↓
DASHBOARD UPDATE
```

The demo should use fictional patient information only.

---

# 24. Product Roadmap

## Phase 1 — Clinic MVP

**Current priority**

- Authentication
- RBAC
- Patient management
- Appointments
- Queue
- Triage
- Consultation
- Prescriptions
- Pharmacy
- Dashboard
- Audit

## Phase 2 — Pilot Hardening

- Automated tests
- Security testing
- Tenant isolation testing
- Backup/recovery
- Monitoring
- Deployment automation
- Better reporting
- User management
- Production configuration

## Phase 3 — Mobile Health

- Mobile clinic management
- Outreach scheduling
- Field registration
- Offline workflows
- Synchronisation
- Community service points
- Mobile inventory
- Referral workflows

## Phase 4 — EMS & Referral Coordination

- Ambulance availability
- Transfer workflow
- Referral coordination
- Receiving facility visibility
- Handover documentation
- Operational dashboards

## Phase 5 — Responsible AI

- Summarisation
- Translation assistance
- Administrative assistance
- Information retrieval
- Operational intelligence
- Human review workflows

## Phase 6 — Scale

- District deployments
- Multi-facility operations
- Approved interoperability
- National / regional expansion
- Partner ecosystem

---

# 25. Current Repository Structure

```text
Health-OS-Africa/
│
├── frontend/
│   ├── app/
│   ├── components/
│   └── lib/
│
├── backend/
│   ├── modules/
│   ├── prisma/
│   └── src/
│
├── database/
│   ├── schema/
│   └── seed/
│
├── infra/
│   ├── docker/
│   ├── nginx/
│   ├── kubernetes/
│   └── terraform/
│
├── docs/
│   ├── healthos-africa-technical-design.md
│   └── PROJECT_COMPLETION_PLAN.md
│
├── docker-compose.yml
├── .env.example
└── README.md
```

The exact repository structure may evolve as implementation progresses.

---

# 26. Local Development

Install dependencies:

```bash
npm install
```

Run type checks:

```bash
npm run typecheck
```

Build:

```bash
npm run build
```

For the local container environment:

```bash
cp .env.example .env
podman machine start
podman compose up -d --build
```

Expected local services documented by the current MVP:

```text
Frontend: http://localhost:3000
Backend:  http://localhost:4000/health
Gateway:  http://localhost:8080
MinIO:    http://localhost:9001
Postgres: localhost:5432
Redis:    localhost:6379
```

Use the project's current environment documentation as the source of truth if commands or ports change.

---

# 27. Demo Credentials

The current seeded credentials are intended **only for local development**.

```text
Email: admin@healthos.test
Password: HealthOS123!
```

Do not use these credentials in a hosted or production environment.

Before deployment:

- Replace default credentials.
- Rotate secrets.
- Configure production environment variables.
- Disable development-only accounts.
- Verify access controls.
- Confirm synthetic data has been removed or isolated.

---

# 28. What Is Implemented vs Planned

Health-OS Africa intentionally distinguishes between the **engineering baseline**, **planned functionality** and **validated production functionality**.

### Engineering baseline

The repository currently contains the foundations for:

- Next.js frontend
- TypeScript backend
- PostgreSQL
- Authentication
- Tenant-scoped API design
- Patients
- Appointments
- Dashboard
- Pharmacy
- Docker/Podman environment
- Technical architecture documentation

### Planned extensions

- Mobile health
- Offline field operations
- EMS coordination
- Advanced referrals
- Multilingual workflows
- AI assistance
- Broader interoperability
- District-level intelligence

### Not automatically implied

The existence of code or documentation does **not** mean that a feature is:

- Clinically validated
- Security tested
- POPIA compliant
- Approved by a health authority
- Connected to a government system
- Ready for production
- Approved for real patient data

Validation status must be established through actual testing and the appropriate governance process.

---

# 29. Project Completion Standard

A release should not be considered demo-ready simply because it builds.

The minimum demonstrable workflow is:

```text
AUTHENTICATE
     ↓
REGISTER PATIENT
     ↓
BOOK APPOINTMENT
     ↓
CHECK-IN
     ↓
TRIAGE
     ↓
CONSULT
     ↓
PRESCRIBE
     ↓
DISPENSE
     ↓
UPDATE DASHBOARD
     ↓
AUDIT EVENT
```

A release candidate should additionally demonstrate:

- Clean installation
- Successful build
- Passing automated tests where implemented
- Protected API routes
- Role-based permissions
- Tenant isolation
- Synthetic demo data
- No exposed production secrets
- Clear known limitations
- Reproducible deployment instructions

See [PROJECT_COMPLETION_PLAN.md](docs/PROJECT_COMPLETION_PLAN.md) for the detailed completion checklist.

---

# 30. Stakeholder Positioning

Health-OS Africa is intended to demonstrate how digital infrastructure can strengthen healthcare delivery without requiring healthcare workers to become technology specialists.

The platform connects:

```text
PATIENTS
   ↕
CLINICIANS
   ↕
CLINICS
   ↕
PHARMACIES
   ↕
MOBILE HEALTH
   ↕
EMS / REFERRALS
   ↕
DISTRICT OPERATIONS
   ↕
HEALTH PROGRAMME MANAGEMENT
```

The product is therefore positioned as a **healthcare operating layer**, not merely an electronic medical record.

---

# 31. Long-Term Vision

The long-term objective is to develop Health-OS Africa into a scalable healthcare platform that can support:

- Primary healthcare
- Rural healthcare
- Mobile clinics
- Community outreach
- Pharmacy operations
- Patient continuity
- Referral coordination
- EMS information workflows
- Health programme management
- Operational intelligence
- Responsible AI assistance

The Eastern Cape can serve as an important pilot context, while the underlying architecture is designed with wider African deployment in mind.

---

# 32. Project Status

**Current status:** MVP engineering baseline / active development.

**Immediate objective:** Deliver a stable, reproducible and interactive clinic MVP.

**Next objective:** Extend the platform into mobile healthcare, outreach and referral coordination.

**Long-term objective:** Build an African-first healthcare operating system capable of connecting patients, healthcare workers, facilities and health programmes.

---

## Documentation

- [Technical Design](docs/healthos-africa-technical-design.md)
- [Project Completion & Demo Readiness Plan](docs/PROJECT_COMPLETION_PLAN.md)

---

## Disclaimer

Health-OS Africa is a software development project and MVP engineering baseline. It is not a substitute for qualified medical professionals, approved clinical protocols, statutory health systems or emergency services.

Before real-world deployment, the project requires appropriate clinical validation, security assessment, privacy/legal review, operational governance, hosting controls, interoperability agreements and authorization from relevant stakeholders.

**Build the technology. Validate the workflow. Protect the patient. Scale responsibly.**
