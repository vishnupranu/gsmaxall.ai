# GSMAXALL — TARGET ARCHITECTURE

The end-state design for ONE unified GSMAXALL AI Operating System.

## 1. Principles
- **One platform, one identity, one database, one UI.** No isolated apps, no micro-frontends.
- **Polyglot services, single contracts.** Services may be Python or TS, but all speak the shared
  contracts in `packages/types` over HTTP (REST + SSE/WS).
- **Thin, stateless services + one privileged runtime.** Only `services/agents` is privileged
  (Docker sandbox). Everything else is horizontally scalable and stateless.
- **Provider-agnostic AI.** All model calls go through one provider router.

## 2. Monorepo layout
```
gsmaxall.ai/
  apps/
    web/                 # Next.js (App Router) — the single GSMAXALL UI (all 15 OS modules)
  services/
    orchestrator/        # API gateway, agent registry, tool registry (MCP+ACP bridge)
    agents/              # OpenHands runtime: coding, terminal, sandbox (privileged)
    memory/              # Qdrant-backed long-term/semantic memory
    rag/                 # Knowledge OS: ingest, chunk, retrieve, cite
    research/            # Deep research orchestration
    search/              # Web + vector search facade
    workflows/           # Triggers, schedules, automations
    media/               # Image/audio generation + understanding
    admin/               # Orgs, billing, RBAC, audit, marketplace
    analytics/           # Usage + event metering
  packages/
    types/               # Shared TS types / contracts (source of truth)
    shared/              # Shared utils, config, logging
    ui/                  # React design system + GSMAXALL branding
    sdk/                 # Provider router + typed service clients
  infrastructure/
    docker-compose.yml   # Local: postgres, qdrant, redis
    db/migrations/       # Unified SQL schema
  docs/                  # This documentation phase
```

## 3. Component responsibilities

### apps/web (Next.js)
Single UI surface for all OS modules. Server components for data fetching, client components for
interactive surfaces (chat stream, editor, terminal). Talks only to `services/orchestrator` and
Supabase Auth. Dark/light themable via `packages/ui` tokens.

### services/orchestrator (control plane)
- **API gateway:** single ingress for the web app; authn (verify Supabase JWT), authz (org/role),
  rate limiting, request routing to downstream services.
- **Agent registry:** registered agents + capabilities (from OpenClaw agent-core/ACP + OpenHands).
- **Tool registry:** normalizes MCP servers and ACP/plugin tools to one `Tool` contract; applies
  `tool-call-repair`.
- **Conversation/session routing:** streams model + tool events back to the UI (SSE/WS).

### services/agents (Developer/Terminal OS)
OpenHands SDK-based autonomous runtime: planning, code edit, repo ops (git), sandboxed shell &
Jupyter. The only Docker-privileged service. Exposes jobs/tasks to orchestrator.

### services/memory + services/rag (Memory/Knowledge OS)
`memory` owns Qdrant (embeddings, semantic recall, agent memory). `rag` owns document ingestion,
chunking, retrieval, and citation, using `memory` for vectors and provider router for embeddings.

### provider router (packages/sdk + Python equiv)
One interface: `chat()`, `embed()`, `models()`. Adapters: OpenAI, Anthropic, Gemini, OpenRouter,
Ollama, DeepSeek, Qwen, Llama. Python services back it with **litellm**; TS clients use SDK adapters.
Model catalog sourced from OpenClaw `model-catalog-core`.

### services/admin (Business/Enterprise/Marketplace OS)
Organizations, membership/roles (RBAC), billing & usage metering, audit logs, plugin marketplace
(OpenClaw plugin-sdk), SSO/admin console.

## 4. Identity & multi-tenancy
- **Supabase Auth** issues JWTs. Web app authenticates; every service verifies the JWT.
- **Org-scoped tenancy:** every core row carries `organization_id`. RBAC roles: `owner`, `admin`,
  `member`, `viewer`. Audit log records all privileged mutations.

## 5. Data architecture
- **PostgreSQL** = system of record (see `infrastructure/db/migrations/0001_init.sql`).
- **Qdrant** = vectors / semantic memory.
- **Redis** = cache, queues, pub/sub for streaming + workflow triggers.
- **Object storage** (S3-compatible) = files, media artifacts.

## 6. AI request lifecycle (Chat OS example)
```
user → apps/web → orchestrator (authn/authz, load conversation, gather context)
     → memory/rag (retrieve) → provider router (litellm) → stream tokens
     → tool calls? → orchestrator tool registry → services/agents | media | research
     → persist (conversations, messages, audit_logs) → stream back to UI
```

## 7. Deployment
- **Web:** Vercel (or container) — `apps/web`.
- **Services:** containerized (one image per service); orchestrator public, others private.
- **Stateful:** managed Postgres, managed/Qdrant Cloud, managed Redis, S3.
- **Agents runtime:** dedicated node pool with Docker; autoscaled separately.
- **Local dev:** `infrastructure/docker-compose.yml` brings up Postgres + Qdrant + Redis; each
  service + web run via the workspace task runner.

## 8. Non-functional targets
Observability (OpenTelemetry across services), per-org rate limits & quotas, secrets via env/secret
manager (never committed), graceful degradation when a provider/tool is unavailable.
