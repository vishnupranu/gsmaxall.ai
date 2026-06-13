"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@gsmaxall/ui";
import type { ChatMessage, ModelInfo } from "@gsmaxall/types";
import { useLocalState } from "../lib/useLocalState";

interface Conversation {
  id: string;
  title: string;
  model: string;
  messages: ChatMessage[];
  updatedAt: string;
}

let counter = 0;
function nextId(prefix: string) {
  counter += 1;
  return `${prefix}_${Date.now()}_${counter}`;
}

function newConversation(model: string): Conversation {
  return {
    id: nextId("conv"),
    title: "New conversation",
    model,
    messages: [],
    updatedAt: new Date().toISOString(),
  };
}

const DEFAULT_MODEL = "openai/gpt-4o-mini";

export function ChatView() {
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [conversations, setConversations] = useLocalState<Conversation[]>("gsmaxall.chat.v1", []);
  const [activeId, setActiveId] = useLocalState<string>("gsmaxall.chat.active", "");
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/models")
      .then((r) => r.json())
      .then((data: { models: ModelInfo[] }) => setModels(data.models))
      .catch(() => setModels([]));
  }, []);

  // Ensure there is always an active conversation.
  useEffect(() => {
    if (conversations.length === 0) {
      const c = newConversation(DEFAULT_MODEL);
      setConversations([c]);
      setActiveId(c.id);
    } else if (!conversations.some((c) => c.id === activeId)) {
      setActiveId(conversations[0]!.id);
    }
  }, [conversations, activeId, setConversations, setActiveId]);

  const active = conversations.find((c) => c.id === activeId) ?? conversations[0] ?? null;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [active?.messages]);

  function patchActive(fn: (c: Conversation) => Conversation) {
    setConversations((prev) => prev.map((c) => (c.id === active?.id ? fn(c) : c)));
  }

  function createConversation() {
    const c = newConversation(active?.model ?? DEFAULT_MODEL);
    setConversations((prev) => [c, ...prev]);
    setActiveId(c.id);
  }

  function deleteConversation(id: string) {
    setConversations((prev) => prev.filter((c) => c.id !== id));
  }

  async function send() {
    const text = input.trim();
    if (!text || busy || !active) return;
    const userMsg: ChatMessage = {
      id: nextId("m"),
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };
    const assistantMsg: ChatMessage = {
      id: nextId("m"),
      role: "assistant",
      content: "",
      createdAt: new Date().toISOString(),
    };
    const history = [...active.messages, userMsg];
    const title = active.messages.length === 0 ? text.slice(0, 40) : active.title;
    patchActive((c) => ({
      ...c,
      title,
      messages: [...history, assistantMsg],
      updatedAt: new Date().toISOString(),
    }));
    setInput("");
    setBusy(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: active.model,
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
        const chunk = decoder.decode(value, { stream: true });
        patchActive((c) => ({
          ...c,
          messages: c.messages.map((m) =>
            m.id === assistantMsg.id ? { ...m, content: m.content + chunk } : m,
          ),
        }));
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "request failed";
      patchActive((c) => ({
        ...c,
        messages: c.messages.map((m) =>
          m.id === assistantMsg.id ? { ...m, content: `[error] ${message}` } : m,
        ),
      }));
    } finally {
      setBusy(false);
    }
  }

  const modelOptions = models.length
    ? models
    : [{ id: active?.model ?? DEFAULT_MODEL, displayName: active?.model ?? DEFAULT_MODEL } as ModelInfo];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", height: "100%" }}>
      <aside style={{ borderRight: "1px solid var(--gs-border)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: 12 }}>
          <Button onClick={createConversation} style={{ width: "100%" }}>
            + New chat
          </Button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "0 8px 8px" }}>
          {conversations.map((c) => (
            <div
              key={c.id}
              onClick={() => setActiveId(c.id)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 6,
                padding: "8px 10px",
                borderRadius: 8,
                cursor: "pointer",
                background: c.id === active?.id ? "var(--gs-bg-elev)" : "transparent",
              }}
            >
              <span style={{ fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {c.title}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteConversation(c.id);
                }}
                title="Delete"
                style={{ background: "transparent", border: "none", color: "var(--gs-text-muted)", cursor: "pointer" }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </aside>

      <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
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
            value={active?.model ?? DEFAULT_MODEL}
            onChange={(e) => patchActive((c) => ({ ...c, model: e.target.value }))}
            style={{
              marginLeft: "auto",
              background: "var(--gs-bg-elev)",
              color: "var(--gs-text)",
              border: "1px solid var(--gs-border)",
              borderRadius: 8,
              padding: "6px 10px",
            }}
          >
            {modelOptions.map((m) => (
              <option key={m.id} value={m.id}>
                {m.displayName}
              </option>
            ))}
          </select>
        </div>

        <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: 24 }}>
          {(!active || active.messages.length === 0) && (
            <p style={{ color: "var(--gs-text-muted)" }}>
              Start a conversation. Responses stream through the unified provider router.
            </p>
          )}
          {active?.messages.map((m) => (
            <div key={m.id} style={{ marginBottom: 18, maxWidth: 760 }}>
              <div style={{ fontSize: 12, color: "var(--gs-text-muted)", marginBottom: 4 }}>{m.role}</div>
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
    </div>
  );
}
