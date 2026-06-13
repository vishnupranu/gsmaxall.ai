"""RAG core: chunk, embed, retrieve, compose a cited answer.

Vector-DB backed (Qdrant when QDRANT_URL is set; in-memory otherwise — no SQL).
Embeddings are dependency-free deterministic hashed bag-of-words so retrieval is
exercisable without an embedding API; swap `embed` for the provider router when a
key is configured.
"""
from __future__ import annotations

import hashlib
import math
import os
import re
import uuid
from dataclasses import dataclass, field

EMBED_DIM = 256
_token_re = re.compile(r"[a-z0-9]+")
COLLECTION = os.environ.get("QDRANT_RAG_COLLECTION", "gsmaxall_rag")


def _stable_hash(token: str) -> int:
    return int.from_bytes(hashlib.md5(token.encode("utf-8")).digest()[:4], "big")


def embed(text: str, dim: int = EMBED_DIM) -> list[float]:
    vec = [0.0] * dim
    for tok in _token_re.findall(text.lower()):
        vec[_stable_hash(tok) % dim] += 1.0
    norm = math.sqrt(sum(v * v for v in vec))
    return [v / norm for v in vec] if norm else vec


def cosine(a: list[float], b: list[float]) -> float:
    return sum(x * y for x, y in zip(a, b))


def chunk_text(text: str, size: int = 400, overlap: int = 40) -> list[str]:
    words = text.split()
    if not words:
        return []
    chunks: list[str] = []
    step = max(1, size - overlap)
    for start in range(0, len(words), step):
        chunk = " ".join(words[start : start + size])
        if chunk:
            chunks.append(chunk)
        if start + size >= len(words):
            break
    return chunks


@dataclass
class Chunk:
    id: str
    org_id: str
    doc_id: str
    source: str
    text: str
    vector: list[float] = field(default_factory=list)


@dataclass
class Citation:
    chunk_id: str
    source: str
    score: float
    snippet: str


def _compose(citations: list[Citation]) -> dict:
    if not citations:
        return {
            "answer": "No indexed documents matched this query. Ingest documents first.",
            "citations": [],
        }
    context = "\n".join(f"[{i + 1}] {c.snippet}" for i, c in enumerate(citations))
    return {
        "answer": (
            f"Based on {len(citations)} retrieved passage(s):\n\n{context}\n\n"
            "(Live mode composes this context into a grounded answer via the provider router.)"
        ),
        "citations": [c.__dict__ for c in citations],
    }


class InMemoryRagIndex:
    backend = "in-memory"

    def __init__(self) -> None:
        self._chunks: list[Chunk] = []

    def ingest(self, org_id: str, source: str, text: str) -> dict:
        doc_id = f"doc_{uuid.uuid4().hex[:12]}"
        pieces = chunk_text(text)
        for piece in pieces:
            self._chunks.append(
                Chunk(
                    id=f"chk_{uuid.uuid4().hex[:12]}",
                    org_id=org_id,
                    doc_id=doc_id,
                    source=source,
                    text=piece,
                    vector=embed(piece),
                )
            )
        return {"doc_id": doc_id, "chunks": len(pieces)}

    def retrieve(self, org_id: str, query: str, top_k: int = 4) -> list[Citation]:
        qv = embed(query)
        scored = [(c, cosine(qv, c.vector)) for c in self._chunks if c.org_id == org_id]
        scored.sort(key=lambda x: x[1], reverse=True)
        return [
            Citation(chunk_id=c.id, source=c.source, score=round(s, 4), snippet=c.text[:240])
            for c, s in scored[:top_k]
            if s > 0
        ]

    def answer(self, org_id: str, query: str, top_k: int = 4) -> dict:
        return _compose(self.retrieve(org_id, query, top_k))


class QdrantRagIndex:
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

    def ingest(self, org_id: str, source: str, text: str) -> dict:
        from qdrant_client.models import PointStruct

        doc_id = f"doc_{uuid.uuid4().hex[:12]}"
        pieces = chunk_text(text)
        points = []
        for piece in pieces:
            chunk_id = f"chk_{uuid.uuid4().hex[:12]}"
            points.append(
                PointStruct(
                    id=str(uuid.uuid5(uuid.NAMESPACE_URL, chunk_id)),
                    vector=embed(piece),
                    payload={
                        "chunk_id": chunk_id,
                        "org_id": org_id,
                        "doc_id": doc_id,
                        "source": source,
                        "text": piece,
                    },
                )
            )
        if points:
            self.client.upsert(collection_name=self.collection, points=points)
        return {"doc_id": doc_id, "chunks": len(pieces)}

    def retrieve(self, org_id: str, query: str, top_k: int = 4) -> list[Citation]:
        from qdrant_client.models import FieldCondition, Filter, MatchValue

        hits = self.client.search(
            collection_name=self.collection,
            query_vector=embed(query),
            query_filter=Filter(must=[FieldCondition(key="org_id", match=MatchValue(value=org_id))]),
            limit=top_k,
            with_payload=True,
        )
        return [
            Citation(
                chunk_id=h.payload["chunk_id"],
                source=h.payload["source"],
                score=round(float(h.score), 4),
                snippet=h.payload["text"][:240],
            )
            for h in hits
            if h.score > 0
        ]

    def answer(self, org_id: str, query: str, top_k: int = 4) -> dict:
        return _compose(self.retrieve(org_id, query, top_k))


def get_index():
    url = os.environ.get("QDRANT_URL")
    if not url:
        return InMemoryRagIndex()
    try:
        return QdrantRagIndex(url, os.environ.get("QDRANT_API_KEY"))
    except Exception as exc:  # noqa: BLE001 — fall back so the service still boots
        print(f"[rag] Qdrant unavailable ({exc}); using in-memory index")
        return InMemoryRagIndex()


# Backwards-compatible alias used by existing tests.
RagIndex = InMemoryRagIndex
