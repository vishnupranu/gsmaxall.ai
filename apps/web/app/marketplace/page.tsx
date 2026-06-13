import { ModulePage } from "../components/ModulePage";
import { PageHeader, Card, Badge, Button } from "@gsmaxall/ui";

const PLUGINS = [
  { name: "GitHub", category: "Dev", desc: "Repos, issues, and PRs as agent tools." },
  { name: "Slack", category: "Comms", desc: "Send and read messages from workflows." },
  { name: "Notion", category: "Knowledge", desc: "Sync pages into Knowledge OS." },
  { name: "Stripe", category: "Business", desc: "Billing and revenue tools." },
  { name: "Playwright", category: "Web", desc: "Browser automation for Research OS." },
  { name: "Qdrant", category: "Memory", desc: "Vector store connector for Memory OS." },
];

export default function MarketplacePage() {
  return (
    <ModulePage>
      <PageHeader
        title="Marketplace OS"
        subtitle="Install plugins and agents (OpenClaw plugin-sdk). Extends every module with new tools."
      />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
        {PLUGINS.map((p) => (
          <Card key={p.name}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <strong>{p.name}</strong>
              <Badge>{p.category}</Badge>
            </div>
            <p style={{ color: "var(--gs-text-muted)", fontSize: 14, marginTop: 8 }}>{p.desc}</p>
            <Button variant="ghost">Install</Button>
          </Card>
        ))}
      </div>
    </ModulePage>
  );
}
