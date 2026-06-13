# GSMAXALL — `memory` service

Qdrant-backed long-term and semantic memory

## Run locally
```bash
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8082
# health: http://localhost:8082/health
```
