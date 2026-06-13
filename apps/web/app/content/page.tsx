"use client";

import { useState } from "react";
import { ModulePage } from "../components/ModulePage";
import { PromptWorkspace } from "../components/PromptWorkspace";
import { PageHeader, Card, Button, Badge } from "@gsmaxall/ui";

const TEMPLATES = [
  { id: "blog", label: "Blog Post", icon: "📝", prompt: "Write a blog post about" },
  { id: "email", label: "Email", icon: "📧", prompt: "Write a professional email about" },
  { id: "social", label: "Social Post", icon: "📱", prompt: "Write a social media post about" },
  { id: "doc", label: "Documentation", icon: "📚", prompt: "Write technical documentation for" },
  { id: "copy", label: "Copywriting", icon: "✨", prompt: "Write marketing copy for" },
];

export default function ContentPage() {
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState("");

  function selectTemplate(template: typeof TEMPLATES[0]) {
    setActiveTemplate(template.id);
    setCustomPrompt(template.prompt + " ");
  }

  return (
    <ModulePage>
      <PageHeader
        title="Content OS"
        subtitle="Long-form writing and content generation powered by AI. Choose a template or write your own."
      />

      {/* Content Templates */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ marginBottom: 12, color: "var(--gs-text-muted)", fontSize: 14, fontWeight: 600 }}>
          Content Templates
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {TEMPLATES.map((t) => (
            <Button
              key={t.id}
              variant={activeTemplate === t.id ? "primary" : "ghost"}
              onClick={() => selectTemplate(t)}
            >
              {t.icon} {t.label}
            </Button>
          ))}
        </div>
      </Card>

      {/* Writing Assistant */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>AI Writing Assistant</span>
          <div style={{ display: "flex", gap: 8 }}>
            <Badge>GPT-4o</Badge>
            <Badge tone="green">Streaming</Badge>
          </div>
        </div>
        <textarea
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder="Describe what you want to write..."
          rows={3}
          style={{
            width: "100%",
            background: "var(--gs-bg)",
            color: "var(--gs-text)",
            border: "1px solid var(--gs-border)",
            borderRadius: 8,
            padding: 12,
            font: "inherit",
            resize: "vertical",
            marginBottom: 12,
          }}
        />
        <div style={{ display: "flex", gap: 8 }}>
          <Button>Generate Content</Button>
          <Button variant="ghost">Save Draft</Button>
          <Button variant="ghost">Copy to Clipboard</Button>
        </div>
      </Card>

      {/* Prompt Workspace */}
      <PromptWorkspace
        runLabel="Generate"
        placeholder="e.g. Write a launch announcement for GSMAXALL, the unified AI operating system"
        systemPrompt="You are GSMAXALL Content OS, an expert writer. Produce clear, engaging, well-structured content. Match the requested format and tone. Include appropriate headers, formatting, and call-to-actions where relevant."
      />
    </ModulePage>
  );
}
