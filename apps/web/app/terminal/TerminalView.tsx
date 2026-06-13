"use client";

import { useState } from "react";

interface Line {
  cmd: string;
  out: string;
}

/** Mock sandboxed terminal. In full deployments this attaches to services/agents. */
export function TerminalView() {
  const [history, setHistory] = useState<Line[]>([
    { cmd: "gsmaxall --version", out: "GSMAXALL Terminal OS 0.1.0 (sandbox: ready)" },
  ]);
  const [cmd, setCmd] = useState("");

  function run() {
    const c = cmd.trim();
    if (!c) return;
    setHistory((prev) => [...prev, { cmd: c, out: simulate(c) }]);
    setCmd("");
  }

  return (
    <div
      style={{
        background: "#0a0c10",
        color: "#d7dde8",
        borderRadius: 12,
        border: "1px solid var(--gs-border)",
        padding: 16,
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        fontSize: 13.5,
        minHeight: 360,
      }}
    >
      {history.map((line, i) => (
        <div key={i} style={{ marginBottom: 8 }}>
          <div>
            <span style={{ color: "#22d3ee" }}>gsmaxall@sandbox</span>
            <span style={{ color: "#6b7280" }}>:~$ </span>
            {line.cmd}
          </div>
          <div style={{ color: "#9aa1ad", whiteSpace: "pre-wrap" }}>{line.out}</div>
        </div>
      ))}
      <div style={{ display: "flex" }}>
        <span style={{ color: "#22d3ee" }}>gsmaxall@sandbox</span>
        <span style={{ color: "#6b7280" }}>:~$ </span>
        <input
          value={cmd}
          onChange={(e) => setCmd(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && run()}
          autoFocus
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            color: "inherit",
            font: "inherit",
            marginLeft: 6,
          }}
        />
      </div>
    </div>
  );
}

function simulate(cmd: string): string {
  if (cmd === "help") return "Available (demo): ls, pwd, whoami, echo <text>, clear-context";
  if (cmd === "ls") return "apps  packages  services  infrastructure  docs  README.md";
  if (cmd === "pwd") return "/workspace/gsmaxall";
  if (cmd === "whoami") return "gsmaxall-agent";
  if (cmd.startsWith("echo ")) return cmd.slice(5);
  return `command not run in demo sandbox: ${cmd}`;
}
