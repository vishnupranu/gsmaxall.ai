# GSMAXALL — MASTER BACKLOG

Sequenced, epic-level backlog to drive GSMAXALL from foundation to production. Each epic lists its
exit criteria. Status: `todo` / `in-progress` / `done`.

> **Progress note (live):** the app is deployed at https://gsmaxall.vercel.app with all 15 OS
> module surfaces. Where a backend (Supabase, Qdrant, OpenHands sandbox, Stripe) isn't yet
> connected, modules run in **demo/local mode** (localStorage persistence) and flip to live when
> the credential/service is configured. Items below marked `partial` are code-complete on the
> client with graceful fallback, pending their backend wiring.

## EPIC 0 — Foundation & Documentation  `done`
- [x] Audit sources; produce SYSTEM_AUDIT, FEATURE_MATRIX, GAP_ANALYSIS, DEPENDENCY_GRAPH,
      MERGE_MAP, TARGET_ARCHITECTURE, MASTER_BACKLOG.
- [x] Scaffold monorepo (apps/web, services/*, packages/*, infrastructure).
- [x] Unified Postgres schema migration (`0001_init.sql`).
- [x] Provider-router contract + base adapters in `packages/sdk`.
- [x] Local infra `docker-compose.yml` (Postgres, Qdrant, Redis).
- [x] Runnable web shell with GSMAXALL branding + dark/light mode.
- [x] CI pipeline (GitHub Actions: JS build/lint/typecheck + Python pytest) — `.github/workflows/ci.yml`.
- [x] One-shot pipeline script `scripts/gsmaxall.sh` (js | py | all).
- **Exit:** monorepo builds; web shell runs; docs merged.  *(done)*

## EPIC 1 — Identity & Tenancy  `partial`
- [x] Auth-gated app (sign-in screen) + session context (`app/lib/session.tsx`), Supabase-ready.
- [x] Orgs + membership + RBAC roles; org switcher in header (`OrgMenu`).
- [ ] Provision Supabase; swap demo identity for Supabase Auth (set NEXT_PUBLIC_SUPABASE_URL).
- [ ] JWT verification middleware shared across services.
- [ ] Audit log writer + viewer (UI surface exists in Enterprise OS).
- **Exit:** auth-gated app; org-scoped data; roles enforced.  *(demo identity live; Supabase pending B1)*

## EPIC 2 — Chat OS (flagship vertical)  `partial`
- [x] Multi-conversation chat with persistence (localStorage; sidebar, new/delete, auto-title).
- [x] Streaming chat via provider router with demo fallback (`/api/chat`).
- [x] Model selector from catalog (`/api/models`).
- [ ] Move persistence to Postgres (per-org/user) once DB provisioned.
- [ ] File upload + attachment rendering.
- **Exit:** end-to-end multi-provider chat with history.  *(live; real models pending B2, DB pending B1)*

## EPIC 3 — Memory & Knowledge OS  `partial`
- [x] Knowledge base UI (create KB, upload, list) + Memory search UI, persisted locally.
- [x] `services/memory` semantic CRUD + cosine search (in-memory vector store, org-scoped, tested).
- [x] `services/rag` ingest/chunk/embed/retrieve/cite (in-memory index, tested).
- [ ] Swap in-memory store for Qdrant + provider embeddings (set QDRANT_URL).
- **Exit:** chat can ground answers on uploaded docs with citations.  *(UI live; vector backend pending)*

## EPIC 4 — Developer OS  `todo`
- [ ] Integrate OpenHands SDK in `services/agents` (sandboxed).
- [ ] Repo manager (clone, branch, commit, PR).
- [ ] Planning + task executor surfaced in UI.
- [ ] Terminal OS surface (sandboxed shell).
- **Exit:** user issues a coding task; agent edits repo in sandbox and opens a PR.

## EPIC 5 — Agent OS / Orchestration  `partial`
- [x] Orchestrator as unified API gateway: `/v1/models`, `/v1/tools`, `/v1/agents`, `/v1/chat`.
- [x] Python provider router (resolve `provider/model`, demo fallback) with tests.
- [x] Agent registry + tool registry (MCP + ACP protocols represented).
- [ ] OpenClaw gateway-protocol + agent-core; tool-call-repair.
- [ ] Multi-agent collaboration runner.
- **Exit:** multiple agents coordinate on one task via shared tools.

## EPIC 6 — IDE OS  `todo`
- [ ] Code editor surface (Monaco/CodeMirror), file tree, diffs.
- [ ] Live link to `services/agents` workspace.
- **Exit:** in-browser editing synced with agent runtime.

## EPIC 7 — Workflow OS  `partial`
- [x] Workflow builder UI (trigger/action steps, add/remove) persisted locally.
- [x] `services/workflows` in-memory engine: create/list/run with a run log (tested).
- [ ] Persist to Postgres; Redis-backed scheduler + event triggers.
- **Exit:** user automates a multi-step task on a schedule/trigger.  *(builder + engine live; scheduler pending)*

## EPIC 8 — Builder OS  `todo`
- [ ] App/site generation flow (Lovable/Bolt-style) on agents runtime.
- [ ] Live preview + deploy.
- **Exit:** user generates and previews an app from a prompt.

## EPIC 9 — Research OS + Search  `partial`
- [x] Research/Content/Builder OS prompt surfaces wired to the provider router (demo fallback).
- [x] `services/search` keyword + vector facade over an in-memory corpus (tested).
- [x] `services/research` plan → gather → synthesize pipeline with citations (tested).
- [ ] Back search with a real web/vector provider; synthesize via provider router in live mode.
- **Exit:** user runs a deep-research query and gets a sourced report.  *(pipeline live; real sources pending)*

## EPIC 10 — Content & Media OS  `todo`
- [ ] Content generation surfaces in UI.
- [ ] `services/media` image/audio generation + understanding.
- **Exit:** user generates media and content within the platform.

## EPIC 11 — Business / Enterprise / Marketplace OS  `todo`
- [ ] Billing + usage metering; plans/quotas.
- [ ] Admin console (users, orgs, settings, SSO).
- [ ] Plugin/agent marketplace (plugin-sdk).
- **Exit:** orgs can subscribe, manage members, install marketplace plugins.

## EPIC 12 — Hardening & Launch  `partial`
- [x] CI/CD (GitHub Actions) + full-stack `docker-compose.full.yml` (web-less; all services + infra).
- [ ] Observability (OpenTelemetry), rate limits, quotas.
- [ ] Security review (authz, sandbox isolation, secrets).
- [ ] Load/perf testing; CI/CD; production deploy.
- **Exit:** GSMAXALL deploys and runs in production.

---

### Immediate next actions (post-foundation PR)
1. Provision Supabase + at least one LLM provider key (blockers B1/B2).
2. Confirm decisions G1 (React-canonical UI) and G6 (OpenClaw scope) — blocker B4.
3. Start EPIC 1 (identity) then EPIC 2 (Chat OS end-to-end vertical).
