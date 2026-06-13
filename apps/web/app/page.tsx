import Link from "next/link";
import { AppShell } from "./components/AppShell";
import { MODULES } from "./modules";

export default function HomePage() {
  return (
    <AppShell>
      <div style={{ padding: 32, maxWidth: 1100, margin: "0 auto" }}>
        <h1 style={{ fontSize: 30, marginBottom: 6 }}>Welcome to GSMAXALL</h1>
        <p style={{ color: "var(--gs-text-muted)", marginTop: 0, marginBottom: 28 }}>
          One unified AI Operating System. Choose a module to get started.
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: 14,
          }}
        >
          {MODULES.map((module) => (
            <Link
              key={module.key}
              href={module.href}
              style={{
                border: "1px solid var(--gs-border)",
                background: "var(--gs-bg-elev)",
                borderRadius: 12,
                padding: 18,
                display: "block",
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{module.label}</div>
              <div style={{ fontSize: 13, color: "var(--gs-text-muted)" }}>
                {module.description}
              </div>
              <div style={{ fontSize: 11, marginTop: 12, color: "var(--gs-text-muted)" }}>
                {module.status}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
