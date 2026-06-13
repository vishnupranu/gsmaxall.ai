"""Lightweight deterministic embeddings.

When EMBEDDINGS_PROVIDER is configured the service should call the provider
router for real embeddings. Until then this hashed bag-of-words embedding gives
a dependency-free, deterministic vector so semantic search is exercisable.
"""
from __future__ import annotations

import hashlib
import math
import re

EMBED_DIM = 256

_token_re = re.compile(r"[a-z0-9]+")


def _stable_hash(token: str) -> int:
    digest = hashlib.md5(token.encode("utf-8")).digest()
    return int.from_bytes(digest[:4], "big")


def embed(text: str, dim: int = EMBED_DIM) -> list[float]:
    vec = [0.0] * dim
    tokens = _token_re.findall(text.lower())
    for tok in tokens:
        h = _stable_hash(tok) % dim
        vec[h] += 1.0
    norm = math.sqrt(sum(v * v for v in vec))
    if norm == 0:
        return vec
    return [v / norm for v in vec]


def cosine(a: list[float], b: list[float]) -> float:
    return sum(x * y for x, y in zip(a, b))
