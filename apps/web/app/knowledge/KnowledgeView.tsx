"use client";

import { useState } from "react";
import { Button, Card, Input, EmptyState, Badge } from "@gsmaxall/ui";
import { useLocalState } from "../lib/useLocalState";

interface KB {
  id: string;
  name: string;
  chunks: number;
  files: string[];
}

export function KnowledgeView() {
  const [bases, setBases] = useLocalState<KB[]>("gsmaxall.knowledge.v1", [
    { id: "kb1", name: "Product Docs", chunks: 128, files: ["overview.md", "api.md"] },
  ]);
  const [name, setName] = useState("");

  function addBase() {
    const trimmed = name.trim();
    if (!trimmed) return;
    setBases((prev) => [
      ...prev,
      { id: `kb${prev.length + 1}`, name: trimmed, chunks: 0, files: [] },
    ]);
    setName("");
  }

  function addFile(id: string) {
    const file = `upload-${Date.now()}.pdf`;
    setBases((prev) =>
      prev.map((kb) =>
        kb.id === id ? { ...kb, files: [...kb.files, file], chunks: kb.chunks + 24 } : kb,
      ),
    );
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <Card>
        <div style={{ display: "flex", gap: 10 }}>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="New knowledge base name…"
            onKeyDown={(e) => e.key === "Enter" && addBase()}
          />
          <Button onClick={addBase}>Create</Button>
        </div>
      </Card>

      {bases.length === 0 ? (
        <EmptyState title="No knowledge bases yet" hint="Create one to upload documents." />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
          {bases.map((kb) => (
            <Card key={kb.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <strong>{kb.name}</strong>
                <Badge tone="blue">{kb.chunks} chunks</Badge>
              </div>
              <div style={{ marginTop: 10, fontSize: 14, color: "var(--gs-text-muted)" }}>
                {kb.files.length === 0 ? "No files yet" : kb.files.join(", ")}
              </div>
              <div style={{ marginTop: 12 }}>
                <Button variant="ghost" onClick={() => addFile(kb.id)}>
                  Upload document
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
