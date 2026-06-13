import { ModulePage } from "../components/ModulePage";
import { PageHeader, Card, Badge } from "@gsmaxall/ui";

const METRICS = [
  { label: "Active users", value: "1,284" },
  { label: "Conversations", value: "42,907" },
  { label: "Agent tasks", value: "9,331" },
  { label: "Tokens this month", value: "18.4M" },
];

const PLANS = [
  { name: "Starter", price: "$0", features: ["Chat OS", "1 org member", "Community models"] },
  { name: "Pro", price: "$29", features: ["All OS modules", "5 members", "All providers"] },
  { name: "Enterprise", price: "Custom", features: ["SSO + RBAC", "Audit logs", "Dedicated runtime"] },
];

export default function BusinessPage() {
  return (
    <ModulePage>
      <PageHeader
        title="Business OS"
        subtitle="Usage metering, billing, and plans (services/admin). Numbers shown are sample data."
      />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 24 }}>
        {METRICS.map((m) => (
          <Card key={m.label}>
            <div style={{ color: "var(--gs-text-muted)", fontSize: 13 }}>{m.label}</div>
            <div style={{ fontSize: 26, fontWeight: 700, marginTop: 6 }}>{m.value}</div>
          </Card>
        ))}
      </div>
      <h2 style={{ fontSize: 16, margin: "8px 0 12px" }}>Plans</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
        {PLANS.map((p, i) => (
          <Card key={p.name}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <strong>{p.name}</strong>
              {i === 1 && <Badge tone="green">Popular</Badge>}
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, margin: "10px 0" }}>
              {p.price}
              {p.price !== "Custom" && <span style={{ fontSize: 14, color: "var(--gs-text-muted)" }}>/mo</span>}
            </div>
            <ul style={{ margin: 0, paddingLeft: 18, color: "var(--gs-text-muted)", fontSize: 14 }}>
              {p.features.map((f) => (
                <li key={f} style={{ marginBottom: 4 }}>{f}</li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </ModulePage>
  );
}
