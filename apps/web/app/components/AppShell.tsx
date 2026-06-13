"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo, useTheme } from "@gsmaxall/ui";
import { MODULES } from "../modules";
import type { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();

  return (
    <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", height: "100vh" }}>
      <aside
        style={{
          borderRight: "1px solid var(--gs-border)",
          background: "var(--gs-bg-elev)",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
        }}
      >
        <div style={{ padding: "18px 16px", borderBottom: "1px solid var(--gs-border)" }}>
          <Link href="/">
            <Logo />
          </Link>
        </div>
        <nav style={{ padding: 8, flex: 1 }}>
          {MODULES.map((module) => {
            const active = pathname === module.href;
            return (
              <Link
                key={module.key}
                href={module.href}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "9px 12px",
                  borderRadius: 8,
                  marginBottom: 2,
                  fontSize: 14,
                  background: active ? "var(--gs-bg)" : "transparent",
                  color: active ? "var(--gs-text)" : "var(--gs-text-muted)",
                }}
              >
                <span>{module.label}</span>
                <StatusDot status={module.status} />
              </Link>
            );
          })}
        </nav>
      </aside>

      <main style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <header
          style={{
            height: 56,
            borderBottom: "1px solid var(--gs-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            padding: "0 18px",
            gap: 12,
          }}
        >
          <button
            onClick={toggle}
            className="gs-btn gs-btn--ghost"
            aria-label="Toggle theme"
            title="Toggle theme"
          >
            {theme === "dark" ? "Light" : "Dark"} mode
          </button>
        </header>
        <div style={{ flex: 1, overflow: "auto" }}>{children}</div>
      </main>
    </div>
  );
}

function StatusDot({ status }: { status: "live" | "scaffolded" | "planned" }) {
  const color =
    status === "live" ? "#22c55e" : status === "scaffolded" ? "#eab308" : "#64748b";
  return (
    <span
      title={status}
      style={{ width: 8, height: 8, borderRadius: 999, background: color, flex: "0 0 auto" }}
    />
  );
}
