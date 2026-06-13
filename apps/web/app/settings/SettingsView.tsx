"use client";

import { useEffect, useState } from "react";
import { Card, Badge, Button, useTheme } from "@gsmaxall/ui";

interface ProviderStatus {
  id: string;
  name: string;
  envKey: string;
  configured: boolean;
}

export function SettingsView() {
  const { theme, setTheme } = useTheme();
  const [providers, setProviders] = useState<ProviderStatus[]>([]);
  const [mode, setMode] = useState<"demo" | "live">("demo");

  useEffect(() => {
    fetch("/api/providers")
      .then((r) => r.json())
      .then((d: { providers: ProviderStatus[]; mode: "demo" | "live" }) => {
        setProviders(d.providers);
        setMode(d.mode);
      })
      .catch(() => undefined);
  }, []);

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <strong>Runtime mode</strong>
            <p style={{ color: "var(--gs-text-muted)", fontSize: 14, margin: "4px 0 0" }}>
              {mode === "live"
                ? "A provider key is configured — chat uses real models."
                : "No provider key set — chat and prompt modules run in demo mode."}
            </p>
          </div>
          <Badge tone={mode === "live" ? "green" : "yellow"}>{mode}</Badge>
        </div>
      </Card>

      <Card>
        <strong>Appearance</strong>
        <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
          <Button variant={theme === "light" ? "primary" : "ghost"} onClick={() => setTheme("light")}>
            Light
          </Button>
          <Button variant={theme === "dark" ? "primary" : "ghost"} onClick={() => setTheme("dark")}>
            Dark
          </Button>
        </div>
      </Card>

      <Card style={{ padding: 0 }}>
        <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--gs-border)" }}>
          <strong>AI providers</strong>
        </div>
        {providers.map((p, i) => (
          <div
            key={p.id}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 16px",
              borderTop: i === 0 ? "none" : "1px solid var(--gs-border)",
            }}
          >
            <div>
              <div style={{ fontWeight: 600 }}>{p.name}</div>
              <code style={{ fontSize: 12, color: "var(--gs-text-muted)" }}>{p.envKey}</code>
            </div>
            <Badge tone={p.configured ? "green" : "neutral"}>
              {p.configured ? "configured" : "not set"}
            </Badge>
          </div>
        ))}
      </Card>
    </div>
  );
}
