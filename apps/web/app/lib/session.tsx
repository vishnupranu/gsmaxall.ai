"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

export type OrgRole = "owner" | "admin" | "member" | "viewer";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
}

export interface Org {
  id: string;
  name: string;
  role: OrgRole;
}

interface SessionState {
  user: SessionUser | null;
  orgs: Org[];
  currentOrg: Org | null;
  ready: boolean;
  supabaseConfigured: boolean;
  signIn: (name: string, email: string) => void;
  signOut: () => void;
  setCurrentOrg: (orgId: string) => void;
}

const SessionContext = createContext<SessionState | null>(null);

const STORAGE_KEY = "gsmaxall.session.v1";

interface Persisted {
  user: SessionUser;
  orgs: Org[];
  currentOrgId: string;
}

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

/**
 * Auth + organization context. Supabase-ready: when NEXT_PUBLIC_SUPABASE_URL is
 * set the app should mount the Supabase client here; until then it runs a local
 * demo identity so every org-scoped surface is exercisable.
 */
export function SessionProvider({ children }: { children: ReactNode }) {
  const supabaseConfigured =
    typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
    process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0;

  const [persisted, setPersisted] = useState<Persisted | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setPersisted(JSON.parse(raw) as Persisted);
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  function persist(next: Persisted | null) {
    setPersisted(next);
    try {
      if (next) localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }

  const value = useMemo<SessionState>(() => {
    const user = persisted?.user ?? null;
    const orgs = persisted?.orgs ?? [];
    const currentOrg = orgs.find((o) => o.id === persisted?.currentOrgId) ?? orgs[0] ?? null;

    return {
      user,
      orgs,
      currentOrg,
      ready,
      supabaseConfigured,
      signIn: (name, email) => {
        const orgName = `${name.split(" ")[0] || "My"}'s Workspace`;
        const org: Org = { id: `org_${slug(orgName)}`, name: orgName, role: "owner" };
        const personal: Org = { id: "org_gsmaxall", name: "GSMAXALL", role: "member" };
        persist({
          user: { id: `usr_${slug(email)}`, name, email },
          orgs: [org, personal],
          currentOrgId: org.id,
        });
      },
      signOut: () => persist(null),
      setCurrentOrg: (orgId) =>
        setPersisted((prev) => {
          if (!prev) return prev;
          const next = { ...prev, currentOrgId: orgId };
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
          } catch {
            /* ignore */
          }
          return next;
        }),
    };
  }, [persisted, ready, supabaseConfigured]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionState {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
