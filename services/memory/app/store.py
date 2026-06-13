"""Vector store with org scoping — Qdrant when configured, in-memory otherwise.

The data layer is a vector database, not a relational schema (no SQL). When
`QDRANT_URL` is set and reachable, records are stored/retrieved in Qdrant with an
`org_id` payload filter; otherwise an in-memory store provides an identical
interface so demo/CI runs need no external services.
"""
from __future__ import annotations

import os
import time
import uuid
from dataclasses import dataclass, field

from .embedding import EMBED_DIM, cosine, embed

COLLECTION = os.environ.get("QDRANT_MEMORY_COLLECTION", "gsmaxall_memory")


@dataclass
class MemoryRecord:
    id: str
    org_id: str
    content: str
    metadata: dict
    created_at: float
    vector: list[float] = field(default_factory=list)


class InMemoryVectorStore:
    backend = "in-memory"

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


class QdrantVectorStore:
    """Qdrant-backed store. Mirrors InMemoryVectorStore's interface."""

    backend = "qdrant"

    def __init__(self, url: str, api_key: str | None = None, collection: str = COLLECTION) -> None:
        from qdrant_client import QdrantClient
        from qdrant_client.models import Distance, VectorParams

        self.collection = collection
        self.client = QdrantClient(url=url, api_key=api_key, timeout=10.0)
        existing = {c.name for c in self.client.get_collections().collections}
        if collection not in existing:
            self.client.create_collection(
                collection_name=collection,
                vectors_config=VectorParams(size=EMBED_DIM, distance=Distance.COSINE),
            )

    @staticmethod
    def _point_id(rec_id: str) -> str:
        # Qdrant point IDs must be UUIDs or unsigned ints; derive a stable UUID.
        return str(uuid.uuid5(uuid.NAMESPACE_URL, rec_id))

    def upsert(self, org_id: str, content: str, metadata: dict | None = None, id: str | None = None) -> MemoryRecord:
        from qdrant_client.models import PointStruct

        rec_id = id or f"mem_{uuid.uuid4().hex[:12]}"
        created = time.time()
        payload = {
            "rec_id": rec_id,
            "org_id": org_id,
            "content": content,
            "metadata": metadata or {},
            "created_at": created,
        }
        self.client.upsert(
            collection_name=self.collection,
            points=[PointStruct(id=self._point_id(rec_id), vector=embed(content), payload=payload)],
        )
        return MemoryRecord(rec_id, org_id, content, metadata or {}, created)

    def _filter(self, org_id: str):
        from qdrant_client.models import FieldCondition, Filter, MatchValue

        return Filter(must=[FieldCondition(key="org_id", match=MatchValue(value=org_id))])

    def list(self, org_id: str) -> list[MemoryRecord]:
        points, _ = self.client.scroll(
            collection_name=self.collection,
            scroll_filter=self._filter(org_id),
            limit=1000,
            with_payload=True,
        )
        return [self._to_record(p.payload) for p in points]

    def delete(self, org_id: str, id: str) -> bool:
        existing = self.client.retrieve(self.collection, ids=[self._point_id(id)], with_payload=True)
        if not existing or existing[0].payload.get("org_id") != org_id:
            return False
        self.client.delete(collection_name=self.collection, points_selector=[self._point_id(id)])
        return True

    def search(self, org_id: str, query: str, top_k: int = 5) -> list[tuple[MemoryRecord, float]]:
        hits = self.client.search(
            collection_name=self.collection,
            query_vector=embed(query),
            query_filter=self._filter(org_id),
            limit=top_k,
            with_payload=True,
        )
        return [(self._to_record(h.payload), float(h.score)) for h in hits if h.score > 0]

    @staticmethod
    def _to_record(payload: dict) -> MemoryRecord:
        return MemoryRecord(
            id=payload["rec_id"],
            org_id=payload["org_id"],
            content=payload["content"],
            metadata=payload.get("metadata", {}),
            created_at=payload.get("created_at", 0.0),
        )


def get_store():
    """Return a Qdrant store when QDRANT_URL is reachable, else in-memory."""
    url = os.environ.get("QDRANT_URL")
    if not url:
        return InMemoryVectorStore()
    try:
        return QdrantVectorStore(url, os.environ.get("QDRANT_API_KEY"))
    except Exception as exc:  # noqa: BLE001 — fall back so the service still boots
        print(f"[memory] Qdrant unavailable ({exc}); using in-memory store")
        return InMemoryVectorStore()


# Backwards-compatible alias.
VectorStore = InMemoryVectorStore
