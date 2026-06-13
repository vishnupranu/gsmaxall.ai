# GSMAXALL — GAP ANALYSIS

What stands between the three source systems and ONE production GSMAXALL OS, with the decision
taken for each gap. Decisions marked **[DECISION]** are implemented/assumed by this scaffold and
can be overridden by the product owner.

## G1 — Frontend framework collision (HIGH)
- **Gap:** Open WebUI is **SvelteKit**; OpenHands ships a **React** app; there is no shared UI.
  A "single GSMAXALL UI" cannot be both Svelte and React.
- **[DECISION]** Canonical web app = **Next.js (React) App Router** in `apps/web`, shared
  components in `packages/ui` (React). Open WebUI is used as the **UX/interaction reference**; its
  Svelte components are re-implemented in React, not imported.
- **Cost:** re-implementation of chat/knowledge/workspace surfaces. **Risk:** UX drift from OWUI.

## G2 — Multiple authentication systems (HIGH)
- **Gap:** OWUI uses JWT+authlib OAuth; OpenHands has its own server auth; OpenClaw uses gateway
  tokens. Three identity models.
- **[DECISION]** Standardize on **Supabase Auth** (per directive). All services validate Supabase
  JWTs; `users` table is mirrored/extended in the unified Postgres. Legacy auth code is dropped.
- **Open items:** Supabase project + keys must be provisioned (see blockers). Service-to-service
  auth uses a separate internal token.

## G3 — Fragmented persistence (HIGH)
- **Gap:** OWUI (SQLAlchemy+Peewee, SQLite/PG), OpenHands (asyncpg/pg8000), OpenClaw (local state).
- **[DECISION]** ONE **PostgreSQL** instance; merged schema in `infrastructure/db/migrations`.
  Core tables per directive: users, organizations, agents, conversations, projects, repositories,
  files, workflows, tasks, memories, knowledge, audit_logs. Single ORM per service language
  (SQLAlchemy for Python services, a thin typed client for TS).

## G4 — Two tool protocols: MCP vs ACP (MEDIUM)
- **Gap:** OpenHands speaks **MCP**; OpenClaw speaks **ACP** + its own plugin SDK.
- **[DECISION]** `services/orchestrator` exposes ONE **tool registry** and bridges both: MCP
  servers and ACP/plugin tools are normalized to a common `Tool` contract (`packages/types`).

## G5 — Two LLM routers (MEDIUM)
- **Gap:** OpenHands uses **litellm**; OpenClaw uses **llm-core/model-catalog**.
- **[DECISION]** Unified **provider router** contract in `packages/sdk` (TS) and a Python
  equivalent backed by **litellm** in services. Providers required: OpenAI, Anthropic, Gemini,
  OpenRouter, Ollama, DeepSeek, Qwen, Llama. One `ProviderRouter.chat()` abstraction.

## G6 — OpenClaw scope mismatch (MEDIUM)
- **Gap:** Expected "multi-agent orchestration"; actual = single-user personal assistant + gateway.
- **[DECISION]** Adopt OpenClaw's **gateway-protocol, acp-core, agent-core, tool-call-repair,
  plugin-sdk, model-catalog** as orchestration primitives. **Drop** native mobile/desktop apps
  (`apps/{android,ios,macos}`) and channel integrations (Telegram, etc.) — out of scope for a web OS.
- True N-agent collaboration is **net-new** built on these primitives in `services/orchestrator`.

## G7 — Heavy sandboxed runtime (MEDIUM/INFRA)
- **Gap:** OpenHands needs Docker/k8s privileged sandboxing for code execution & terminal.
- **[DECISION]** Isolate this in `services/agents`; it is the only privileged component. Local dev
  uses Docker; production uses a dedicated runtime pool. Other services stay stateless/sandbox-free.

## G8 — Vector/memory backend (MEDIUM)
- **Gap:** OWUI pluggable vector DB; OpenClaw `memory-host-sdk`; OpenHands via tools.
- **[DECISION]** Standardize on **Qdrant** (per directive). `services/memory` is the single owner of
  embeddings + semantic recall; other services call it over HTTP.

## G9 — Branding & licensing (LOW/LEGAL)
- **Gap:** Open WebUI license restricts rebranding/attribution; assets must be replaced.
- **[DECISION]** GSMAXALL branding (logo `https://www.gsgroups.net/gslogo.png`), no generic admin
  templates. Because OWUI code is **re-implemented** (not copied), attribution risk is low, but
  preserve required notices for any retained snippets in `THIRD_PARTY_NOTICES`.

## G10 — Repo size / build matrix (LOW)
- **Gap:** Three large polyglot codebases → CI/build complexity.
- **[DECISION]** pnpm + Turborepo for JS/TS; per-service Python venvs (uv/poetry). Services build &
  test independently; `apps/web` is the only end-user build artifact for the UI.

---

## Blockers (require user input)
| ID | Blocker | Needed to unblock |
|----|---------|-------------------|
| B1 | Supabase project + URL + anon/service keys | provision Supabase, store as secrets |
| B2 | LLM provider API keys (OpenAI/Anthropic/…) | at least one key for live chat |
| B3 | Hosting target (Vercel for web? container host for services?) | deploy decision |
| B4 | Confirm OpenClaw scope reduction (G6) and React-canonical UI (G1) | product sign-off |
