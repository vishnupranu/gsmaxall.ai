"""GSMAXALL — search service.

Web and vector search facade. In-memory index for demo/local runs; swap for a
real web/vector backend when configured.
"""
from __future__ import annotations

import os

from fastapi import FastAPI
from pydantic import BaseModel

from .index import SearchIndex

SERVICE_NAME = "search"
SERVICE_PORT = int(os.environ.get("PORT", "8085"))

app = FastAPI(title=f"GSMAXALL {SERVICE_NAME}", version="0.1.0")
index = SearchIndex()

# Seed corpus so the facade returns results out of the box.
for _title, _text, _url in [
    ("GSMAXALL overview", "GSMAXALL is one unified AI Operating System combining chat, agents, IDE, and workflows.", "/"),
    ("Provider router", "The unified provider router abstracts OpenAI, Anthropic, Gemini, OpenRouter, DeepSeek, Ollama.", "/settings"),
    ("Deploying GSMAXALL", "Deploy the apps/web Next.js app to Vercel; services run on a container host.", "/"),
]:
    index.add(_title, _text, _url)


class IndexRequest(BaseModel):
    title: str
    text: str
    url: str = ""


class QueryRequest(BaseModel):
    query: str
    top_k: int = 5


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": SERVICE_NAME}


@app.post("/v1/index")
def add_doc(req: IndexRequest) -> dict:
    doc = index.add(req.title, req.text, req.url)
    return {"id": doc.id, "title": doc.title}


@app.post("/v1/search")
def search(req: QueryRequest) -> dict:
    return {"results": [r.__dict__ for r in index.query(req.query, req.top_k)]}
