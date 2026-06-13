"use client";

import { useState } from "react";
import { Button, Card, Input } from "@gsmaxall/ui";
import { brand } from "@gsmaxall/ui";

interface Tile {
  id: string;
  prompt: string;
}

export function MediaView() {
  const [prompt, setPrompt] = useState("");
  const [tiles, setTiles] = useState<Tile[]>([]);

  function generate() {
    const p = prompt.trim();
    if (!p) return;
    setTiles((prev) => [{ id: `t${Date.now()}`, prompt: p }, ...prev]);
    setPrompt("");
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <Card>
        <div style={{ display: "flex", gap: 10 }}>
          <Input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe an image to generate…"
            onKeyDown={(e) => e.key === "Enter" && generate()}
          />
          <Button onClick={generate}>Generate</Button>
        </div>
        <p style={{ color: "var(--gs-text-muted)", fontSize: 13, marginTop: 10, marginBottom: 0 }}>
          Demo mode renders placeholders. Connect an image provider (services/media) for real output.
        </p>
      </Card>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14 }}>
        {tiles.map((tile) => (
          <Card key={tile.id} style={{ padding: 0, overflow: "hidden" }}>
            <div
              style={{
                aspectRatio: "1 / 1",
                display: "grid",
                placeItems: "center",
                background: `linear-gradient(135deg, ${brand.accent.from}, ${brand.accent.to})`,
                color: "#fff",
                fontWeight: 700,
              }}
            >
              GSMAXALL
            </div>
            <div style={{ padding: 10, fontSize: 13, color: "var(--gs-text-muted)" }}>
              {tile.prompt}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
