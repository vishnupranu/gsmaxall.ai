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

## Deploy (Vercel)

The web app lives in `apps/web` inside a pnpm workspace. Deploy it as a Vercel project with the
**Root Directory** set to `apps/web` (Vercel auto-detects the monorepo and installs from the repo
root). `apps/web/vercel.json` pins the framework and install command. No env vars are required for
the public **demo mode**; set any provider key (e.g. `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`) in the
Vercel project to switch Chat/Research/Content/Builder/Developer OS to **live** model output.

```bash
# from repo root, with a Vercel token
vercel deploy --prod   # Root Directory = apps/web
```

## Status

Foundation + product surface: documentation, monorepo scaffold, unified schema, provider-router
contract, and a branded web app exposing **all 15 OS modules**. Chat OS streams via the unified
router with a demo fallback; Developer/Research/Content/Builder OS are prompt-driven; Knowledge,
Memory, Agent, Terminal, Workflow, Media OS are interactive; IDE/Business/Marketplace/Enterprise OS
render their product surfaces. See `docs/MASTER_BACKLOG.md` for the remaining epics (live RAG,
OpenHands sandbox runtime, Supabase auth, billing).
