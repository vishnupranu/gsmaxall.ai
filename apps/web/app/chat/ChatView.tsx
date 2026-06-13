"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@gsmaxall/ui";
import type { ChatMessage, ModelInfo } from "@gsmaxall/types";

let messageCounter = 0;
function nextId() {
  messageCounter += 1;
  return `m${messageCounter}`;
}

export function ChatView() {
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [model, setModel] = useState("openai/gpt-4o-mini");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/models")
      .then((r) => r.json())
      .then((data: { models: ModelInfo[] }) => setModels(data.models))
      .catch(() => setModels([]));
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    const userMsg: ChatMessage = {
      id: nextId(),
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };
    const assistantMsg: ChatMessage = {
      id: nextId(),
      role: "assistant",
      content: "",
      createdAt: new Date().toISOString(),
    };
    const history = [...messages, userMsg];
    setMessages([...history, assistantMsg]);
    setInput("");
    setBusy(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          messages: history.map((m) => ({ role: m.role, content: m.content })),
          stream: true,
        }),
      });
      if (!res.body) throw new Error("No response stream");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsg.id ? { ...m, content: m.content + text } : m,
          ),
        );
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "request failed";
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsg.id ? { ...m, content: `[error] ${message}` } : m,
        ),
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div
        style={{
          padding: "12px 24px",
          borderBottom: "1px solid var(--gs-border)",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <strong>AI Chat OS</strong>
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          style={{
            marginLeft: "auto",
            background: "var(--gs-bg-elev)",
            color: "var(--gs-text)",
            border: "1px solid var(--gs-border)",
            borderRadius: 8,
            padding: "6px 10px",
          }}
        >
          {(models.length ? models : [{ id: model, displayName: model } as ModelInfo]).map((m) => (
            <option key={m.id} value={m.id}>
              {m.displayName}
            </option>
          ))}
        </select>
      </div>

      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: 24 }}>
        {messages.length === 0 && (
          <p style={{ color: "var(--gs-text-muted)" }}>
            Start a conversation. Responses stream through the unified provider router.
          </p>
        )}
        {messages.map((m) => (
          <div key={m.id} style={{ marginBottom: 18, maxWidth: 760 }}>
            <div style={{ fontSize: 12, color: "var(--gs-text-muted)", marginBottom: 4 }}>
              {m.role}
            </div>
            <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.55 }}>
              {m.content || (busy ? "…" : "")}
            </div>
          </div>
        ))}
      </div>

      <div style={{ borderTop: "1px solid var(--gs-border)", padding: 16, display: "flex", gap: 10 }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send();
            }
          }}
          placeholder="Message GSMAXALL…"
          rows={1}
          style={{
            flex: 1,
            resize: "none",
            background: "var(--gs-bg-elev)",
            color: "var(--gs-text)",
            border: "1px solid var(--gs-border)",
            borderRadius: 10,
            padding: "10px 12px",
            font: "inherit",
          }}
        />
        <Button onClick={() => void send()} disabled={busy}>
          {busy ? "…" : "Send"}
        </Button>
      </div>
    </div>
  );
}
