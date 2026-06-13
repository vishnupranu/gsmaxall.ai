from app.store import VectorStore


def test_upsert_and_list_is_org_scoped():
    store = VectorStore()
    store.upsert("org_a", "the cat sat on the mat")
    store.upsert("org_b", "quantum entanglement physics")
    assert len(store.list("org_a")) == 1
    assert len(store.list("org_b")) == 1
    assert store.list("org_a")[0].content == "the cat sat on the mat"


def test_search_ranks_relevant_first():
    store = VectorStore()
    store.upsert("org", "deploying applications to vercel and netlify")
    store.upsert("org", "baking sourdough bread at home")
    hits = store.search("org", "how do I deploy to vercel", top_k=2)
    assert hits
    assert "vercel" in hits[0][0].content
    assert hits[0][1] > 0


def test_search_is_org_scoped():
    store = VectorStore()
    store.upsert("org_a", "secret org a document")
    hits = store.search("org_b", "secret document", top_k=5)
    assert hits == []


def test_delete():
    store = VectorStore()
    rec = store.upsert("org", "deletable")
    assert store.delete("org", rec.id) is True
    assert store.delete("org", rec.id) is False
    assert store.list("org") == []
