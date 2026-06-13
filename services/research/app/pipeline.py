"""Deep-research pipeline: plan -> gather -> synthesize.

Self-contained and deterministic so it runs without network or keys. When a
provider key is configured the `synthesize` step should call the provider router;
until then it composes a structured, sourced report from gathered passages.
"""
from __future__ import annotations

import os
import re
from dataclasses import dataclass

_PROVIDER_KEYS = ("OPENAI_API_KEY", "ANTHROPIC_API_KEY", "GEMINI_API_KEY", "OPENROUTER_API_KEY", "DEEPSEEK_API_KEY")


def live_mode() -> bool:
    return any(os.environ.get(k) for k in _PROVIDER_KEYS)


def plan(query: str, max_steps: int = 4) -> list[str]:
    """Decompose a question into focused sub-questions."""
    base = query.strip().rstrip("?")
    angles = [
        f"What is {base}?",
        f"Why does {base} matter?",
        f"How does {base} work in practice?",
        f"What are the risks or trade-offs of {base}?",
    ]
    return angles[:max_steps]


@dataclass
class Finding:
    question: str
    summary: str
    sources: list[str]


def gather(sub_questions: list[str], corpus: list[dict] | None = None) -> list[Finding]:
    corpus = corpus or []
    findings: list[Finding] = []
    for q in sub_questions:
        q_tokens = set(re.findall(r"[a-z0-9]+", q.lower()))
        ranked = sorted(
            corpus,
            key=lambda d: len(q_tokens & set(re.findall(r"[a-z0-9]+", f"{d.get('title','')} {d.get('text','')}".lower()))),
            reverse=True,
        )
        top = [d for d in ranked[:2]]
        summary = top[0]["text"][:200] if top else "No source matched; would query the web/vector search facade in live mode."
        sources = [d.get("url") or d.get("title", "") for d in top]
        findings.append(Finding(question=q, summary=summary, sources=sources))
    return findings


def synthesize(query: str, findings: list[Finding]) -> dict:
    sections = []
    citations: list[str] = []
    for i, f in enumerate(findings, start=1):
        cite = ", ".join(s for s in f.sources if s) or "no source"
        citations.extend(s for s in f.sources if s)
        sections.append(f"### {i}. {f.question}\n{f.summary}\n_Sources: {cite}_")
    body = "\n\n".join(sections)
    header = f"# Research report: {query}\n\n"
    note = (
        "\n\n_(Live mode composes these findings into a narrative answer via the provider router.)_"
        if not live_mode()
        else ""
    )
    return {
        "mode": "live" if live_mode() else "demo",
        "report": header + body + note,
        "citations": sorted(set(citations)),
        "steps": len(findings),
    }


def run(query: str, corpus: list[dict] | None = None, max_steps: int = 4) -> dict:
    sub_questions = plan(query, max_steps)
    findings = gather(sub_questions, corpus)
    result = synthesize(query, findings)
    result["plan"] = sub_questions
    return result
