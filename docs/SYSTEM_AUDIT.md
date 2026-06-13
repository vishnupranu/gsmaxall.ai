# GSMAXALL — SYSTEM AUDIT

> Audit of the four input systems that feed the unified GSMAXALL AI Operating System.
> Date: 2026-06-13. Status: living document.

## 0. Scope

This document audits the *current state* of each source system before any merge work.
It is descriptive (what exists today), not prescriptive (the target lives in
`TARGET_ARCHITECTURE.md`).

| System | Repo | Role in GSMAXALL | Primary stack |
|--------|------|------------------|---------------|
| Current GSMAXALL | `vishnupranu/gsmaxall.ai` | Destination monorepo | (empty — README only) |
| Open WebUI | `open-webui/open-webui` | Frontend / Chat OS foundation | SvelteKit + FastAPI (Python) |
| OpenHands | `All-Hands-AI/OpenHands` | Developer OS / agent runtime | Python + React (react-router) |
| OpenClaw | `openclaw/openclaw` | Agent OS / orchestration + gateway | TypeScript/Node (pnpm monorepo) |

---

## 1. Current GSMAXALL repository

- **State:** effectively empty. Single commit, one file (`README.md` containing only the title).
- **Implication:** GSMAXALL is a **greenfield monorepo**. There is no legacy code to preserve,
  so we are free to choose the canonical stack rather than inherit one.

---

## 2. Open WebUI

### 2.1 Topology
- **Frontend:** SvelteKit (`src/`), Tailwind, TipTap editor, CodeMirror, i18next.
  - `src/lib/components` — chat UI, conversation list, model selector, file upload, workspace,
    settings, admin panels.
  - `src/lib/apis` — typed client calls to the backend.
- **Backend:** FastAPI (`backend/open_webui/`), Python 3.11+.
  - SQLAlchemy 2.0 + Alembic + Peewee (dual ORM), SQLite default / Postgres optional (`psycopg`).
  - Auth: `python-jose` / `PyJWT` / `authlib` (OAuth/OIDC), `bcrypt` + `argon2`.
  - Realtime: `python-socketio`, `redis`, `pycrdt` (collaborative docs).
  - Vector DB abstraction (`VECTOR_DB` env): Chroma/Milvus/Qdrant/pgvector/etc.

### 2.2 Reusable capabilities (UX patterns)
Chat & conversation UI, multi-model selection, file/document upload, knowledge base (RAG over
docs), workspace concept, per-user preferences/settings, admin user management, OAuth login.

### 2.3 Audit notes / risks
- Frontend is **Svelte**, not React. Cannot be copy-pasted into a React `packages/ui`; it is a
  **UX reference** that we re-implement, not a drop-in.
- Dual ORM (SQLAlchemy + Peewee) is legacy debt; do not carry both forward.
- License: see `LICENSE` / `LICENSE_NOTICE` (branding-restricted variant of BSD-3) — relevant to
  re-branding; respect attribution requirements.

---

## 3. OpenHands

### 3.1 Topology
- **Backend:** Python (`openhands/` — `server`, `app_server`, `db`, `analytics`).
  - Depends on `openhands-sdk`, `openhands-tools`, `openhands-agent-server` (published packages).
  - **`litellm`** for LLM access → already a *unified provider router* (OpenAI/Anthropic/Gemini/
    Bedrock/Ollama/…).
  - `docker`, `kubernetes`, `libtmux`, `bashlex`, `jupyter-kernel-gateway` → sandboxed runtime,
    terminal ops, code execution.
  - `mcp` / `fastmcp` → Model Context Protocol tool integration.
  - `browsergym-core` + `playwright` → browser automation.
- **Frontend:** React (react-router) under `frontend/`.

### 3.2 Reusable capabilities
Autonomous coding agent loop, planning/task execution, repo manager (gitpython), sandboxed
runtime (Docker), terminal/Jupyter execution, MCP tool layer, browser agent.

### 3.3 Audit notes / risks
- Core agent logic is increasingly in **external SDK packages** (`openhands-sdk` etc.) rather than
  the repo — integration should consume those packages, not fork internals.
- Runtime requires **Docker-in-Docker / privileged sandboxing**; this is the heaviest infra
  dependency in the whole platform.
- Its React frontend duplicates much of Open WebUI's chat surface → a **merge conflict of UIs**.

---

## 4. OpenClaw

### 4.1 Topology
- **Type:** TypeScript/Node monorepo (`pnpm-workspace.yaml`, `packages/`, `apps/`, `src/`).
- **Self-description:** a *personal AI assistant* with a **Gateway** "control plane"; the assistant
  is the product. Multi-platform clients: `apps/android`, `apps/ios`, `apps/macos`.
- **Key packages (`packages/`):**
  - `agent-core`, `acp-core` (Agent Client Protocol), `gateway-protocol`, `gateway-client`
  - `llm-core`, `llm-runtime`, `model-catalog-core`, `tool-call-repair`
  - `memory-host-sdk`, `media-core`, `media-generation-core`, `media-understanding-common`
  - `speech-core`, `terminal-core`, `web-content-core`, `plugin-sdk`, `net-policy`
- **`src/`** contains the running assistant: `agents`, `gateway`, `flows`, `channels`, `chat`,
  `commands`, `context-engine`, `cron`, `daemon`, `tools`.

### 4.2 Reusable capabilities
Gateway/control-plane pattern, agent coordination, **tool execution + tool-call repair**, ACP
(agent ↔ client protocol), plugin SDK, model catalog, speech, media generation/understanding.

### 4.3 Audit notes / risks
- ⚠️ **Expectation mismatch:** the directive frames OpenClaw as a generic "Agent Orchestration
  Layer / multi-agent collaboration." It is actually a *single-user personal assistant + gateway*.
  Its **gateway-protocol / acp-core / agent-core / tool-call-repair / plugin-sdk** are the genuinely
  reusable orchestration primitives; the multi-platform native apps and channel integrations are
  out of scope for the unified web platform.
- Heavy native/mobile surface (`apps/{android,ios,macos}`) — **not** part of the GSMAXALL web OS.

---

## 5. Cross-cutting audit summary

| Concern | Open WebUI | OpenHands | OpenClaw |
|---------|-----------|-----------|----------|
| Language | Python + Svelte | Python + React | TypeScript/Node |
| LLM routing | own provider configs | **litellm** (unified) | `llm-core` / `model-catalog` |
| Auth | JWT + authlib OAuth | own server auth | gateway tokens |
| DB | SQLAlchemy/Peewee (SQLite/PG) | own `db` + asyncpg/pg8000 | local state |
| Vector/memory | pluggable vector DB | via tools/RAG | `memory-host-sdk` |
| Agent runtime | — | **Docker/k8s sandbox** | gateway daemon |
| Tooling protocol | — | **MCP** | **ACP** + plugin-sdk |
| UI | **best chat UX** | dev/agent UX | CLI + native apps |

### Top structural conflicts to resolve (detail in `GAP_ANALYSIS.md`)
1. **Three+ UIs** (Svelte, two React apps) → must converge to ONE web frontend.
2. **Three auth systems** → must converge to ONE (Supabase Auth, per directive).
3. **Three+ persistence layers** → must converge to ONE Postgres schema.
4. **Two tool protocols** (MCP vs ACP) → must be bridged behind one tool registry.
5. **Two LLM routers** (litellm vs llm-core) → standardize on one provider abstraction.
