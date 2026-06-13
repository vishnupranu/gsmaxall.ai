# GSMAXALL — `orchestrator` service

API gateway, agent registry, tool registry (MCP+ACP bridge)

## Run locally
```bash
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8080
# health: http://localhost:8080/health
```
