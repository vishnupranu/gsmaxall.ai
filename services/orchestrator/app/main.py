"""GSMAXALL — orchestrator service (control plane).

API gateway, agent registry, tool registry (MCP+ACP bridge).

This scaffold exposes the gateway's read surface: the unified model catalog, the
tool registry, and the agent registry. Authn/authz (Supabase JWT), request
routing to downstream services, and the MCP/ACP tool bridge are implemented in
EPIC 1/5 (see docs/MASTER_BACKLOG.md).
"""
from __future__ import annotations

import os

from fastapi import FastAPI
from pydantic import BaseModel

from .router import chat as route_chat

SERVICE_NAME = "orchestrator"
SERVICE_PORT = int(os.environ.get("PORT", "8080"))

app = FastAPI(title="GSMAXALL orchestrator", version="0.1.0")


class Model(BaseModel):
    id: str
    provider: str
    display_name: str
    context_window: int


class Tool(BaseModel):
    name: str
    description: str
    protocol: str  # "mcp" | "acp" | "native"


class Agent(BaseModel):
    id: str
    name: str
    source: str  # "openhands" | "openclaw" | "native"
    capabilities: list[str]


# Mirrors packages/sdk catalog; the live gateway merges provider `models()` calls.
MODEL_CATALOG: list[Model] = [
    Model(id="openai/gpt-4o", provider="openai", display_name="GPT-4o", context_window=128000),
    Model(id="anthropic/claude-3-5-sonnet", provider="anthropic", display_name="Claude 3.5 Sonnet", context_window=200000),
    Model(id="gemini/gemini-1.5-pro", provider="gemini", display_name="Gemini 1.5 Pro", context_window=1000000),
    Model(id="deepseek/deepseek-chat", provider="deepseek", display_name="DeepSeek Chat", context_window=64000),
    Model(id="ollama/llama3.1", provider="ollama", display_name="Llama 3.1 (local)", context_window=128000),
]

TOOL_REGISTRY: list[Tool] = [
    Tool(name="shell.exec", description="Run a command in the sandbox", protocol="native"),
    Tool(name="repo.edit", description="Edit files in a repository", protocol="acp"),
    Tool(name="web.fetch", description="Fetch and read a web page", protocol="mcp"),
]

AGENT_REGISTRY: list[Agent] = [
    Agent(id="developer", name="Developer Agent", source="openhands", capabilities=["code", "terminal", "repo"]),
    Agent(id="assistant", name="Assistant Agent", source="openclaw", capabilities=["chat", "tools", "memory"]),
]


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": SERVICE_NAME}


@app.get("/v1/models")
def list_models() -> dict[str, list[Model]]:
    return {"models": MODEL_CATALOG}


@app.get("/v1/tools")
def list_tools() -> dict[str, list[Tool]]:
    return {"tools": TOOL_REGISTRY}


@app.get("/v1/agents")
def list_agents() -> dict[str, list[Agent]]:
    return {"agents": AGENT_REGISTRY}


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    model: str
    messages: list[ChatMessage]


@app.post("/v1/chat")
def chat(req: ChatRequest) -> dict:
    """Unified gateway chat: resolves the model to a provider and returns a
    completion (demo fallback when no provider key is configured)."""
    return route_chat(req.model, [m.model_dump() for m in req.messages])
