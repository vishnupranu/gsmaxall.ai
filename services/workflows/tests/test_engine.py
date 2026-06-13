from app.engine import WorkflowEngine

STEPS = [
    {"type": "trigger", "label": "On schedule (daily 9am)"},
    {"type": "action", "label": "Run Research OS query"},
    {"type": "action", "label": "Email summary report"},
]


def test_create_and_list_is_org_scoped():
    engine = WorkflowEngine()
    engine.create("org_a", "Daily digest", STEPS)
    engine.create("org_b", "Other", STEPS)
    assert len(engine.list("org_a")) == 1
    assert engine.list("org_a")[0].name == "Daily digest"


def test_run_executes_all_steps():
    engine = WorkflowEngine()
    wf = engine.create("org", "Daily digest", STEPS)
    run = engine.run("org", wf.id)
    assert run is not None
    assert run.status == "completed"
    assert len(run.steps) == 3
    assert run.steps[0].status == "fired"
    assert run.steps[1].status == "completed"


def test_run_missing_workflow_returns_none():
    engine = WorkflowEngine()
    assert engine.run("org", "nope") is None


def test_run_is_org_scoped():
    engine = WorkflowEngine()
    wf = engine.create("org_a", "wf", STEPS)
    assert engine.run("org_b", wf.id) is None
