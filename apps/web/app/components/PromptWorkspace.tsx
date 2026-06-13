"use client";

import { useState } from "react";
import { Button, Card, Textarea } from "@gsmaxall/ui";

interface PromptWorkspaceProps {
  systemPrompt: string;
  placeholder: string;
  runLabel?: string;
  model?: string;
  onRun?: (instruction: string) => Promise<void>;
  disabled?: boolean;
}

/**
 * Reusable prompt → streamed output surface. Posts to /api/chat with a
 * module-specific system prompt, so it works live (with a provider key) or in
 * demo mode (without one). Powers Developer/Research/Content/Builder OS.
 * 
 * When onRun is provided, calls that function instead of the chat API.
 */
export function PromptWorkspace({
  systemPrompt,
  placeholder,
  runLabel = "Run",
  model = "openai/gpt-4o-mini",
  onRun,
  disabled = false,
}: PromptWorkspaceProps) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [busy, setBusy] = useState(false);
  const isBusy = busy || disabled;

  async function run() {
    const text = input.trim();
    if (!text || isBusy) return;
    
    setBusy(true);
    setOutput("");
    
    try {
      if (onRun) {
        // Call the provided onRun handler
        await onRun(text);
      } else {
        // Default: stream from chat API
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model,
            stream: true,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: text },
            ],
          }),
        });
        if (!res.body) throw new Error("No response stream");
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          setOutput((prev) => prev + decoder.decode(value, { stream: true }));
        }
      }
    } catch (error) {
      setOutput(`[error] ${error instanceof Error ? error.message : "request failed"}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <Card>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          rows={4}
        />
        <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
          <Button onClick={() => void run()} disabled={isBusy}>
            {isBusy ? "Working…" : runLabel}
          </Button>
        </div>
      </Card>
      {(output || busy) && (
        <Card>
          <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{output || "…"}</div>
        </Card>
      )}
    </div>
  );
}
