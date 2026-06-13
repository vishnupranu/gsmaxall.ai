"use client";

import { useState } from "react";
import { ModulePage } from "../components/ModulePage";
import { PromptWorkspace } from "../components/PromptWorkspace";
import { PageHeader, Card, Button, Badge } from "@gsmaxall/ui";

const RESEARCH_MODES = [
  { id: "deep", label: "Deep Dive", icon: "🔬", desc: "Comprehensive multi-source analysis" },
  { id: "quick", label: "Quick Facts", icon: "⚡", desc: "Fast summary with key points" },
  { id: "compare", label: "Compare", icon: "⚖️", desc: "Side-by-side comparison" },
  { id: "trend", label: "Trend Analysis", icon: "📈", desc: "Historical and future trends" },
];

const SAMPLE_RESULTS = [
  { title: "Vector Databases Comparison", sources: 12, status: "complete" },
  { title: "LLM Benchmark Analysis", sources: 8, status: "complete" },
  { title: "Agent Framework Survey", sources: 15, status: "complete" },
];

export default function ResearchPage() {
  const [activeMode, setActiveMode] = useState<string>("deep");

  return (
    <ModulePage>
      <PageHeader
        title="Research OS"
        subtitle="Deep, multi-step research with sourced synthesis. Powered by real-time web search and citation."
      />

      {/* Research Modes */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ marginBottom: 12, color: "var(--gs-text-muted)", fontSize: 14, fontWeight: 600 }}>
          Research Mode
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
          {RESEARCH_MODES.map((mode) => (
            <div
              key={mode.id}
              onClick={() => setActiveMode(mode.id)}
              style={{
                padding: 16,
                borderRadius: 8,
                border: activeMode === mode.id ? "2px solid #6366f1" : "1px solid var(--gs-border)",
                background: activeMode === mode.id ? "var(--gs-bg)" : "transparent",
                cursor: "pointer",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 8 }}>{mode.icon}</div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{mode.label}</div>
              <div style={{ fontSize: 12, color: "var(--gs-text-muted)" }}>{mode.desc}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Research */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ marginBottom: 12, color: "var(--gs-text-muted)", fontSize: 14, fontWeight: 600 }}>
          Recent Research
        </div>
        <div style={{ display: "grid", gap: 8 }}>
          {SAMPLE_RESULTS.map((result, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px",
                borderRadius: 8,
                background: "var(--gs-bg)",
              }}
            >
              <div>
                <div style={{ fontWeight: 500 }}>{result.title}</div>
                <div style={{ fontSize: 12, color: "var(--gs-text-muted)" }}>{result.sources} sources</div>
              </div>
              <Badge tone="green">Complete</Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* Research Prompt */}
      <PromptWorkspace
        runLabel="Research"
        placeholder="e.g. Compare vector databases for agent memory: Qdrant vs pgvector vs Milvus"
        systemPrompt="You are GSMAXALL Research OS. Produce a structured research brief: executive summary, key findings as bullet points, trade-offs, and source citations. Be objective, comprehensive, and cite your sources."
      />

      {/* Source Info */}
      <Card style={{ marginTop: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Badge tone="blue">Web Search</Badge>
          <Badge tone="blue">Citation</Badge>
          <Badge tone="blue">Real-time</Badge>
          <span style={{ marginLeft: "auto", color: "var(--gs-text-muted)", fontSize: 13 }}>
            Powered by Tavily API
          </span>
        </div>
      </Card>
    </ModulePage>
  );
}
