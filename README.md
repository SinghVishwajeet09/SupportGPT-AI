# SupportGPT AI

Enterprise AI Customer Support and Business Automation Platform. SupportGPT AI is a modular SaaS-style application for customer support teams: authenticated customer and agent workflows, ticket operations, a governed knowledge base, RAG-powered assistance, automation, and data-backed analytics.

## Phase 0 status

Architecture and deployment planning are complete. Implementation begins only after approval of Phase 1 (backend foundation).

## Proposed architecture

```text
Browser (React + TypeScript)
        |
      Nginx
        |
Express API + Socket.IO
  |       |        |       \
Postgres Redis   Qdrant   n8n / SMTP
                    |
             Gemini + embeddings
```

The API is the sole boundary for business data, AI providers, Qdrant, and automation. The frontend never receives infrastructure credentials or accesses Qdrant directly.

## Repository layout

```text
apps/frontend/       React/Vite client (Phase 2)
apps/backend/        Express API and Socket.IO server (Phase 1)
packages/shared/     Shared API contracts and types
infrastructure/      Docker, Nginx, and automation assets
docs/                Architecture, API, and final-year project material
```

See [architecture overview](docs/architecture/overview.md), [database schema](docs/architecture/database-schema.md), [API plan](docs/api/module-plan.md), and [development roadmap](docs/development-phases.md).

## Technology stack

React, TypeScript, Vite, Tailwind CSS, React Router, TanStack Query, Axios, Socket.IO Client, Recharts, React Hook Form, and Zod form the client. Node.js, TypeScript, Express, Socket.IO, Prisma, PostgreSQL, Redis, Qdrant, Google Gemini, LangChain.js, n8n, Docker, Nginx, and GitHub Actions form the platform.

## Local setup (planned)

1. Copy `.env.example` to `.env` and set non-example secrets.
2. Start supporting services with `docker compose up -d postgres redis qdrant n8n`. PostgreSQL is mapped to host port 5433 by default so it does not conflict with a locally installed instance on 5432.
3. Install workspace dependencies with `npm install`, run `npm run prisma:generate`, then `npm run prisma:migrate` and `npm run prisma:seed`.
4. Start the backend with `npm run dev:backend` and verify `GET /api/health/live`.
5. Start the frontend with `npm run dev:frontend`, then open `http://localhost:5173`.

The root compose file deliberately defines infrastructure now and will add application images when their Dockerfiles exist in later phases.

## Security baseline

No credentials are committed. The future API uses HTTP-only refresh cookies, short-lived JWT access tokens, role checks, input validation, rate limiting, security headers, safe upload storage, audit logs, and centralized error handling. AI output is grounded in retrieved knowledge and may only initiate controlled, authorized backend actions.

## Phase 1 API

The backend currently exposes `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `POST /api/auth/refresh`, `GET /api/auth/me`, and `GET /api/health/live`. Database-backed authentication needs a running PostgreSQL instance configured through `DATABASE_URL`. Demo seed accounts use the local-only password printed by the seed command; change it before any non-local use.

## Phase 2 client

The React client provides responsive login and customer registration forms, secure session restoration through the refresh-token cookie, protected routing, and a role-aware workspace shell. It talks only to the Express API at `VITE_API_URL` (default: `http://localhost:4000/api`); it never accesses PostgreSQL, Redis, Qdrant, or AI services directly.

## Documentation map

- `docs/architecture/overview.md` — boundaries and deployment design
- `docs/architecture/database-schema.md` — relational schema and invariants
- `docs/architecture/rag-design.md` — ingestion, retrieval, safety, escalation
- `docs/api/module-plan.md` — endpoint ownership and API conventions
- `docs/development-phases.md` — implementation sequence and acceptance criteria
- `docs/project-report/` — reserved for final-year report chapters and diagrams

## License

To be selected by the project owner before public release.
