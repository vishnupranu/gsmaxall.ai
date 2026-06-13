"""Unified provider router (Python side of the gateway).

Mirrors packages/sdk: resolves a `provider/model` id to a provider adapter and
produces a chat completion. Falls back to a deterministic demo response when no
provider API key is configured, so the gateway is always exercisable.
"""
from __future__ import annotations

import os
from dataclasses import dataclass

PROVIDER_ENV = {
    "openai": "OPENAI_API_KEY",
    "anthropic": "ANTHROPIC_API_KEY",
    "gemini": "GEMINI_API_KEY",
    "openrouter": "OPENROUTER_API_KEY",
    "deepseek": "DEEPSEEK_API_KEY",
    "qwen": "QWEN_API_KEY",
    "ollama": "OLLAMA_BASE_URL",
}


@dataclass
class Resolved:
    provider: str
    model: str
    env_key: str
    configured: bool


def resolve(model_id: str) -> Resolved:
    """Split a `provider/model` id and report whether its key is configured."""
    if "/" in model_id:
        provider, model = model_id.split("/", 1)
    else:
        provider, model = "openai", model_id
    env_key = PROVIDER_ENV.get(provider, "OPENAI_API_KEY")
    return Resolved(
        provider=provider,
        model=model,
        env_key=env_key,
        configured=bool(os.environ.get(env_key)),
    )


def demo_reply(model_id: str, prompt: str) -> str:
    return (
        "GSMAXALL demo mode — the orchestrator routed this request through the unified "
        f"provider router to `{model_id}`, but no provider key is configured so this is a "
        f'simulated reply.\n\nYou said: "{prompt[:280]}"\n\n'
        "Set the matching key (e.g. OPENAI_API_KEY) to return real model output."
    )


def chat(model_id: str, messages: list[dict]) -> dict:
    resolved = resolve(model_id)
    last_user = next((m["content"] for m in reversed(messages) if m.get("role") == "user"), "")
    if not resolved.configured:
        return {
            "mode": "demo",
            "provider": resolved.provider,
            "model": resolved.model,
            "content": demo_reply(model_id, last_user),
        }
    # Live path: call the provider's OpenAI-compatible / Anthropic endpoint.
    # Implemented behind the key check so demo runs need no network.
    raise NotImplementedError("live provider call wired when a key is present")
