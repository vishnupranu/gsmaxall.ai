import { ModulePage } from "../components/ModulePage";
import { PageHeader, Card, Badge } from "@gsmaxall/ui";
import { AGENTS, TOOLS } from "../registry";

const sourceTone = { openhands: "blue", openclaw: "green", native: "neutral" } as const;
const protocolTone = { mcp: "blue", acp: "green", native: "neutral" } as const;

export default function AgentsPage() {
  return (
    <ModulePage>
      <PageHeader
        title="Agent OS"
        subtitle="Agent registry and tool registry. Agents are coordinated by the orchestrator, which bridges MCP and ACP tools behind one contract."
      />

      <h2 style={{ fontSize: 16, margin: "8px 0 12px" }}>Registered agents</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
        {AGENTS.map((agent) => (
          <Card key={agent.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <strong>{agent.name}</strong>
              <Badge tone={sourceTone[agent.source]}>{agent.source}</Badge>
            </div>
            <p style={{ color: "var(--gs-text-muted)", fontSize: 14, marginTop: 8 }}>
              {agent.description}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
              {agent.capabilities.map((c) => (
                <span
                  key={c}
                  style={{
                    fontSize: 12,
                    color: "var(--gs-text-muted)",
                    border: "1px solid var(--gs-border)",
                    borderRadius: 6,
                    padding: "2px 7px",
                  }}
                >
                  {c}
                </span>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <h2 style={{ fontSize: 16, margin: "28px 0 12px" }}>Tool registry</h2>
      <Card style={{ padding: 0 }}>
        {TOOLS.map((tool, i) => (
          <div
            key={tool.name}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 16px",
              borderTop: i === 0 ? "none" : "1px solid var(--gs-border)",
            }}
          >
            <div>
              <code style={{ fontWeight: 600 }}>{tool.name}</code>
              <span style={{ color: "var(--gs-text-muted)", fontSize: 14, marginLeft: 10 }}>
                {tool.description}
              </span>
            </div>
            <Badge tone={protocolTone[tool.protocol]}>{tool.protocol}</Badge>
          </div>
        ))}
      </Card>
    </ModulePage>
  );
}
