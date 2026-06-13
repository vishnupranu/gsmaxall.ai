"""GSMAXALL — rag service.

Knowledge OS: document ingest, chunk, retrieve, cite. In-memory index for
demo/local runs; swap for Qdrant + provider embeddings when configured.
"""
from __future__ import annotations

import os

from fastapi import FastAPI
from pydantic import BaseModel

from .rag import RagIndex

SERVICE_NAME = "rag"
SERVICE_PORT = int(os.environ.get("PORT", "8083"))

app = FastAPI(title=f"GSMAXALL {SERVICE_NAME}", version="0.1.0")
index = RagIndex()

BACKEND = "qdrant" if os.environ.get("QDRANT_URL") else "in-memory"


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


@app.post("/v1/query")
def query(req: QueryRequest) -> dict:
    return index.answer(req.org_id, req.query, req.top_k)
