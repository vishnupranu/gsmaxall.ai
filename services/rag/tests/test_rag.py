from app.rag import RagIndex, chunk_text


def test_chunk_text_splits_and_overlaps():
    text = " ".join(f"w{i}" for i in range(1000))
    chunks = chunk_text(text, size=400, overlap=40)
    assert len(chunks) >= 2
    assert all(chunks)


def test_chunk_text_empty():
    assert chunk_text("") == []


def test_ingest_then_query_returns_citations():
    index = RagIndex()
    out = index.ingest("org", "handbook.md", "GSMAXALL deploys to Vercel using a pnpm monorepo.")
    assert out["chunks"] >= 1
    result = index.answer("org", "how does GSMAXALL use Vercel and pnpm?", top_k=3)
    assert result["citations"]
    assert result["citations"][0]["source"] == "handbook.md"


def test_query_without_documents():
    index = RagIndex()
    result = index.answer("org", "anything", top_k=3)
    assert result["citations"] == []


def test_retrieval_is_org_scoped():
    index = RagIndex()
    index.ingest("org_a", "a.md", "private alpha content about rockets")
    assert index.retrieve("org_b", "rockets", top_k=5) == []
