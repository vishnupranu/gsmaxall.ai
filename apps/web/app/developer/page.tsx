"use client";

import { useState } from "react";
import { ModulePage } from "../components/ModulePage";
import { PromptWorkspace } from "../components/PromptWorkspace";
import { PageHeader, Card, Button, Badge } from "@gsmaxall/ui";

export default function DeveloperPage() {
  const [tasks, setTasks] = useState<{ id: string; instruction: string; status: string; result?: string }[]>([]);
  const [running, setRunning] = useState(false);

  async function runTask(instruction: string) {
    setRunning(true);
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_AGENTS_URL || "/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instruction }),
      });
      const data = await res.json();
      setTasks((prev) => [data, ...prev]);
    } catch (err) {
      console.error(err);
    } finally {
      setRunning(false);
    }
  }

  return (
    <ModulePage>
      <PageHeader
        title="Developer OS"
        subtitle="Autonomous coding powered by the OpenHands runtime. Describe a task and the agent plans, edits the repo in a sandbox, and opens a PR."
      />
      
      {/* Agent Status */}
      <Card style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 16 }}>
        <Badge tone="green">● Agent Ready</Badge>
        <span style={{ color: "var(--gs-text-muted)", fontSize: 14 }}>
          Capabilities: code, terminal, repo, plan, test, debug
        </span>
      </Card>
      
      {/* Task History */}
      {tasks.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: 14, marginBottom: 8 }}>Recent Tasks</h3>
          {tasks.map((t) => (
            <Card key={t.id} style={{ marginBottom: 8, padding: "10px 14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <code style={{ fontSize: 13 }}>{t.instruction.slice(0, 60)}...</code>
                <Badge tone={t.status === "done" ? "green" : t.status === "running" ? "blue" : "neutral"}>
                  {t.status}
                </Badge>
              </div>
              {t.result && (
                <pre style={{ fontSize: 12, color: "var(--gs-text-muted)", marginTop: 8, overflow: "auto" }}>
                  {t.result}
                </pre>
              )}
            </Card>
          ))}
        </div>
      )}
      
      <PromptWorkspace
        runLabel={running ? "Running..." : "Plan task"}
        placeholder="e.g. Add a /healthz endpoint to the API and write a test for it"
        systemPrompt="You are GSMAXALL Developer OS, an autonomous software engineer. Given a task, produce a concise numbered execution plan (files to change, commands to run, tests to add), then a short summary. Be precise and practical."
        onRun={runTask}
        disabled={running}
      />
    </ModulePage>
  );
}
