"""In-memory vector store with org scoping.

A drop-in for Qdrant during demo/local runs. The public methods mirror the
intended Qdrant-backed implementation (upsert / search / delete / list) so the
swap is mechanical once QDRANT_URL is wired.
"""
from __future__ import annotations

import time
import uuid
from dataclasses import dataclass, field

from .embedding import cosine, embed


@dataclass
class MemoryRecord:
    id: str
    org_id: str
    content: str
    metadata: dict
    created_at: float
    vector: list[float] = field(default_factory=list)


class VectorStore:
    def __init__(self) -> None:
        self._records: dict[str, MemoryRecord] = {}

    def upsert(self, org_id: str, content: str, metadata: dict | None = None, id: str | None = None) -> MemoryRecord:
        rec_id = id or f"mem_{uuid.uuid4().hex[:12]}"
        rec = MemoryRecord(
            id=rec_id,
            org_id=org_id,
            content=content,
            metadata=metadata or {},
            created_at=time.time(),
            vector=embed(content),
        )
        self._records[rec_id] = rec
        return rec

    def list(self, org_id: str) -> list[MemoryRecord]:
        return [r for r in self._records.values() if r.org_id == org_id]

    def delete(self, org_id: str, id: str) -> bool:
        rec = self._records.get(id)
        if rec and rec.org_id == org_id:
            del self._records[id]
            return True
        return False

    def search(self, org_id: str, query: str, top_k: int = 5) -> list[tuple[MemoryRecord, float]]:
        qv = embed(query)
        scored = [
            (r, cosine(qv, r.vector))
            for r in self._records.values()
            if r.org_id == org_id
        ]
        scored.sort(key=lambda x: x[1], reverse=True)
        return [(r, s) for r, s in scored[:top_k] if s > 0]
