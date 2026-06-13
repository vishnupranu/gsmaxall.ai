"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { Button, Card, Input, Logo, Badge } from "@gsmaxall/ui";
import { useSession } from "../lib/session";

/** Gates the app behind a sign-in. Demo identity when Supabase isn't configured. */
export function AuthGate({ children }: { children: ReactNode }) {
  const { user, ready, supabaseConfigured, signIn } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  if (!ready) {
    return <div style={{ display: "grid", placeItems: "center", height: "100vh" }}>Loading…</div>;
  }

  if (user) return <>{children}</>;

  return (
    <div style={{ display: "grid", placeItems: "center", height: "100vh", padding: 20 }}>
      <Card style={{ width: 380, maxWidth: "100%" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
          <Logo />
        </div>
        <h1 style={{ fontSize: 20, textAlign: "center", margin: "0 0 4px" }}>Sign in to GSMAXALL</h1>
        <p style={{ textAlign: "center", color: "var(--gs-text-muted)", fontSize: 14, marginTop: 0 }}>
          Your unified AI Operating System
        </p>
        <div style={{ display: "grid", gap: 10, marginTop: 18 }}>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
            onKeyDown={(e) => e.key === "Enter" && name && email && signIn(name, email)}
          />
          <Button onClick={() => name && email && signIn(name, email)}>Continue</Button>
        </div>
        <div style={{ textAlign: "center", marginTop: 16 }}>
          {supabaseConfigured ? (
            <Badge tone="green">Supabase Auth connected</Badge>
          ) : (
            <Badge tone="yellow">demo auth — set NEXT_PUBLIC_SUPABASE_URL for Supabase</Badge>
          )}
        </div>
      </Card>
    </div>
  );
}
