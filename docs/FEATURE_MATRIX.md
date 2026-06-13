# GSMAXALL — FEATURE MATRIX

Maps each GSMAXALL OS module to the source(s) that provide it and the build status in this repo.

Legend — **Source:** O=Open WebUI, H=OpenHands, C=OpenClaw, N=New build.
**Status:** `scaffolded` = directory + stub present in this PR · `partial` = working slice ·
`done` = production-ready · `planned` = not yet started.

## Module → source map

| # | GSMAXALL Module | Primary source | Capabilities pulled in | Target location | Status |
|---|-----------------|----------------|------------------------|-----------------|--------|
| 1 | **AI Chat OS** | O | Chat UI, conversations, model select, streaming | `apps/web` | partial |
| 2 | **Knowledge OS** | O | Knowledge bases, doc upload, citations | `apps/web`, `services/rag` | scaffolded |
| 3 | **Memory OS** | C, N | Long-term/semantic memory, recall (Qdrant) | `services/memory` | scaffolded |
| 4 | **Agent OS** | C | Agent coordination, ACP, tool registry | `services/orchestrator` | scaffolded |
| 5 | **Developer OS** | H | Autonomous coding, repo manager, planning | `services/agents` | scaffolded |
| 6 | **IDE OS** | H, N | Code editor surface, file tree, diffs | `apps/web` | planned |
| 7 | **Terminal OS** | H, C | Sandboxed terminal, command exec | `services/agents` | scaffolded |
| 8 | **Workflow OS** | N | Visual workflows, triggers, scheduling | `services/workflows` | scaffolded |
| 9 | **Builder OS** | N | App/site builder (Lovable/Bolt-style) | `apps/web`, `services/agents` | planned |
| 10 | **Research OS** | N, C | Deep research, web search, synthesis | `services/research`, `services/search` | scaffolded |
| 11 | **Content OS** | N | Writing/content generation | `apps/web` | planned |
| 12 | **Media OS** | C | Image/audio generation + understanding | `services/media` | scaffolded |
| 13 | **Business OS** | N | Billing, orgs, usage metering | `services/admin` | scaffolded |
| 14 | **Marketplace OS** | C | Plugin/agent marketplace (plugin-sdk) | `services/admin`, `packages/sdk` | planned |
| 15 | **Enterprise OS** | O, N | RBAC, audit logs, SSO, admin console | `services/admin` | scaffolded |

## Platform capabilities (cross-module)

| Capability | Source | Target | Status |
|------------|--------|--------|--------|
| Unified auth | N (Supabase) | `packages/sdk`, `apps/web` | planned |
| Unified user/org model | N | `infrastructure/db` | scaffolded (schema) |
| API gateway | C (gateway pattern) + N | `services/orchestrator` | planned |
| Postgres database | N (merged) | `infrastructure/db` | scaffolded (schema) |
| Vector memory (Qdrant) | C + N | `services/memory` | scaffolded |
| AI provider router | H (litellm) / C (llm-core) | `packages/sdk` + `services/*` | partial (TS adapter contract) |
| Agent registry | C | `services/orchestrator` | planned |
| Billing layer | N | `services/admin` | planned |
| Design system / branding | N (+ O patterns) | `packages/ui` | partial |
| Dark / light mode | N (+ O) | `apps/web`, `packages/ui` | partial |

## Feature parity checklist (Chat OS — flagship first module)

- [x] App shell with GSMAXALL branding (logo, name)
- [x] Dark / light mode toggle
- [x] Conversation layout (sidebar + thread)
- [ ] Streaming responses from provider router
- [ ] Model selector wired to provider catalog
- [ ] File upload + attachment rendering
- [ ] Persisted conversations (Postgres)
- [ ] Auth-gated access (Supabase)
