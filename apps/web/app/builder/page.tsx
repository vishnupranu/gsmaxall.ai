"use client";

import { useState } from "react";
import { ModulePage } from "../components/ModulePage";
import { PromptWorkspace } from "../components/PromptWorkspace";
import { PageHeader, Card, Button, Badge } from "@gsmaxall/ui";

const PROJECT_TYPES = [
  { id: "web", label: "Web App", icon: "🌐", desc: "React/Next.js application" },
  { id: "landing", label: "Landing Page", icon: "🚀", desc: "Marketing page" },
  { id: "api", label: "API Service", icon: "⚡", desc: "Backend REST API" },
  { id: "mobile", label: "Mobile App", icon: "📱", desc: "React Native app" },
  { id: "cli", label: "CLI Tool", icon: "💻", desc: "Command-line tool" },
  { id: "bot", label: "AI Bot", icon: "🤖", desc: "Chatbot/agent" },
];

const RECENT_BUILDS = [
  { name: "SaaS Landing Page", framework: "Next.js", status: "complete" },
  { name: "API Documentation", framework: "OpenAPI", status: "complete" },
  { name: "Dashboard Prototype", framework: "React", status: "building" },
];

export default function BuilderPage() {
  const [selectedType, setSelectedType] = useState<string | null>(null);

  return (
    <ModulePage>
      <PageHeader
        title="Builder OS"
        subtitle="Generate full applications from prompts. Describe what you want and get production-ready code."
      />

      {/* Project Types */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ marginBottom: 12, color: "var(--gs-text-muted)", fontSize: 14, fontWeight: 600 }}>
          Project Type
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
          {PROJECT_TYPES.map((type) => (
            <div
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              style={{
                padding: 16,
                borderRadius: 8,
                border: selectedType === type.id ? "2px solid #6366f1" : "1px solid var(--gs-border)",
                background: selectedType === type.id ? "var(--gs-bg)" : "transparent",
                cursor: "pointer",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 8 }}>{type.icon}</div>
              <div style={{ fontWeight: 500, fontSize: 13 }}>{type.label}</div>
              <div style={{ fontSize: 11, color: "var(--gs-text-muted)" }}>{type.desc}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Builds */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ marginBottom: 12, color: "var(--gs-text-muted)", fontSize: 14, fontWeight: 600 }}>
          Recent Builds
        </div>
        <div style={{ display: "grid", gap: 8 }}>
          {RECENT_BUILDS.map((build, i) => (
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
                <div style={{ fontWeight: 500 }}>{build.name}</div>
                <Badge tone="blue">{build.framework}</Badge>
              </div>
              <Badge tone={build.status === "complete" ? "green" : "yellow"}>
                {build.status}
              </Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* Builder Prompt */}
      <PromptWorkspace
        runLabel="Build"
        placeholder="e.g. A landing page for a SaaS product with hero, pricing, and a contact form"
        systemPrompt="You are GSMAXALL Builder OS. Given a product idea, output: 1) Recommended tech stack, 2) File/folder structure, 3) Key starter components as code blocks. Make it runnable and production-ready."
      />

      {/* Build Options */}
      <Card style={{ marginTop: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <Badge tone="blue">Next.js</Badge>
          <Badge tone="blue">React</Badge>
          <Badge tone="blue">Tailwind</Badge>
          <Badge tone="blue">TypeScript</Badge>
          <span style={{ marginLeft: "auto", color: "var(--gs-text-muted)", fontSize: 13 }}>
            Deploy-ready
          </span>
        </div>
      </Card>
    </ModulePage>
  );
}
