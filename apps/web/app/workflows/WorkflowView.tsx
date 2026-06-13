"use client";

import { useState } from "react";
import { Button, Card, Input, Badge } from "@gsmaxall/ui";
import { useLocalState } from "../lib/useLocalState";

interface Step {
  id: string;
  type: "trigger" | "action";
  label: string;
}

export function WorkflowView() {
  const [steps, setSteps] = useLocalState<Step[]>("gsmaxall.workflows.v1", [
    { id: "s1", type: "trigger", label: "On schedule (daily 9am)" },
    { id: "s2", type: "action", label: "Run Research OS query" },
    { id: "s3", type: "action", label: "Email summary report" },
  ]);
  const [label, setLabel] = useState("");

  function addStep() {
    const l = label.trim();
    if (!l) return;
    setSteps((prev) => [...prev, { id: `s${prev.length + 1}`, type: "action", label: l }]);
    setLabel("");
  }

  function remove(id: string) {
    setSteps((prev) => prev.filter((s) => s.id !== id));
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <Card>
        <div style={{ display: "flex", gap: 10 }}>
          <Input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Add an action step…"
            onKeyDown={(e) => e.key === "Enter" && addStep()}
          />
          <Button onClick={addStep}>Add step</Button>
        </div>
      </Card>
      <div style={{ display: "grid", gap: 10 }}>
        {steps.map((step, i) => (
          <Card key={step.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ color: "var(--gs-text-muted)", width: 22 }}>{i + 1}</span>
            <Badge tone={step.type === "trigger" ? "yellow" : "blue"}>{step.type}</Badge>
            <span style={{ flex: 1 }}>{step.label}</span>
            <Button variant="ghost" onClick={() => remove(step.id)}>
              Remove
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
