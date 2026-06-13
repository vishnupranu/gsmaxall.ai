"""GSMAXALL — workflows service.

Triggers, schedules, automations. In-memory engine for demo/local runs; swap to
Postgres + a Redis-backed scheduler when wired (MASTER_BACKLOG EPIC 7).
"""
from __future__ import annotations

import os

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from .engine import WorkflowEngine

SERVICE_NAME = "workflows"
SERVICE_PORT = int(os.environ.get("PORT", "8086"))

app = FastAPI(title=f"GSMAXALL {SERVICE_NAME}", version="0.1.0")
engine = WorkflowEngine()


class StepIn(BaseModel):
    type: str
    label: str


class CreateWorkflow(BaseModel):
    org_id: str
    name: str
    steps: list[StepIn]


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": SERVICE_NAME}


@app.post("/v1/workflows")
def create(req: CreateWorkflow) -> dict:
    wf = engine.create(req.org_id, req.name, [s.model_dump() for s in req.steps])
    return {"id": wf.id, "name": wf.name, "steps": [s.__dict__ for s in wf.steps]}


@app.get("/v1/workflows")
def list_workflows(org_id: str) -> dict:
    return {
        "workflows": [
            {"id": w.id, "name": w.name, "steps": [s.__dict__ for s in w.steps]}
            for w in engine.list(org_id)
        ]
    }


@app.post("/v1/workflows/{workflow_id}/run")
def run(workflow_id: str, org_id: str) -> dict:
    result = engine.run(org_id, workflow_id)
    if not result:
        raise HTTPException(status_code=404, detail="workflow not found")
    return {
        "run_id": result.id,
        "status": result.status,
        "steps": [s.__dict__ for s in result.steps],
    }
