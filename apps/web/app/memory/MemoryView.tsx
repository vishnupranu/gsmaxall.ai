"use client";

import { useState } from "react";
import { Button, Card, Input, EmptyState } from "@gsmaxall/ui";

interface Memory {
  id: string;
  content: string;
  score?: number;
}

const SEED: Memory[] = [
  { id: "m1", content: "User prefers TypeScript and pnpm for JS projects." },
  { id: "m2", content: "GSMAXALL standardizes on Supabase Auth and PostgreSQL." },
  { id: "m3", content: "Vector memory is backed by Qdrant; embeddings via the provider router." },
];

export function MemoryView() {
  const [memories] = useState<Memory[]>(SEED);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Memory[] | null>(null);

  function search() {
    const q = query.trim().toLowerCase();
    if (!q) {
      setResults(null);
      return;
    }
    // Demo semantic search: keyword overlap with a synthetic score.
    const scored = memories
      .map((m) => {
        const overlap = q.split(/\s+/).filter((w) => m.content.toLowerCase().includes(w)).length;
        return { ...m, score: overlap / Math.max(1, q.split(/\s+/).length) };
      })
      .filter((m) => (m.score ?? 0) > 0)
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    setResults(scored);
  }

  const list = results ?? memories;

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <Card>
        <div style={{ display: "flex", gap: 10 }}>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Semantic search over memory…"
            onKeyDown={(e) => e.key === "Enter" && search()}
          />
          <Button onClick={search}>Search</Button>
        </div>
      </Card>

      {list.length === 0 ? (
        <EmptyState title="No matching memories" hint="Try a different query." />
      ) : (
        <Card style={{ padding: 0 }}>
          {list.map((m, i) => (
            <div
              key={m.id}
              style={{
                padding: "12px 16px",
                borderTop: i === 0 ? "none" : "1px solid var(--gs-border)",
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <span>{m.content}</span>
              {m.score !== undefined && (
                <span style={{ color: "var(--gs-text-muted)", fontSize: 13, flex: "0 0 auto" }}>
                  {(m.score * 100).toFixed(0)}%
                </span>
              )}
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
