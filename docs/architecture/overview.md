# Architecture overview

## Runtime boundaries

The React single-page application communicates only with the Express API through HTTPS and Socket.IO. Nginx is the production edge: it serves client assets, proxies `/api` to Express, and upgrades Socket.IO connections. The backend owns authorization, business rules, audit records, data access, file handling, RAG orchestration, email, and n8n webhooks.

PostgreSQL holds durable transactional data. Redis is limited to cache, rate-limit counters, temporary reset/verification records, and socket-related transient state. Qdrant holds document-chunk vectors and non-sensitive retrieval payload. Uploaded originals live in a backend-controlled non-public storage directory; an object-storage adapter can replace local storage later.

## Components and responsibilities

| Component | Responsibility |
| --- | --- |
| Frontend | UI state, forms, route protection, API/socket client; no secrets or direct data-store access |
| API | Authentication, RBAC, validation, tickets, chats, documents, notifications, analytics |
| Prisma/PostgreSQL | Users, tickets, messages, documents, feedback, audit logs, durable notification state |
| Redis | Rate limits, ephemeral tokens, bounded cache, optional Socket.IO adapter |
| Qdrant | Semantic vector search with document provenance payload |
| AI service | Gemini generation and configurable embeddings behind provider interfaces |
| n8n | Outbound workflow orchestration invoked by authenticated backend webhooks |

## Security boundaries

- Access tokens are short-lived; refresh tokens are rotated and delivered by secure HTTP-only cookies in production.
- Every API request passes request ID, security headers, CORS, rate limiting, authentication (when required), Zod validation, and centralized error normalization.
- Resource-level checks ensure customers can only access their own conversations, tickets, messages, and feedback. Agents access assigned tickets unless an admin-authorized policy expands this later.
- Documents are MIME/size validated, safe-renamed, stored outside static/public paths, and processed asynchronously. No uploaded content is executable.
- Retrieved text is untrusted data. The prompt treats it as reference material, not instructions; source attribution derives only from Qdrant payload.

## Production topology

Docker Compose is for local/demo deployment. Production uses separate managed PostgreSQL, Redis, Qdrant, secret storage, object storage, and a container orchestrator or hardened VM setup. Nginx terminates TLS, application containers run as non-root, data services have persistent volumes/backups, and the API is horizontally scalable after using the Socket.IO Redis adapter.

## Observability

The backend emits structured logs with request IDs and redaction. Audit logs capture user-impacting changes. Health endpoints will distinguish liveness from dependency readiness. Metrics and tracing are deferred until the core flows are stable.
