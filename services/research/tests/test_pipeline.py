from app.pipeline import gather, plan, run

CORPUS = [
    {"title": "Vector DBs", "text": "A vector database stores embeddings for semantic search.", "url": "/vdb"},
    {"title": "RAG", "text": "Retrieval augmented generation grounds answers in retrieved documents.", "url": "/rag"},
]


def test_plan_produces_subquestions():
    steps = plan("vector databases", max_steps=4)
    assert len(steps) == 4
    assert all(s.endswith("?") for s in steps)


def test_plan_respects_max_steps():
    assert len(plan("topic", max_steps=2)) == 2


def test_gather_attaches_sources():
    findings = gather(["What is a vector database?"], CORPUS)
    assert findings
    assert findings[0].sources


def test_run_returns_report_and_citations(monkeypatch):
    for k in ("OPENAI_API_KEY", "ANTHROPIC_API_KEY"):
        monkeypatch.delenv(k, raising=False)
    result = run("vector databases", CORPUS, max_steps=3)
    assert result["mode"] == "demo"
    assert result["steps"] == 3
    assert "Research report" in result["report"]
    assert result["plan"]
