"""RAG core: chunk, embed, retrieve, compose a cited answer.

Dependency-free deterministic embeddings (hashed bag-of-words) so retrieval is
exercisable without a vector DB or embedding API. Swap `embed` for the provider
router + Qdrant when QDRANT_URL / an embeddings provider is configured.
"""
from __future__ import annotations

import hashlib
import math
import re
import uuid
from dataclasses import dataclass, field

EMBED_DIM = 256
_token_re = re.compile(r"[a-z0-9]+")


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


class RagIndex:
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
        scored = [
            (c, cosine(qv, c.vector)) for c in self._chunks if c.org_id == org_id
        ]
        scored.sort(key=lambda x: x[1], reverse=True)
        return [
            Citation(chunk_id=c.id, source=c.source, score=round(s, 4), snippet=c.text[:240])
            for c, s in scored[:top_k]
            if s > 0
        ]

    def answer(self, org_id: str, query: str, top_k: int = 4) -> dict:
        citations = self.retrieve(org_id, query, top_k)
        if not citations:
            return {
                "answer": "No indexed documents matched this query. Ingest documents first.",
                "citations": [],
            }
        context = "\n".join(f"[{i + 1}] {c.snippet}" for i, c in enumerate(citations))
        answer = (
            f"Based on {len(citations)} retrieved passage(s):\n\n{context}\n\n"
            f"(Live mode composes this context into a grounded answer via the provider router.)"
        )
        return {
            "answer": answer,
            "citations": [c.__dict__ for c in citations],
        }
