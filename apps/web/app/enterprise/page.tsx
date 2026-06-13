import { ModulePage } from "../components/ModulePage";
import { PageHeader, Card, Badge } from "@gsmaxall/ui";

const MEMBERS = [
  { name: "Praveen K", email: "praveen@gsgroups.net", role: "owner" },
  { name: "Ada Lovelace", email: "ada@example.com", role: "admin" },
  { name: "Alan Turing", email: "alan@example.com", role: "member" },
  { name: "Grace Hopper", email: "grace@example.com", role: "viewer" },
];

const AUDIT = [
  { actor: "Praveen K", action: "created organization", when: "2m ago" },
  { actor: "Ada Lovelace", action: "invited alan@example.com", when: "1h ago" },
  { actor: "system", action: "rotated provider key", when: "yesterday" },
];

const roleTone = { owner: "green", admin: "blue", member: "neutral", viewer: "yellow" } as const;

export default function EnterprisePage() {
  return (
    <ModulePage>
      <PageHeader
        title="Enterprise OS"
        subtitle="Organizations, RBAC, SSO, and audit logs (services/admin). Sample org shown."
      />

      <h2 style={{ fontSize: 16, margin: "8px 0 12px" }}>Members</h2>
      <Card style={{ padding: 0, marginBottom: 24 }}>
        {MEMBERS.map((m, i) => (
          <div
            key={m.email}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 16px",
              borderTop: i === 0 ? "none" : "1px solid var(--gs-border)",
            }}
          >
            <div>
              <div style={{ fontWeight: 600 }}>{m.name}</div>
              <div style={{ fontSize: 13, color: "var(--gs-text-muted)" }}>{m.email}</div>
            </div>
            <Badge tone={roleTone[m.role as keyof typeof roleTone]}>{m.role}</Badge>
          </div>
        ))}
      </Card>

      <h2 style={{ fontSize: 16, margin: "8px 0 12px" }}>Audit log</h2>
      <Card style={{ padding: 0 }}>
        {AUDIT.map((a, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "12px 16px",
              borderTop: i === 0 ? "none" : "1px solid var(--gs-border)",
              fontSize: 14,
            }}
          >
            <span>
              <strong>{a.actor}</strong> {a.action}
            </span>
            <span style={{ color: "var(--gs-text-muted)" }}>{a.when}</span>
          </div>
        ))}
      </Card>
    </ModulePage>
  );
}
