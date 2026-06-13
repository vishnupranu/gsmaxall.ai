import { ModulePage } from "../components/ModulePage";
import { PageHeader, Card } from "@gsmaxall/ui";

const TREE = ["apps/", "  web/", "packages/", "  sdk/", "  ui/", "services/", "  orchestrator/"];

const SAMPLE = `export class ProviderRouter {
  chat(req: ChatRequest): Promise<ChatResult> {
    return this.adapterFor(req.model).chat(req);
  }
}`;

export default function IdePage() {
  return (
    <ModulePage>
      <PageHeader
        title="IDE OS"
        subtitle="In-browser code editor linked to the agent workspace. Editor + diffs land in a later epic; this previews the layout."
      />
      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 14 }}>
        <Card style={{ fontFamily: "ui-monospace, monospace", fontSize: 13 }}>
          {TREE.map((t) => (
            <div key={t} style={{ color: "var(--gs-text-muted)", whiteSpace: "pre" }}>
              {t}
            </div>
          ))}
        </Card>
        <Card style={{ padding: 0 }}>
          <div style={{ padding: "8px 14px", borderBottom: "1px solid var(--gs-border)", fontSize: 13, color: "var(--gs-text-muted)" }}>
            packages/sdk/src/provider/router.ts
          </div>
          <pre style={{ margin: 0, padding: 16, overflow: "auto", fontSize: 13.5, lineHeight: 1.6 }}>
            <code>{SAMPLE}</code>
          </pre>
        </Card>
      </div>
    </ModulePage>
  );
}
