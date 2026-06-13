"""GSMAXALL — memory service.

Long-term and semantic memory. Backed by an in-memory vector store for
demo/local runs; swap to Qdrant (QDRANT_URL) without changing this API.
"""
from __future__ import annotations

import os

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from .store import VectorStore

SERVICE_NAME = "memory"
SERVICE_PORT = int(os.environ.get("PORT", "8082"))

app = FastAPI(title=f"GSMAXALL {SERVICE_NAME}", version="0.1.0")
store = VectorStore()

BACKEND = "qdrant" if os.environ.get("QDRANT_URL") else "in-memory"


class UpsertRequest(BaseModel):
    org_id: str
    content: str
    metadata: dict = {}
    id: str | None = None


class SearchRequest(BaseModel):
    org_id: str
    query: str
    top_k: int = 5


class MemoryOut(BaseModel):
    id: str
    content: str
    metadata: dict
    created_at: float


class SearchHit(BaseModel):
    id: str
    content: str
    score: float
    metadata: dict


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": SERVICE_NAME, "backend": BACKEND}


@app.post("/v1/memories", response_model=MemoryOut)
def upsert(req: UpsertRequest) -> MemoryOut:
    rec = store.upsert(req.org_id, req.content, req.metadata, req.id)
    return MemoryOut(id=rec.id, content=rec.content, metadata=rec.metadata, created_at=rec.created_at)


@app.get("/v1/memories", response_model=list[MemoryOut])
def list_memories(org_id: str) -> list[MemoryOut]:
    return [
        MemoryOut(id=r.id, content=r.content, metadata=r.metadata, created_at=r.created_at)
        for r in store.list(org_id)
    ]


@app.post("/v1/memories/search", response_model=list[SearchHit])
def search(req: SearchRequest) -> list[SearchHit]:
    return [
        SearchHit(id=r.id, content=r.content, score=round(s, 4), metadata=r.metadata)
        for r, s in store.search(req.org_id, req.query, req.top_k)
    ]


@app.delete("/v1/memories/{memory_id}")
def delete(memory_id: str, org_id: str) -> dict[str, bool]:
    ok = store.delete(org_id, memory_id)
    if not ok:
        raise HTTPException(status_code=404, detail="not found")
    return {"deleted": True}
