"""GSMAXALL — rag service.

Knowledge OS: document ingest, chunk, retrieve, cite

This is a runnable scaffold (health + service info). See docs/MASTER_BACKLOG.md
and docs/TARGET_ARCHITECTURE.md for the implementation plan.
"""
from __future__ import annotations

import os

from fastapi import FastAPI

SERVICE_NAME = "rag"
SERVICE_PORT = int(os.environ.get("PORT", "8083"))

app = FastAPI(title=f"GSMAXALL {SERVICE_NAME}", version="0.1.0")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": SERVICE_NAME}


@app.get("/")
def info() -> dict[str, str]:
    return {
        "service": SERVICE_NAME,
        "description": "Knowledge OS: document ingest, chunk, retrieve, cite",
        "status": "scaffolded",
    }
