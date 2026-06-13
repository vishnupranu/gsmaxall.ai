"""GSMAXALL — agents service.

OpenHands runtime: autonomous coding, terminal, sandbox (privileged)
This service provides the Developer OS and Terminal OS capabilities.
"""
from __future__ import annotations

import asyncio
import os
from contextlib import asynccontextmanager
from datetime import datetime
from enum import Enum
from typing import Any
from uuid import uuid4

from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

SERVICE_NAME = "agents"
SERVICE_PORT = int(os.environ.get("PORT", "8081"))


class TaskStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    DONE = "done"
    FAILED = "failed"


# In-memory task store (in production, use Redis + Postgres)
TASKS: dict[str, dict[str, Any]] = {}


# =============================================================================
# Request/Response models
# =============================================================================

class TaskCreate(BaseModel):
    instruction: str
    repo_url: str | None = None
    branch: str = "main"


class TaskResponse(BaseModel):
    id: str
    instruction: str
    status: TaskStatus
    result: str | None
    created_at: str


class AgentResponse(BaseModel):
    id: str
    name: str
    status: str
    capabilities: list[str]


# =============================================================================
# Lifecycle
# =============================================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize the agents service."""
    # Start background task cleanup
    asyncio.create_task(_cleanup_stale_tasks())
    yield


app = FastAPI(title=f"GSMAXALL {SERVICE_NAME}", version="0.1.0", lifespan=lifespan)


# =============================================================================
# Endpoints
# =============================================================================

@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": SERVICE_NAME}


@app.get("/")
def info() -> dict[str, str]:
    return {
        "service": SERVICE_NAME,
        "description": "OpenHands runtime: autonomous coding, terminal, sandbox",
        "status": "ready",
    }


@app.get("/v1/agents", response_model=dict[str, list[AgentResponse]])
def list_agents() -> dict[str, list[AgentResponse]]:
    """List available agents."""
    agents = [
        AgentResponse(
            id="developer",
            name="Developer Agent",
            status="ready",
            capabilities=["code", "terminal", "repo", "plan", "test", "debug"],
        ),
        AgentResponse(
            id="researcher",
            name="Research Agent", 
            status="ready",
            capabilities=["search", "browse", "synthesize", "cite"],
        ),
    ]
    return {"agents": agents}


@app.post("/v1/tasks", response_model=TaskResponse)
async def create_task(req: TaskCreate) -> TaskResponse:
    """Create a new agent task."""
    task_id = str(uuid4())[:8]
    task = {
        "id": task_id,
        "instruction": req.instruction,
        "repo_url": req.repo_url,
        "branch": req.branch,
        "status": TaskStatus.PENDING.value,
        "result": None,
        "created_at": datetime.utcnow().isoformat(),
    }
    TASKS[task_id] = task
    
    # Start task execution in background
    asyncio.create_task(_execute_task(task_id, req.instruction, req.repo_url, req.branch))
    
    return TaskResponse(**task)


@app.get("/v1/tasks/{task_id}", response_model=TaskResponse)
def get_task(task_id: str) -> TaskResponse:
    """Get task status and result."""
    if task_id not in TASKS:
        raise HTTPException(status_code=404, detail="Task not found")
    return TaskResponse(**TASKS[task_id])


@app.get("/v1/tasks", response_model=dict[str, list[TaskResponse]])
def list_tasks() -> dict[str, list[TaskResponse]]:
    """List all tasks."""
    return {"tasks": [TaskResponse(**t) for t in TASKS.values()]}


@app.delete("/v1/tasks/{task_id}")
def delete_task(task_id: str) -> dict[str, str]:
    """Delete a task."""
    if task_id not in TASKS:
        raise HTTPException(status_code=404, detail="Task not found")
    del TASKS[task_id]
    return {"status": "deleted"}


# =============================================================================
# Background execution (simplified OpenHands simulation)
# =============================================================================

async def _execute_task(task_id: str, instruction: str, repo_url: str | None, branch: str) -> None:
    """Execute an agent task. In production, this integrates with OpenHands SDK."""
    if task_id not in TASKS:
        return
    
    TASKS[task_id]["status"] = TaskStatus.RUNNING.value
    
    try:
        # Simulate task execution with streaming output
        # In production, this would call the OpenHands SDK
        await asyncio.sleep(0.5)  # Simulate initialization
        
        steps = [
            f"📋 Planning: {instruction[:50]}...",
            "🔍 Analyzing requirements...",
            "📝 Implementing changes...",
            "🧪 Running tests...",
            "✅ Task completed successfully",
        ]
        
        result_parts = []
        for step in steps:
            await asyncio.sleep(0.3)
            result_parts.append(step)
            TASKS[task_id]["result"] = "\n".join(result_parts)
        
        TASKS[task_id]["status"] = TaskStatus.DONE.value
        
    except Exception as e:
        TASKS[task_id]["status"] = TaskStatus.FAILED.value
        TASKS[task_id]["result"] = f"Error: {str(e)}"


async def _cleanup_stale_tasks() -> None:
    """Periodic cleanup of stale tasks."""
    while True:
        await asyncio.sleep(300)  # Every 5 minutes
        # Remove tasks older than 1 hour
        cutoff = datetime.utcnow().timestamp() - 3600
        stale = [
            tid for tid, t in TASKS.items()
            if datetime.fromisoformat(t["created_at"]).timestamp() < cutoff
        ]
        for tid in stale:
            del TASKS[tid]
