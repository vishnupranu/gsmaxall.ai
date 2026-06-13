from app.index import SearchIndex


def test_query_ranks_relevant_doc_first():
    idx = SearchIndex()
    idx.add("Vercel deploys", "Deploy the Next.js app to Vercel for production.", "/deploy")
    idx.add("Cooking", "How to bake sourdough bread at home.", "/cook")
    results = idx.query("how to deploy to vercel", top_k=2)
    assert results
    assert results[0].title == "Vercel deploys"
    assert results[0].score > 0


def test_query_returns_empty_for_no_match():
    idx = SearchIndex()
    idx.add("Alpha", "totally unrelated content", "/a")
    assert idx.query("zzzzz qqqqq", top_k=5) == []


def test_top_k_limits_results():
    idx = SearchIndex()
    for i in range(10):
        idx.add(f"doc {i}", "shared keyword content here", f"/{i}")
    assert len(idx.query("shared keyword", top_k=3)) == 3
