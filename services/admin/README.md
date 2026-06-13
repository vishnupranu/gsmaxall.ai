# GSMAXALL — `admin` service

Orgs, billing, RBAC, audit, marketplace

## Run locally
```bash
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8088
# health: http://localhost:8088/health
```
