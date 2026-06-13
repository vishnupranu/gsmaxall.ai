import type { ReactNode } from "react";
import { AppShell } from "./AppShell";

/** Standard padded module container inside the app shell. */
export function ModulePage({ children }: { children: ReactNode }) {
  return (
    <AppShell>
      <div style={{ padding: 32, maxWidth: 1100, margin: "0 auto" }}>{children}</div>
    </AppShell>
  );
}
