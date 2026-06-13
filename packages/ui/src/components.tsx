import type {
  HTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";

export function Card({ children, style, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...rest}
      style={{
        border: "1px solid var(--gs-border)",
        background: "var(--gs-bg-elev)",
        borderRadius: 12,
        padding: 18,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 16,
        marginBottom: 24,
      }}
    >
      <div>
        <h1 style={{ fontSize: 26, margin: 0 }}>{title}</h1>
        {subtitle && (
          <p style={{ color: "var(--gs-text-muted)", margin: "6px 0 0", maxWidth: 720 }}>
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div style={{ flex: "0 0 auto" }}>{actions}</div>}
    </div>
  );
}

type BadgeTone = "neutral" | "green" | "yellow" | "blue";

export function Badge({ tone = "neutral", children }: { tone?: BadgeTone; children: ReactNode }) {
  const colors: Record<BadgeTone, string> = {
    neutral: "#64748b",
    green: "#22c55e",
    yellow: "#eab308",
    blue: "#3b82f6",
  };
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.04em",
        color: colors[tone],
        border: `1px solid ${colors[tone]}40`,
        background: `${colors[tone]}1a`,
        borderRadius: 999,
        padding: "2px 8px",
      }}
    >
      {children}
    </span>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={{
        width: "100%",
        background: "var(--gs-bg)",
        color: "var(--gs-text)",
        border: "1px solid var(--gs-border)",
        borderRadius: 8,
        padding: "9px 12px",
        font: "inherit",
        ...props.style,
      }}
    />
  );
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      style={{
        width: "100%",
        background: "var(--gs-bg)",
        color: "var(--gs-text)",
        border: "1px solid var(--gs-border)",
        borderRadius: 8,
        padding: "9px 12px",
        font: "inherit",
        resize: "vertical",
        ...props.style,
      }}
    />
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div
      style={{
        border: "1px dashed var(--gs-border)",
        borderRadius: 12,
        padding: 40,
        textAlign: "center",
        color: "var(--gs-text-muted)",
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 4, color: "var(--gs-text)" }}>{title}</div>
      {hint && <div style={{ fontSize: 14 }}>{hint}</div>}
    </div>
  );
}
