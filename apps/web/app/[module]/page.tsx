import { AppShell } from "../components/AppShell";
import { MODULES } from "../modules";

export default function ModulePage({ params }: { params: { module: string } }) {
  const mod = MODULES.find((m) => m.key === params.module);

  return (
    <AppShell>
      <div style={{ padding: 32, maxWidth: 760 }}>
        <h1 style={{ fontSize: 26, marginBottom: 8 }}>{mod ? mod.label : "Module"}</h1>
        <p style={{ color: "var(--gs-text-muted)" }}>
          {mod
            ? `${mod.description} — status: ${mod.status}.`
            : "This module is not yet available."}
        </p>
        <p style={{ color: "var(--gs-text-muted)", marginTop: 16, fontSize: 14 }}>
          This surface is scaffolded as part of the unified GSMAXALL UI. See
          {" "}
          <code>docs/MASTER_BACKLOG.md</code> for the implementation plan.
        </p>
      </div>
    </AppShell>
  );
}
