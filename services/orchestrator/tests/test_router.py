import os

from app.router import chat, resolve


def test_resolve_splits_provider_and_model():
    r = resolve("anthropic/claude-3-5-sonnet")
    assert r.provider == "anthropic"
    assert r.model == "claude-3-5-sonnet"
    assert r.env_key == "ANTHROPIC_API_KEY"


def test_resolve_defaults_to_openai():
    r = resolve("gpt-4o-mini")
    assert r.provider == "openai"
    assert r.model == "gpt-4o-mini"


def test_chat_demo_mode_without_key(monkeypatch):
    for key in ("OPENAI_API_KEY", "ANTHROPIC_API_KEY"):
        monkeypatch.delenv(key, raising=False)
    out = chat("openai/gpt-4o-mini", [{"role": "user", "content": "hello world"}])
    assert out["mode"] == "demo"
    assert "hello world" in out["content"]
    assert out["provider"] == "openai"


def test_resolve_reports_configured(monkeypatch):
    monkeypatch.setenv("DEEPSEEK_API_KEY", "sk-test")
    assert resolve("deepseek/deepseek-chat").configured is True
