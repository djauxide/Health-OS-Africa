# HealthOS Africa

HealthOS Africa is a multi-tenant clinical operating system MVP for paperless clinic operations.

## What Is Included

- `frontend/`: Next.js dashboard with login middleware, dashboard, patients, and appointments pages.
- `backend/`: TypeScript API with JWT auth, tenant-scoped middleware, patients, appointments, dashboard, and pharmacy endpoints.
- `database/`: PostgreSQL schema and seed data.
- `infra/nginx/`: Nginx gateway configuration.
- `docker-compose.yml`: Production-shaped local stack with PostgreSQL, Redis, MinIO, backend, frontend, and gateway.

## Demo Login

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

## Docker Environment

Copy the environment template:

```bash
cp .env.example .env
```

Start the full stack:

```bash
docker compose up -d --build
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

## Technical Design

- [HealthOS Africa Technical Design Document](docs/healthos-africa-technical-design.md)
