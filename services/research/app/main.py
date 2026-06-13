"""GSMAXALL — research service.

Deep research orchestration: plan -> gather -> synthesize with citations.
Deterministic demo pipeline; uses the provider router in live mode.
"""
from __future__ import annotations

import os

from fastapi import FastAPI
from pydantic import BaseModel

from .pipeline import live_mode, run

SERVICE_NAME = "research"
SERVICE_PORT = int(os.environ.get("PORT", "8084"))

app = FastAPI(title=f"GSMAXALL {SERVICE_NAME}", version="0.1.0")


class Source(BaseModel):
    title: str = ""
    text: str = ""
    url: str = ""


class ResearchRequest(BaseModel):
    query: str
    corpus: list[Source] = []
    max_steps: int = 4


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": SERVICE_NAME, "mode": "live" if live_mode() else "demo"}


@app.post("/v1/research")
def research(req: ResearchRequest) -> dict:
    return run(req.query, [s.model_dump() for s in req.corpus], req.max_steps)
