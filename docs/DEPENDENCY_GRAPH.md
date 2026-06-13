# GSMAXALL — DEPENDENCY GRAPH

Runtime and build dependencies across the unified platform.

## 1. Runtime topology (who calls whom)

```
                         ┌─────────────────────────────┐
                         │        apps/web (Next.js)    │
                         │  Chat · Knowledge · IDE · …  │
                         └───────────────┬──────────────┘
                                         │ HTTPS (REST + SSE/WS)
                                         ▼
                         ┌─────────────────────────────┐
                         │   services/orchestrator      │  ◄── API Gateway + Agent Registry
                         │   (tool registry, routing)   │      (bridges MCP + ACP)
                         └──┬───────┬───────┬───────┬───┘
              ┌────────────┘       │       │       └─────────────┐
              ▼                    ▼       ▼                      ▼
   ┌──────────────────┐  ┌────────────┐ ┌─────────────┐ ┌──────────────────┐
   │ services/agents  │  │services/rag│ │services/     │ │ services/research│
   │ (OpenHands:      │  │ (Knowledge │ │  memory      │ │  + services/     │
   │  code/terminal,  │  │  OS, docs) │ │ (Qdrant)     │ │  search          │
   │  Docker sandbox) │  └─────┬──────┘ └──────┬──────┘ └──────────────────┘
   └──────┬───────────┘        │               │
          │                    │               │
          ▼                    ▼               ▼
   ┌─────────────────────────────────────────────────────────────────┐
   │ Shared infra:  Postgres  ·  Qdrant  ·  Redis  ·  Object storage   │
   └─────────────────────────────────────────────────────────────────┘

   Cross-cutting (used by all):
     • Supabase Auth (identity / JWT)            • Provider Router (litellm / packages-sdk)
     • services/admin (orgs, billing, audit)     • services/analytics (events, usage)
     • services/workflows (triggers, schedules)  • services/media (gen + understanding)
```

## 2. Provider router fan-out

```
ProviderRouter.chat(model, messages)
   ├─ openai        ├─ anthropic     ├─ gemini      ├─ openrouter
   └─ ollama        └─ deepseek      └─ qwen        └─ llama
   (Python services → litellm ;  TS clients → packages/sdk adapters)
```

## 3. Package (build-time) dependency graph — JS/TS workspace

```
packages/types   ◄──────────────┐ (no deps; source of truth for contracts)
      ▲                          │
      │                          │
packages/shared ─────────────────┤  (utils; depends on types)
      ▲                          │
      │                          │
packages/sdk  ───────────────────┤  (provider router + service clients; depends on types, shared)
      ▲                          │
      │                          │
packages/ui  ────────────────────┘  (React component lib + branding; depends on types, shared)
      ▲
      │
apps/web  ── depends on ──►  packages/{ui, sdk, shared, types}
```

Rule: dependencies point **down** only (`apps → packages`, `packages/ui|sdk → shared → types`).
No service depends on `apps/web`. No cycles permitted (enforced in CI later).

## 4. External service dependencies

| Component | External deps |
|-----------|---------------|
| apps/web | Supabase Auth, orchestrator API |
| orchestrator | Postgres, Redis, agents/rag/memory/research, MCP & ACP tool servers |
| agents | Docker engine (sandbox), Postgres, provider router (litellm), git |
| rag | Postgres, memory (Qdrant), provider router (embeddings) |
| memory | Qdrant, provider router (embeddings) |
| research/search | external web search APIs, provider router |
| media | provider router (image/audio models), object storage |
| admin | Postgres, Supabase (user sync), billing provider |
| analytics | Postgres / event store |

## 5. Known version-sensitive pins (from sources)
- FastAPI 0.135.x, Pydantic 2.12.x, SQLAlchemy 2.0.x (Open WebUI backend).
- litellm 1.84.x, openai 2.33.x, anthropic[vertex] (OpenHands).
- Node 22.x, pnpm 9.x (OpenClaw + this monorepo).
These pins inform the per-service lockfiles; do not mix incompatible majors across services.
