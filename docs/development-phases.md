# Development roadmap

- [x] Phase 0 — Architecture: repository layout, initial README, environment template, infrastructure plan, data/API/RAG design.
- [x] Phase 1 — Backend foundation: npm workspace, strict TypeScript Express API, Prisma schema/seed, JWT auth, RBAC middleware, validation, logging, error handling, and baseline tests.
- [x] Phase 2 — Frontend foundation: Vite React app, Tailwind design system, routing, registration/login UI, session restoration, protected routes, role-aware layout, and TanStack Query client.
- [ ] Phase 3 — Ticket system: durable tickets/messages/feedback, assignment/status/priority and agent views.
- [ ] Phase 4 — Knowledge base: secured upload, extraction, chunking, Qdrant indexing and management.
- [ ] Phase 5 — RAG chatbot: grounded chat, sources, history, controlled escalation.
- [ ] Phase 6 — AI support: summaries, reply drafts, categorization, sentiment assistance.
- [ ] Phase 7 — Real-time communication: Socket.IO rooms, typing, presence, read state.
- [ ] Phase 8 — Automation: n8n webhooks, email, notification workflows and delivery tracking.
- [ ] Phase 9 — AI agent: controlled and audited tool calling.
- [ ] Phase 10 — Analytics: database-backed operational metrics and dashboard charts.
- [ ] Phase 11 — Security and testing: authorization, upload, RAG safety, integration, and rate-limit coverage.
- [ ] Phase 12 — Docker and deployment: application images, Nginx, CI, production hardening.

## Phase 1 acceptance criteria

1. A strict TypeScript Express service starts from the monorepo.
2. Prisma schema migrates against PostgreSQL and a safe dev seed creates role-based demo accounts.
3. Register/login/logout/refresh/`me` work with password hashing and token rotation.
4. Authentication, role authorization, validation, error handling, request logging, CORS, Helmet, and rate limiting are tested.
5. No production secret, stack trace, or raw password is exposed.
