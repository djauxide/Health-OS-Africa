# HealthOS Africa — Project Completion & Demo Readiness Plan

**Purpose:** Turn the existing engineering MVP into a reliable, clearly labelled demonstration that can be shown to pilot stakeholders without presenting unvalidated functionality as production-ready.

**Current baseline:** The repository contains a Next.js frontend, TypeScript API, PostgreSQL schema/seed, Docker Compose stack, Nginx configuration, and a technical design document. The documented baseline includes authentication, tenant-scoped API access, patients, appointments, dashboard metrics, and pharmacy endpoints. This plan is a work tracker, not evidence that every workflow has passed testing.

## Release targets

### R0 — Reproducible local demo
- [ ] Verify a clean clone installs and builds using the documented Node/npm versions.
- [ ] Verify `npm run typecheck` and `npm run build` from the repository root.
- [ ] Verify Docker Compose starts all declared services and health checks pass.
- [ ] Confirm seed data is synthetic, clearly labelled, and safe for screenshots/presentations.
- [ ] Replace any publicly documented default credentials before any hosted deployment; keep local demo credentials restricted to the demo environment.
- [ ] Add a concise demo runbook with setup, login, click-through path, reset instructions, and known limitations.

### R1 — Core clinic workflow demonstration
- [ ] Admin signs in and sees tenant/clinic context.
- [ ] Reception registers a synthetic patient and finds that patient by search.
- [ ] Reception books an appointment and checks the patient in.
- [ ] Nurse records vitals and a triage category; triage must be explicitly labelled as a workflow aid, not autonomous diagnosis.
- [ ] Doctor records a consultation note and a draft prescription.
- [ ] Pharmacist views the prescription, records dispensing, and updates stock.
- [ ] Dashboard metrics reflect the actions performed during the demo.
- [ ] Audit events capture important reads/writes and actor identity where implemented.

### R2 — Safety, privacy, and tenant boundaries
- [ ] Test unauthenticated access to protected routes.
- [ ] Test each role against permitted and prohibited actions.
- [ ] Test cross-tenant read and write attempts; verify they fail closed.
- [ ] Verify secrets are environment-provided and excluded from git.
- [ ] Review session/token handling, password storage, CORS, rate limiting, and error responses.
- [ ] Document backup/restore, retention, incident handling, and deployment responsibilities.
- [ ] Do not load real patient information into public demo environments.

### R3 — Eastern Cape pilot extensions (after the core demo is stable)
- [ ] Model Province → District → Facility → Mobile Unit → Service Point → Route → Outreach Session → Encounter → Referral.
- [ ] Add a field-friendly PWA workflow with explicit offline queueing, conflict handling, and safe resynchronisation.
- [ ] Add fleet/equipment availability and mobile outreach reporting.
- [ ] Define the EMS referral boundary and escalation ownership; do not imply the software dispatches emergency services unless an approved integration exists.
- [ ] Define language/localisation requirements with community and clinical stakeholders.
- [ ] Assess interoperability requirements and agree standards/interfaces with the Department before claiming integration.

### R4 — AI assistance (only after governance review)
- [ ] Keep AI optional and visibly separated from clinician-authored records.
- [ ] Use Mistral models for bounded administrative support such as summarisation, translation assistance, and information retrieval, subject to human review.
- [ ] Prohibit autonomous diagnosis, prescribing, triage overrides, and emergency dispatch.
- [ ] Add source/context display, uncertainty handling, feedback, logging, and privacy controls.
- [ ] Complete clinical safety, POPIA, security, and procurement reviews before real-world use.

## Demo acceptance checklist

A demo is ready to share when:
1. A clean install/build succeeds and the setup instructions are reproducible.
2. The full seeded synthetic-patient workflow can be completed from registration through pharmacy.
3. Role and tenant-isolation tests pass for the tested routes.
4. No real patient data or production secrets are included.
5. The interface and presentation state that it is a prototype/MVP and identify unimplemented or unvalidated areas.
6. A demo script, reset procedure, known-issues list, and version identifier are available.

## Suggested stakeholder demo sequence

1. Sign in as a clinic administrator.
2. Show the clinic dashboard and operational indicators.
3. Register a fictional patient and book an appointment.
4. Check in the patient and demonstrate the queue/triage hand-off.
5. Enter a sample consultation and create a draft prescription.
6. Demonstrate pharmacy dispensing and stock visibility.
7. Return to the dashboard and show the changed metrics.
8. Close with the mobile/outreach roadmap and explicitly distinguish planned capabilities from working features.

## Release disclaimer

This repository is an MVP engineering baseline. It is not, by itself, evidence of clinical validation, regulatory approval, POPIA compliance, production hardening, provincial interoperability, or authorization to process real patient data. Any pilot requires clinical, information-security, legal, operational, and Departmental approval, plus agreed hosting and support arrangements.