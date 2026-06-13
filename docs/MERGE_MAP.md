# GSMAXALL — MERGE MAP

Exact source → destination routing for every reused subsystem. "Strategy" describes *how* the code
moves: **port** (re-implement in canonical stack), **adapt** (wrap/import with shims), **consume**
(use published package as-is), **drop** (explicitly excluded).

## Open WebUI  →  GSMAXALL

| Source (Open WebUI) | Destination | Strategy | Notes |
|---------------------|-------------|----------|-------|
| `src/lib/components/chat/*` | `apps/web` (chat routes) + `packages/ui` | **port** Svelte→React | UX reference for Chat OS |
| `src/lib/components/workspace/*` | `apps/web` (workspace) | **port** | folders, prompts, models |
| `src/lib/components/admin/*` | `apps/web` + `services/admin` | **port** | user mgmt → Enterprise OS |
| `src/lib/apis/*` | `packages/sdk` | **port** | typed clients → unified SDK |
| Knowledge base / RAG backend | `services/rag` | **adapt** | re-home doc ingest + retrieval |
| Auth (jose/authlib/OAuth) | — | **drop** | replaced by Supabase Auth (G2) |
| SQLAlchemy + Peewee models | `infrastructure/db` (merged schema) | **adapt** | single ORM, drop Peewee |
| Vector DB abstraction | `services/memory` | **drop/replace** | standardize on Qdrant |
| Branding assets (`static/`, logos) | — | **drop** | replaced by GSMAXALL branding |

## OpenHands  →  GSMAXALL

| Source (OpenHands) | Destination | Strategy | Notes |
|--------------------|-------------|----------|-------|
| `openhands-sdk`, `openhands-tools`, `openhands-agent-server` (pkgs) | `services/agents` | **consume** | use published packages, don't fork |
| Agent runtime / planning / executor | `services/agents` | **adapt** | Developer OS core |
| Docker/k8s sandbox runtime | `services/agents` (privileged pool) | **adapt** | only privileged component (G7) |
| Terminal / Jupyter exec (`libtmux`, kernel-gateway) | `services/agents` → Terminal OS | **adapt** | exposed via orchestrator |
| Repo manager (`gitpython`) | `services/agents` | **adapt** | projects/repositories tables |
| `litellm` provider access | `packages/sdk` (Py) provider router | **adapt** | canonical LLM router (G5) |
| MCP / `fastmcp` tool layer | `services/orchestrator` tool registry | **adapt** | bridged with ACP (G4) |
| `browsergym` + `playwright` browser agent | `services/agents` / `services/research` | **adapt** | web automation |
| React `frontend/` | — | **drop** | superseded by `apps/web` (G1) |
| `enterprise/` | `services/admin` | **adapt** | reference for RBAC/billing |

## OpenClaw  →  GSMAXALL

| Source (OpenClaw) | Destination | Strategy | Notes |
|-------------------|-------------|----------|-------|
| `packages/gateway-protocol`, `gateway-client` | `services/orchestrator` | **adapt** | API gateway / control plane |
| `packages/agent-core` | `services/orchestrator` | **adapt** | agent coordination |
| `packages/acp-core` (Agent Client Protocol) | `services/orchestrator` + `packages/types` | **adapt** | bridge to MCP |
| `packages/tool-call-repair` | `services/orchestrator` | **port/consume** | robust tool calling |
| `packages/llm-core`, `model-catalog-core` | `packages/sdk` | **adapt** | model catalog for router |
| `packages/memory-host-sdk` | `services/memory` | **adapt** | memory contracts |
| `packages/plugin-sdk`, `plugin-package-contract` | `packages/sdk` + `services/admin` | **adapt** | Marketplace OS |
| `packages/media-*`, `speech-core` | `services/media` | **adapt** | Media OS |
| `packages/terminal-core`, `web-content-core` | `services/agents`/`research` | **adapt** | terminal + web fetch |
| `apps/{android,ios,macos}` | — | **drop** | native clients out of scope (G6) |
| `src/channels/*` (Telegram, etc.) | — | **drop** | messaging channels out of scope |

## New services (no source — net new)

| Service | Built from | Notes |
|---------|-----------|-------|
| `services/memory` | Qdrant + OpenClaw memory contracts | Memory OS |
| `services/rag` | OWUI knowledge + memory | Knowledge OS |
| `services/research` | new + browser/search tools | Research OS |
| `services/workflows` | new | Workflow OS (triggers, schedules) |
| `services/media` | OpenClaw media/speech | Media OS |
| `services/admin` | OWUI admin + OH enterprise + new billing | Business/Enterprise OS |
| `services/search` | new | web/vector search facade |
| `services/analytics` | new | usage + event metering |

## Merge order (minimize breakage)
1. **Foundation** (this PR): monorepo, schema, provider-router contract, web shell, service stubs.
2. **Identity**: Supabase Auth in `apps/web` + JWT verification middleware in services.
3. **Chat OS**: wire `apps/web` chat → orchestrator → provider router (first end-to-end vertical).
4. **Knowledge/Memory**: `services/rag` + `services/memory` (Qdrant) + upload.
5. **Developer OS**: integrate OpenHands `services/agents` (sandbox) behind orchestrator.
6. **Agent OS**: OpenClaw gateway/ACP + tool registry + multi-agent.
7. Remaining OS modules (IDE, Workflow, Builder, Media, Research, Business, Marketplace).
