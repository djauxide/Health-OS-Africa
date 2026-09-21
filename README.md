# HealthOS Africa

HealthOS Africa is a multi-tenant clinical operating system MVP for paperless clinic operations.

## What Is Included

- `frontend/`: Next.js dashboard with login middleware, dashboard, patients, and appointments pages.
- `backend/`: TypeScript API with JWT auth, tenant-scoped middleware, patients, appointments, dashboard, and pharmacy endpoints.
- `database/`: PostgreSQL schema and seed data.
- `infra/nginx/`: Nginx gateway configuration.
- `docker-compose.yml`: Production-shaped local stack with PostgreSQL, Redis, MinIO, backend, frontend, and gateway.

## Project completion and demo readiness

See the [Project Completion & Demo Readiness Plan](docs/PROJECT_COMPLETION_PLAN.md) for release gates, workflow acceptance checks, security review items, and the proposed stakeholder demo sequence.

## Demo Login

The credentials below are intended for local seeded development only. Do not use them in a hosted or production environment; replace/remove default credentials and configure secure secrets before deployment.

```text
Email: admin@healthos.test
Password: HealthOS123!
```

## Local Development

Install dependencies:

```bash
npm install
```

Run type checks:

```bash
npm run typecheck
```

Build frontend and backend:

```bash
npm run build
```

## Podman Environment

Copy the environment template:

```bash
cp .env.example .env
```

Start the full stack:

```bash
podman machine start
podman compose up -d --build
```

Services:

```text
Frontend: http://localhost:3000
Backend:  http://localhost:4000/health
Gateway:  http://localhost:8080
MinIO:    http://localhost:9001
Postgres: localhost:5432
Redis:    localhost:6379
```

Stop the stack:

```bash
podman compose down
```

## Technical Design

- [HealthOS Africa Technical Design Document](docs/healthos-africa-technical-design.md)

## Prototype status

This is an MVP engineering baseline. Successful builds, security testing, clinical validation, production readiness, and authorization for real patient data must be verified separately. Use synthetic data for demonstrations.