# API module plan

## API conventions

All endpoints are versioned under `/api`. Successful responses use `{ success: true, data, message? }`; failures use `{ success: false, error: { code, message, details? } }`. Validation details are safe and field-oriented; stack traces never leave the server. Cursor or offset pagination is explicit and consistently shaped.

## Modules

| Module | Endpoints and responsibilities | Access |
| --- | --- | --- |
| Auth | register, login, logout, refresh, forgot/reset password, verification, `me` | public except session actions |
| Users | profile read/update, account administration | owner or admin |
| Tickets | create/list/read/update, assignment, messages, feedback, summaries, reply drafts | owner, assigned agent, or admin by action |
| Chat | conversation CRUD, AI messages, escalation | owning customer; service-side AI only |
| Documents | upload/list/read/delete/reprocess | admin |
| Notifications | list, unread count, mark read | owner |
| Admin | dashboard, users, agents, analytics, audit logs | admin |
| Health | liveness/readiness | infrastructure-only detail in production |

## Endpoint plan

```text
POST   /api/auth/register                  POST /api/auth/login
POST   /api/auth/logout                    POST /api/auth/refresh
POST   /api/auth/forgot-password           POST /api/auth/reset-password
GET    /api/auth/me

POST   /api/tickets                        GET  /api/tickets
GET    /api/tickets/:id                    PATCH /api/tickets/:id
POST   /api/tickets/:id/messages           POST /api/tickets/:id/feedback
POST   /api/tickets/:id/summary            POST /api/tickets/:id/suggest-reply

POST   /api/chat/message                   GET  /api/chat/conversations
GET    /api/chat/conversations/:id         DELETE /api/chat/conversations/:id

POST   /api/documents                      GET  /api/documents
GET    /api/documents/:id                  DELETE /api/documents/:id
POST   /api/documents/:id/reprocess

GET    /api/notifications                  PATCH /api/notifications/:id/read
GET    /api/admin/dashboard                GET /api/admin/users
GET    /api/admin/agents                   GET /api/admin/analytics
GET    /api/admin/audit-logs
```

Socket.IO uses authenticated, ticket-scoped rooms. HTTP remains the durable command/data source; sockets deliver real-time notifications, message events, typing events, read receipts, and presence updates.
