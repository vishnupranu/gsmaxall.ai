"""Search facade: keyword + lightweight vector ranking over an in-memory corpus.

A stand-in for the web/vector search backends. Documents are indexed in memory
and ranked by a blend of token overlap and cosine similarity (hashed embeddings).
"""
from __future__ import annotations

import hashlib
import math
import re
import uuid
from dataclasses import dataclass, field

EMBED_DIM = 256
_token_re = re.compile(r"[a-z0-9]+")


def _tokens(text: str) -> list[str]:
    return _token_re.findall(text.lower())


def _stable_hash(token: str) -> int:
    return int.from_bytes(hashlib.md5(token.encode("utf-8")).digest()[:4], "big")


def embed(text: str, dim: int = EMBED_DIM) -> list[float]:
    vec = [0.0] * dim
    for tok in _tokens(text):
        vec[_stable_hash(tok) % dim] += 1.0
    norm = math.sqrt(sum(v * v for v in vec))
    return [v / norm for v in vec] if norm else vec


def cosine(a: list[float], b: list[float]) -> float:
    return sum(x * y for x, y in zip(a, b))


@dataclass
class Doc:
    id: str
    title: str
    text: str
    url: str
    vector: list[float] = field(default_factory=list)


@dataclass
class Result:
    id: str
    title: str
    url: str
    score: float
    snippet: str


class SearchIndex:
    def __init__(self) -> None:
        self._docs: list[Doc] = []

    def add(self, title: str, text: str, url: str = "") -> Doc:
        doc = Doc(id=f"doc_{uuid.uuid4().hex[:10]}", title=title, text=text, url=url, vector=embed(f"{title} {text}"))
        self._docs.append(doc)
        return doc

    def query(self, q: str, top_k: int = 5) -> list[Result]:
        qv = embed(q)
        q_tokens = set(_tokens(q))
        results: list[Result] = []
        for doc in self._docs:
            overlap = len(q_tokens & set(_tokens(f"{doc.title} {doc.text}")))
            score = cosine(qv, doc.vector) + 0.05 * overlap
            if score > 0:
                results.append(
                    Result(id=doc.id, title=doc.title, url=doc.url, score=round(score, 4), snippet=doc.text[:200])
                )
        results.sort(key=lambda r: r.score, reverse=True)
        return results[:top_k]
