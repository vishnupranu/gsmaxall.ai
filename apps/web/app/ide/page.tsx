"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { ModulePage } from "../components/ModulePage";
import { PageHeader, Button, Card } from "@gsmaxall/ui";

const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

const DEFAULT_CODE = `// GSMAXALL IDE OS — powered by Monaco Editor
// Start coding! This editor syncs with the Developer OS runtime.

function hello(name: string): string {
  return \`Hello, \${name}! Welcome to GSMAXALL.\`;
}

console.log(hello("Developer"));
`;

const FILE_TREE = ["apps/web/", "packages/sdk/", "packages/ui/", "services/orchestrator/"];

export default function IdePage() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [fileName, setFileName] = useState("main.ts");
  const [activeFile, setActiveFile] = useState("main.ts");

  return (
    <ModulePage>
      <PageHeader
        title="IDE OS"
        subtitle="In-browser code editor powered by Monaco. Connected to the Developer OS runtime for live execution and repository sync."
      />
      <div style={{ display: "grid", gap: 12 }}>
        <Card style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 12px" }}>
          <span style={{ color: "var(--gs-text-muted)", fontSize: 14 }}>File:</span>
          <input
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            style={{
              background: "transparent",
              border: "1px solid var(--gs-border)",
              borderRadius: 6,
              padding: "4px 8px",
              color: "var(--gs-text)",
              font: "inherit",
            }}
          />
          <Button variant="ghost" style={{ marginLeft: "auto" }}>
            Save
          </Button>
          <Button>Run in Sandbox</Button>
        </Card>
        <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 12, height: 520 }}>
          <Card style={{ fontFamily: "ui-monospace, monospace", fontSize: 13, padding: 8 }}>
            <div style={{ marginBottom: 8, color: "var(--gs-text-muted)", fontSize: 11 }}>EXPLORER</div>
            {FILE_TREE.map((t) => (
              <div
                key={t}
                onClick={() => setActiveFile(t.trim())}
                style={{
                  color: "var(--gs-text-muted)",
                  cursor: "pointer",
                  padding: "2px 0",
                  fontWeight: activeFile === t.trim() ? 600 : 400,
                }}
              >
                📄 {t.trim()}
              </div>
            ))}
          </Card>
          <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid var(--gs-border)" }}>
            <Editor
              height="100%"
              defaultLanguage="typescript"
              value={code}
              onChange={(value) => setCode(value ?? "")}
              theme="vs-dark"
              options={{ minimap: { enabled: false }, fontSize: 13, padding: { top: 12 } }}
            />
          </div>
        </div>
      </div>
    </ModulePage>
  );
}
