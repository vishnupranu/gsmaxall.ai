# GSMAXALL — `rag` service

Knowledge OS: document ingest, chunk, retrieve, cite

## Run locally
```bash
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8083
# health: http://localhost:8083/health
```
