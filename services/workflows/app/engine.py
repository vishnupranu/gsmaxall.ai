"""In-memory workflow engine.

A workflow is an ordered list of steps (one `trigger` + N `action`s). The engine
persists definitions in memory and executes them step-by-step, producing a run
log. Swap the store for Postgres and the executor for the Redis-backed scheduler
when those are wired (see MASTER_BACKLOG EPIC 7).
"""
from __future__ import annotations

import time
import uuid
from dataclasses import dataclass, field


@dataclass
class Step:
    id: str
    type: str  # "trigger" | "action"
    label: str


@dataclass
class Workflow:
    id: str
    org_id: str
    name: str
    steps: list[Step] = field(default_factory=list)


@dataclass
class RunStep:
    step_id: str
    label: str
    status: str
    detail: str


@dataclass
class Run:
    id: str
    workflow_id: str
    status: str
    steps: list[RunStep]
    started_at: float
    finished_at: float


class WorkflowEngine:
    def __init__(self) -> None:
        self._workflows: dict[str, Workflow] = {}
        self._runs: dict[str, Run] = {}

    def create(self, org_id: str, name: str, steps: list[dict]) -> Workflow:
        wf = Workflow(
            id=f"wf_{uuid.uuid4().hex[:12]}",
            org_id=org_id,
            name=name,
            steps=[
                Step(id=f"st_{uuid.uuid4().hex[:8]}", type=s["type"], label=s["label"])
                for s in steps
            ],
        )
        self._workflows[wf.id] = wf
        return wf

    def get(self, org_id: str, workflow_id: str) -> Workflow | None:
        wf = self._workflows.get(workflow_id)
        return wf if wf and wf.org_id == org_id else None

    def list(self, org_id: str) -> list[Workflow]:
        return [w for w in self._workflows.values() if w.org_id == org_id]

    def run(self, org_id: str, workflow_id: str) -> Run | None:
        wf = self.get(org_id, workflow_id)
        if not wf:
            return None
        started = time.time()
        run_steps: list[RunStep] = []
        for step in wf.steps:
            if step.type == "trigger":
                run_steps.append(RunStep(step.id, step.label, "fired", "trigger evaluated"))
            else:
                run_steps.append(RunStep(step.id, step.label, "completed", "action executed"))
        run = Run(
            id=f"run_{uuid.uuid4().hex[:12]}",
            workflow_id=wf.id,
            status="completed",
            steps=run_steps,
            started_at=started,
            finished_at=time.time(),
        )
        self._runs[run.id] = run
        return run
