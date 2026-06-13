"use client";

import { useState, useEffect, useRef } from "react";
import { Button, Card, Badge } from "@gsmaxall/ui";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";

const WELCOME = `
╔═══════════════════════════════════════════════════════╗
║        GSMAXALL Terminal OS v0.1.0                   ║
║        Agent Canvas Connected                         ║
╚═══════════════════════════════════════════════════════╝

Type 'help' for available commands.
`;

const COMMANDS: Record<string, string | ((args: string[]) => string)> = {
  help: "Available commands:\n  help     - Show this help\n  ls       - List directory contents\n  pwd      - Print working directory\n  whoami   - Current user\n  date     - Current date/time\n  clear    - Clear terminal\n  echo     - Print text\n  gsmaxall - GSMAXALL info\n  neofetch - System info",
  ls: "apps/  packages/  services/  infrastructure/\nREADME.md  package.json  turbo.json",
  pwd: "/workspace/gsmaxall",
  whoami: "gsmaxall-agent",
  date: () => new Date().toISOString(),
  gsmaxall: `GSMAXALL AI Operating System
────────────────────────
Version: 0.1.0
Modules: 15 OS modules
Status: Running

Powered by OpenHands + OpenClaw`,
  neofetch: `       ████████████       gsmaxall@gsmaxall
     ██            ██     ─────────────────
   ██    ██████    ██     OS: GSMAXALL AI OS
   ██  ██████████  ██     Host: Agent Canvas
   ██  ██████████  ██     Kernel: Node.js 22
   ██  ██████████  ██     Shell: gsmaxall-sh
   ██    ██████    ██     Terminal: xterm.js
     ██            ██     CPU: AI-powered
       ████████████       Memory: Unlimited`,
};

export function TerminalView() {
  const [isConnected, setIsConnected] = useState(true);
  const terminalRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<Terminal | null>(null);

  useEffect(() => {
    if (!terminalRef.current || termRef.current) return;

    const term = new Terminal({
      theme: {
        background: "#0a0c10",
        foreground: "#d7dde8",
        cursor: "#22d3ee",
        cursorAccent: "#0a0c10",
        selectionBackground: "#6366f140",
        black: "#1a1a2e",
        red: "#ef4444",
        green: "#22c55e",
        yellow: "#eab308",
        blue: "#6366f1",
        magenta: "#a855f7",
        cyan: "#22d3ee",
        white: "#e7e9ee",
        brightBlack: "#6b7280",
        brightRed: "#f87171",
        brightGreen: "#4ade80",
        brightYellow: "#facc15",
        brightBlue: "#818cf8",
        brightMagenta: "#c084fc",
        brightCyan: "#67e8f9",
        brightWhite: "#f9fafb",
      },
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
      fontSize: 14,
      lineHeight: 1.4,
      cursorBlink: true,
      cursorStyle: "block",
      scrollback: 1000,
      allowTransparency: true,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();

    // Write welcome message
    term.writeln("\x1b[36m" + WELCOME.trim() + "\x1b[0m");
    term.write("\r\n$ ");

    let currentCmd = "";
    termRef.current = term;

    term.onData((data) => {
      const code = data.charCodeAt(0);

      if (data === "\r") {
        const cmd = currentCmd.trim().toLowerCase();
        term.write("\r\n");

        if (cmd) {
          executeCommand(term, cmd, currentCmd.trim());
        }
        term.write("$ ");
        currentCmd = "";
      } else if (data === "\x7f") {
        if (currentCmd.length > 0) {
          currentCmd = currentCmd.slice(0, -1);
          term.write("\b \b");
        }
      } else if (code >= 32) {
        currentCmd += data;
        term.write(data);
      }
    });

    // Handle resize
    const resizeObserver = new ResizeObserver(() => fitAddon.fit());
    resizeObserver.observe(terminalRef.current);

    return () => {
      resizeObserver.disconnect();
      term.dispose();
      termRef.current = null;
    };
  }, []);

  function executeCommand(term: Terminal, cmd: string, fullCmd: string) {
    const [command = "", ...args] = fullCmd.split(" ");

    if (command === "clear") {
      term.clear();
      return;
    }

    if (command === "echo") {
      term.writeln(args.join(" "));
      return;
    }

    const response = COMMANDS[command];
    if (typeof response === "string") {
      response.split("\n").forEach((line) => term.writeln(line));
    } else if (typeof response === "function") {
      term.writeln(response(args));
    } else if (command) {
      term.writeln(`\x1b[31mcommand not found: ${command}\x1b[0m`);
    }
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <Card style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 12px" }}>
        <Badge tone={isConnected ? "green" : "yellow"}>
          {isConnected ? "● Connected" : "○ Disconnected"}
        </Badge>
        <span style={{ color: "var(--gs-text-muted)", fontSize: 13 }}>
          Agent Canvas Terminal
        </span>
        <Button
          variant="ghost"
          onClick={() => {
            if (termRef.current) {
              termRef.current.clear();
              termRef.current.writeln("Terminal cleared");
              termRef.current.write("$ ");
            }
          }}
        >
          Clear
        </Button>
      </Card>
      <div
        ref={terminalRef}
        style={{
          height: 500,
          background: "#0a0c10",
          borderRadius: 12,
          padding: 8,
          border: "1px solid var(--gs-border)",
        }}
      />
    </div>
  );
}
