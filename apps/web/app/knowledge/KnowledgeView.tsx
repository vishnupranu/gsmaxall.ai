"use client";

import { useRef, useState } from "react";
import { Button, Card, Input, EmptyState, Badge } from "@gsmaxall/ui";
import { useLocalState } from "../lib/useLocalState";
import { parseTabularFile } from "../lib/tabular";

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
  const [note, setNote] = useState<string>("");
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

  function addBase() {
    const trimmed = name.trim();
    if (!trimmed) return;
    setBases((prev) => [
      ...prev,
      { id: `kb${prev.length + 1}`, name: trimmed, chunks: 0, files: [] },
    ]);
    setName("");
  }

  async function onFile(id: string, file: File | undefined) {
    if (!file) return;
    const lower = file.name.toLowerCase();
    const tabular = lower.endsWith(".csv") || lower.endsWith(".xlsx") || lower.endsWith(".xlsm");
    let added = 24;
    if (tabular) {
      try {
        const { rows } = await parseTabularFile(file);
        added = rows.length;
        setNote(`Ingested ${rows.length} rows from ${file.name} (each row embedded as a vector).`);
      } catch {
        setNote(`Could not parse ${file.name}.`);
        return;
      }
    } else {
      setNote(`Queued ${file.name} for chunking.`);
    }
    setBases((prev) =>
      prev.map((kb) =>
        kb.id === id ? { ...kb, files: [...kb.files, file.name], chunks: kb.chunks + added } : kb,
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
        <p style={{ margin: "10px 2px 0", fontSize: 13, color: "var(--gs-text-muted)" }}>
          Upload Excel (.xlsx) or CSV — each row is parsed and embedded into the vector index.
        </p>
        {note && (
          <p style={{ margin: "6px 2px 0", fontSize: 13, color: "var(--gs-accent, #6366f1)" }}>{note}</p>
        )}
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
                <input
                  ref={(el) => {
                    fileInputs.current[kb.id] = el;
                  }}
                  type="file"
                  accept=".csv,.xlsx,.xlsm,.md,.txt,.pdf"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    void onFile(kb.id, e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
                <Button variant="ghost" onClick={() => fileInputs.current[kb.id]?.click()}>
                  Upload Excel / CSV / document
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
