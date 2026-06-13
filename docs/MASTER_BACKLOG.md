# GSMAXALL — MASTER BACKLOG

Sequenced, epic-level backlog to drive GSMAXALL from foundation to production. Each epic lists its
exit criteria. Status: `todo` / `in-progress` / `done`.

## EPIC 0 — Foundation & Documentation  `in-progress`
- [x] Audit sources; produce SYSTEM_AUDIT, FEATURE_MATRIX, GAP_ANALYSIS, DEPENDENCY_GRAPH,
      MERGE_MAP, TARGET_ARCHITECTURE, MASTER_BACKLOG.
- [x] Scaffold monorepo (apps/web, services/*, packages/*, infrastructure).
- [x] Unified Postgres schema migration (`0001_init.sql`).
- [x] Provider-router contract + base adapters in `packages/sdk`.
- [x] Local infra `docker-compose.yml` (Postgres, Qdrant, Redis).
- [x] Runnable web shell with GSMAXALL branding + dark/light mode.
- [ ] CI pipeline (build/lint/typecheck per workspace).
- **Exit:** monorepo builds; web shell runs; docs merged.

## EPIC 1 — Identity & Tenancy  `todo`
- [ ] Provision Supabase; wire web auth (sign-in/up, session).
- [ ] JWT verification middleware shared across services.
- [ ] Orgs + membership + RBAC; org switcher in UI.
- [ ] Audit log writer + viewer.
- **Exit:** auth-gated app; org-scoped data; roles enforced.

## EPIC 2 — Chat OS (flagship vertical)  `todo`
- [ ] Conversation persistence (Postgres).
- [ ] Streaming chat via orchestrator → provider router.
- [ ] Model selector from catalog; per-provider keys.
- [ ] File upload + attachment rendering.
- **Exit:** end-to-end multi-provider chat with history.

## EPIC 3 — Memory & Knowledge OS  `todo`
- [ ] `services/memory` Qdrant CRUD + semantic search.
- [ ] `services/rag` ingest/chunk/embed/retrieve/cite.
- [ ] Knowledge base UI (create KB, upload, query).
- **Exit:** chat can ground answers on uploaded docs with citations.

## EPIC 4 — Developer OS  `todo`
- [ ] Integrate OpenHands SDK in `services/agents` (sandboxed).
- [ ] Repo manager (clone, branch, commit, PR).
- [ ] Planning + task executor surfaced in UI.
- [ ] Terminal OS surface (sandboxed shell).
- **Exit:** user issues a coding task; agent edits repo in sandbox and opens a PR.

## EPIC 5 — Agent OS / Orchestration  `todo`
- [ ] OpenClaw gateway-protocol + agent-core in orchestrator.
- [ ] Tool registry bridging MCP + ACP; tool-call-repair.
- [ ] Agent registry + capability discovery.
- [ ] Multi-agent collaboration runner.
- **Exit:** multiple agents coordinate on one task via shared tools.

## EPIC 6 — IDE OS  `todo`
- [ ] Code editor surface (Monaco/CodeMirror), file tree, diffs.
- [ ] Live link to `services/agents` workspace.
- **Exit:** in-browser editing synced with agent runtime.

## EPIC 7 — Workflow OS  `todo`
- [ ] Workflow model (nodes, edges, triggers) + schema.
- [ ] Scheduler + event triggers (Redis).
- [ ] Visual builder in UI.
- **Exit:** user automates a multi-step task on a schedule/trigger.

## EPIC 8 — Builder OS  `todo`
- [ ] App/site generation flow (Lovable/Bolt-style) on agents runtime.
- [ ] Live preview + deploy.
- **Exit:** user generates and previews an app from a prompt.

## EPIC 9 — Research OS + Search  `todo`
- [ ] `services/search` web/vector facade.
- [ ] `services/research` multi-step research + synthesis with citations.
- **Exit:** user runs a deep-research query and gets a sourced report.

## EPIC 10 — Content & Media OS  `todo`
- [ ] Content generation surfaces in UI.
- [ ] `services/media` image/audio generation + understanding.
- **Exit:** user generates media and content within the platform.

## EPIC 11 — Business / Enterprise / Marketplace OS  `todo`
- [ ] Billing + usage metering; plans/quotas.
- [ ] Admin console (users, orgs, settings, SSO).
- [ ] Plugin/agent marketplace (plugin-sdk).
- **Exit:** orgs can subscribe, manage members, install marketplace plugins.

## EPIC 12 — Hardening & Launch  `todo`
- [ ] Observability (OpenTelemetry), rate limits, quotas.
- [ ] Security review (authz, sandbox isolation, secrets).
- [ ] Load/perf testing; CI/CD; production deploy.
- **Exit:** GSMAXALL deploys and runs in production.

---

### Immediate next actions (post-foundation PR)
1. Provision Supabase + at least one LLM provider key (blockers B1/B2).
2. Confirm decisions G1 (React-canonical UI) and G6 (OpenClaw scope) — blocker B4.
3. Start EPIC 1 (identity) then EPIC 2 (Chat OS end-to-end vertical).
