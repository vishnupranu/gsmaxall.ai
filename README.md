# GSMAXALL

> One unified **AI Operating System** — ChatGPT · Claude · Cursor · OpenHands · Manus · Lovable ·
> Bolt · Replit · Open WebUI, consolidated into a single enterprise platform.

GSMAXALL is **not** several apps glued together. It is one platform with one identity, one
database, one UI, and one provider router. It is assembled from three open-source systems plus
net-new services:

| Source | Role |
|--------|------|
| [Open WebUI](https://github.com/open-webui/open-webui) | Frontend / Chat OS UX foundation |
| [OpenHands](https://github.com/All-Hands-AI/OpenHands) | Developer OS — autonomous coding & terminal |
| [OpenClaw](https://github.com/openclaw/openclaw) | Agent OS — gateway, ACP, tool execution |

## Documentation phase

Read these before touching code — they define the plan:

- [`docs/SYSTEM_AUDIT.md`](docs/SYSTEM_AUDIT.md) — what each source provides today
- [`docs/FEATURE_MATRIX.md`](docs/FEATURE_MATRIX.md) — module → source mapping + status
- [`docs/GAP_ANALYSIS.md`](docs/GAP_ANALYSIS.md) — conflicts + decisions + blockers
- [`docs/DEPENDENCY_GRAPH.md`](docs/DEPENDENCY_GRAPH.md) — runtime & build dependencies
- [`docs/MERGE_MAP.md`](docs/MERGE_MAP.md) — exact source → destination routing
- [`docs/TARGET_ARCHITECTURE.md`](docs/TARGET_ARCHITECTURE.md) — end-state design
- [`docs/MASTER_BACKLOG.md`](docs/MASTER_BACKLOG.md) — sequenced epics to production

## Monorepo layout

```
apps/web              Next.js — the single GSMAXALL UI
services/             orchestrator, agents, memory, rag, research, search,
                      workflows, media, admin, analytics  (FastAPI)
packages/             types, shared, ui, sdk  (TypeScript)
infrastructure/       docker-compose + unified Postgres schema
docs/                 documentation phase
```

## Quick start (local)

```bash
# 1. Prereqs: Node 20+, pnpm 9+, Python 3.11+, Docker.
cp .env.example .env            # fill in keys (see docs/GAP_ANALYSIS.md blockers)

# 2. Bring up Postgres + Qdrant + Redis
pnpm infra:up

# 3. Install JS deps and run the web app
pnpm install
pnpm --filter @gsmaxall/web dev  # http://localhost:3000

# 4. (optional) run a Python service
cd services/orchestrator && pip install -r requirements.txt && uvicorn app.main:app --reload
```

## Status

Foundation phase: documentation, monorepo scaffold, unified schema, provider-router contract,
branded web shell, and runnable service stubs. See `docs/MASTER_BACKLOG.md` for what's next.
