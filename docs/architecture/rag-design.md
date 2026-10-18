# AI and RAG architecture

## Ingestion flow

1. An admin uploads a PDF, DOCX, or TXT document through an authenticated endpoint.
2. The API verifies authorization, file size, MIME type, extension, safe filename, and storage destination.
3. A `Document` record enters `PENDING`, then `PROCESSING`; extraction failures are persisted as `FAILED` without exposing internal details to clients.
4. A format-specific extractor obtains text. Text is normalized and split into overlapping, bounded semantic chunks.
5. The configured embedding provider generates vectors. Provider configuration is environment-driven behind an `EmbeddingService` interface.
6. Vectors are upserted into the Qdrant collection with payload: document ID/name, chunk ID, page where available, source type, text, and uploader ID.
7. The document record stores final chunk count and becomes `READY`. The operation is audited.

## Answer flow

1. Validate and authenticate the message; load only the bounded relevant conversation history.
2. Classify whether support knowledge is needed and detect a direct human-escalation request.
3. Embed the query, retrieve a small top-K candidate set from Qdrant, and apply a relevance threshold.
4. Build a prompt that makes retrieved content reference data, requires grounded answers, rejects instruction injection, and forbids fabricated policy/source claims.
5. Call Gemini through an AI provider adapter with configured model, token, timeout, and failure policy.
6. Return the answer only with source references actually supplied by selected Qdrant chunks; persist the conversation exchange.
7. With insufficient retrieval confidence, return an explicit inability-to-verify response and offer a support ticket. A ticket is only claimed created after the transaction succeeds.

## Guardrails and cost controls

- No LLM receives unrestricted database access or raw internal notes.
- Prompt-injection text from documents/messages is data, not executable instruction.
- Retrieval is metadata-scoped where necessary and context is capped.
- Recent history plus a stored summary replaces unbounded chat history.
- Model, embedding provider, max output tokens, retrieval count, and thresholds are configurable.
- Provider/Qdrant failures degrade to a safe, user-visible support option; they do not crash the API.

## Phase 2 agent layer

Tool calling comes only after RAG is stable. Each tool has a Zod input schema, authorization gate, narrow service call, structured result, and audit event. The model never writes SQL or accesses stores directly.
