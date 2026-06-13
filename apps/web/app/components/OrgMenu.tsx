"use client";

import { useState } from "react";
import { Badge } from "@gsmaxall/ui";
import { useSession } from "../lib/session";

/** Header control: organization switcher + user menu (sign out). */
export function OrgMenu() {
  const { user, orgs, currentOrg, setCurrentOrg, signOut } = useSession();
  const [open, setOpen] = useState(false);

  if (!user || !currentOrg) return null;

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="gs-btn gs-btn--ghost"
        style={{ display: "flex", alignItems: "center", gap: 8 }}
      >
        <span style={{ fontWeight: 600 }}>{currentOrg.name}</span>
        <Badge tone="blue">{currentOrg.role}</Badge>
        <span style={{ color: "var(--gs-text-muted)" }}>▾</span>
      </button>
      {open && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 44,
            width: 240,
            background: "var(--gs-bg-elev)",
            border: "1px solid var(--gs-border)",
            borderRadius: 10,
            boxShadow: "0 8px 30px rgba(0,0,0,0.18)",
            zIndex: 20,
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--gs-border)" }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{user.name}</div>
            <div style={{ fontSize: 12, color: "var(--gs-text-muted)" }}>{user.email}</div>
          </div>
          <div style={{ padding: 6 }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", color: "var(--gs-text-muted)", padding: "6px 8px" }}>
              Organizations
            </div>
            {orgs.map((o) => (
              <button
                key={o.id}
                onClick={() => {
                  setCurrentOrg(o.id);
                  setOpen(false);
                }}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  width: "100%",
                  textAlign: "left",
                  background: o.id === currentOrg.id ? "var(--gs-bg)" : "transparent",
                  border: "none",
                  color: "var(--gs-text)",
                  padding: "8px 10px",
                  borderRadius: 8,
                  cursor: "pointer",
                  font: "inherit",
                }}
              >
                <span>{o.name}</span>
                <span style={{ fontSize: 11, color: "var(--gs-text-muted)" }}>{o.role}</span>
              </button>
            ))}
          </div>
          <div style={{ borderTop: "1px solid var(--gs-border)", padding: 6 }}>
            <button
              onClick={signOut}
              style={{
                width: "100%",
                textAlign: "left",
                background: "transparent",
                border: "none",
                color: "var(--gs-text)",
                padding: "8px 10px",
                borderRadius: 8,
                cursor: "pointer",
                font: "inherit",
              }}
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
