"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { ModulePage } from "../components/ModulePage";
import { PageHeader, Button, Card, Badge } from "@gsmaxall/ui";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";

const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

const DEFAULT_CODE = `// GSMAXALL IDE OS — Agent Canvas Experience
// Full desktop/mobile editor with terminal

function hello(name) {
  return "Hello, " + name + "!";
}

console.log(hello("Developer"));
console.log("Agent Canvas powered IDE ready!");
`;

const FILE_TREE = [
  { name: "apps/", children: ["web/", "api/"] },
  { name: "packages/", children: ["sdk/", "ui/", "types/"] },
  { name: "services/", children: ["agents/", "orchestrator/"] },
  { name: "README.md" },
];

type Tab = "editor" | "terminal" | "output";

export default function IdePage() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [fileName, setFileName] = useState("main.ts");
  const [activeTab, setActiveTab] = useState<Tab>("editor");
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const terminalRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<Terminal | null>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (activeTab === "terminal" && terminalRef.current && !termRef.current) {
      const term = new Terminal({
        theme: { background: "#0a0c10", foreground: "#d7dde8" },
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        fontSize: 13,
        cursorBlink: true,
      });
      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);
      term.open(terminalRef.current);
      fitAddon.fit();
      term.write("gsmaxall@sandbox:~$ ");
      termRef.current = term;

      let cmd = "";
      term.onData((data) => {
        if (data === "\r") {
          const output = cmd.trim() ? `gsmaxall@sandbox:~$ ${cmd}` : "";
          const result = executeCommand(cmd);
          if (output) setTerminalOutput((prev) => [...prev, output]);
          if (result) {
            setTerminalOutput((prev) => [...prev, result]);
            term.write("\r\n" + result + "\r\n");
          }
          cmd = "";
          term.write("gsmaxall@sandbox:~$ ");
        } else if (data === "\x7f") {
          if (cmd.length > 0) {
            cmd = cmd.slice(0, -1);
            term.write("\b \b");
          }
        } else {
          cmd += data;
          term.write(data);
        }
      });
    }
    return () => {
      termRef.current?.dispose();
      termRef.current = null;
    };
  }, [activeTab]);

  function executeCommand(cmd: string): string {
    const outputs: Record<string, string> = {
      help: "Available: ls, pwd, whoami, echo, clear",
      ls: "apps/  packages/  services/  infrastructure/  README.md",
      pwd: "/workspace/gsmaxall",
      whoami: "gsmaxall-agent",
      clear: "CLEAR",
    };
    const output = outputs[cmd.toLowerCase()];
    if (output === "CLEAR") {
      setTerminalOutput([]);
      return "";
    } else if (output !== undefined) {
      return output;
    } else if (cmd.startsWith("echo ")) {
      return cmd.slice(5);
    } else if (cmd.trim()) {
      return "command not found: " + cmd;
    }
    return "";
  }

  function runInSandbox() {
    const output = "[Sandbox] Running " + fileName + "...\n[Sandbox] Completed";
    setTerminalOutput((prev) => [...prev, output]);
    setActiveTab("terminal");
  }

  return (
    <ModulePage>
      <PageHeader
        title="IDE OS"
        subtitle="Full desktop/mobile editor powered by Monaco + xterm. Connect to Agent Canvas for autonomous coding."
        actions={
          <div style={{ display: "flex", gap: 8 }}>
            <Button variant="ghost" onClick={() => window.open("agent-canvas", "_blank")}>
              Open Agent Canvas
            </Button>
            {isMobile && (
              <Button variant="ghost" onClick={() => setSidebarOpen(!sidebarOpen)}>
                {sidebarOpen ? "Hide" : "Show"}
              </Button>
            )}
          </div>
        }
      />
      <div style={{ display: "grid", gap: 12 }}>
        <Card style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", overflowX: "auto" }}>
          <span style={{ color: "var(--gs-text-muted)", fontSize: 13, whiteSpace: "nowrap" }}>{fileName}</span>
          <input
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            style={{
              background: "transparent",
              border: "1px solid var(--gs-border)",
              borderRadius: 4,
              padding: "2px 6px",
              color: "var(--gs-text)",
              font: "inherit",
              fontSize: 12,
              width: 100,
            }}
          />
          <Button variant="ghost">Save</Button>
          <Button onClick={runInSandbox}>Run</Button>
          <Badge tone="green">Connected</Badge>
        </Card>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "220px 1fr",
            gap: 12,
            height: isMobile ? 400 : 520,
          }}
        >
          <Card
            style={{
              padding: 8,
              fontFamily: "ui-monospace, monospace",
              fontSize: 13,
              display: isMobile ? (sidebarOpen ? "block" : "none") : "block",
              overflowY: "auto",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ color: "var(--gs-text-muted)", fontSize: 11, fontWeight: 600 }}>EXPLORER</span>
            </div>
            {FILE_TREE.map((item) => (
              <div key={item.name}>
                <div style={{ color: "var(--gs-text)", cursor: "pointer", padding: "2px 0", display: "flex", alignItems: "center", gap: 4 }}>
                  {item.children ? "📁" : "📄"} {item.name}
                </div>
                {item.children?.map((child) => (
                  <div
                    key={child}
                    style={{
                      color: child.endsWith("/") ? "var(--gs-text-muted)" : "var(--gs-text)",
                      cursor: "pointer",
                      padding: "2px 0 2px 16px",
                    }}
                    onClick={() => {
                      if (!child.endsWith("/")) {
                        setFileName(child);
                      }
                    }}
                  >
                    {child.endsWith("/") ? "📁" : "📄"} {child}
                  </div>
                ))}
              </div>
            ))}
          </Card>

          <div style={{ display: "grid", gridTemplateRows: "1fr auto", gap: 12 }}>
            <Card style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ display: "flex", borderBottom: "1px solid var(--gs-border)", background: "var(--gs-bg-elev)" }}>
                {(["editor", "terminal", "output"] as Tab[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      padding: "8px 16px",
                      background: activeTab === tab ? "var(--gs-bg)" : "transparent",
                      border: "none",
                      borderBottom: activeTab === tab ? "2px solid #6366f1" : "2px solid transparent",
                      color: activeTab === tab ? "var(--gs-text)" : "var(--gs-text-muted)",
                      cursor: "pointer",
                      fontSize: 13,
                      textTransform: "capitalize",
                    }}
                  >
                    {tab === "editor" ? "Editor" : tab === "terminal" ? "Terminal" : "Output"}
                  </button>
                ))}
              </div>

              {activeTab === "editor" && (
                <div style={{ height: isMobile ? 300 : 400 }}>
                  <Editor
                    height="100%"
                    defaultLanguage="typescript"
                    value={code}
                    onChange={(value) => setCode(value ?? "")}
                    theme="vs-dark"
                    options={{
                      minimap: { enabled: !isMobile },
                      fontSize: 13,
                      padding: { top: 12 },
                      wordWrap: "on",
                    }}
                  />
                </div>
              )}

              {activeTab === "terminal" && (
                <div
                  ref={terminalRef}
                  style={{
                    height: isMobile ? 300 : 400,
                    background: "#0a0c10",
                    padding: 12,
                    overflow: "auto",
                  }}
                />
              )}

              {activeTab === "output" && (
                <div
                  style={{
                    height: isMobile ? 300 : 400,
                    background: "#0a0c10",
                    padding: 12,
                    overflow: "auto",
                    fontFamily: "ui-monospace, monospace",
                    fontSize: 13,
                    color: "#d7dde8",
                  }}
                >
                  {terminalOutput.length === 0 ? (
                    <div style={{ color: "var(--gs-text-muted)" }}>Run code to see output...</div>
                  ) : (
                    terminalOutput.map((line, i) => (
                      <div key={i} style={{ marginBottom: 4, whiteSpace: "pre-wrap" }}>{line}</div>
                    ))
                  )}
                </div>
              )}
            </Card>

            <Card style={{ padding: "4px 12px", fontSize: 12, color: "var(--gs-text-muted)", display: "flex", gap: 16 }}>
              <span>TypeScript</span>
              <span>UTF-8</span>
              <span>Ln 1, Col 1</span>
              <span style={{ marginLeft: "auto" }}>GSMAXALL IDE OS</span>
            </Card>
          </div>
        </div>
      </div>
    </ModulePage>
  );
}
