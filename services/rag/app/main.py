"""GSMAXALL — rag service.

Knowledge OS: document + tabular (Excel/CSV) ingest, chunk, retrieve, cite.
Vector-DB backed (Qdrant via QDRANT_URL; in-memory fallback). No SQL.
"""
from __future__ import annotations

import os

from fastapi import FastAPI, File, Form, UploadFile
from pydantic import BaseModel

from .rag import get_index
from .tabular import parse_tabular

SERVICE_NAME = "rag"
SERVICE_PORT = int(os.environ.get("PORT", "8083"))

app = FastAPI(title=f"GSMAXALL {SERVICE_NAME}", version="0.1.0")
index = get_index()
BACKEND = index.backend


class IngestRequest(BaseModel):
    org_id: str
    source: str
    text: str


class QueryRequest(BaseModel):
    org_id: str
    query: str
    top_k: int = 4


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": SERVICE_NAME, "backend": BACKEND}


@app.post("/v1/ingest")
def ingest(req: IngestRequest) -> dict:
    return index.ingest(req.org_id, req.source, req.text)


@app.post("/v1/ingest/file")
async def ingest_file(org_id: str = Form(...), file: UploadFile = File(...)) -> dict:
    """Ingest an Excel (.xlsx) or CSV file: each row is embedded as a chunk."""
    data = await file.read()
    rows = parse_tabular(file.filename or "upload", data)
    text = "\n".join(rows)
    result = index.ingest(org_id, file.filename or "upload", text)
    result["rows"] = len(rows)
    return result


@app.post("/v1/query")
def query(req: QueryRequest) -> dict:
    return index.answer(req.org_id, req.query, req.top_k)
