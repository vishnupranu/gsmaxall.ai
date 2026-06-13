"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

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
  supabase: SupabaseClient | null;
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
 * set the app uses Supabase Auth; until then it runs a local demo identity.
 */
export function SessionProvider({ children }: { children: ReactNode }) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  const supabaseConfigured = Boolean(supabaseUrl && supabaseKey);

  const supabase = useMemo(() => {
    if (!supabaseConfigured) return null;
    return createClient(supabaseUrl, supabaseKey);
  }, [supabaseConfigured, supabaseUrl, supabaseKey]);

  const [persisted, setPersisted] = useState<Persisted | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SessionUser | null>(null);
  const [ready, setReady] = useState(false);

  // Load persisted demo session from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setPersisted(JSON.parse(raw) as Persisted);
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  // If Supabase is configured, sync user from Supabase auth state
  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const u = session.user;
        setSupabaseUser({
          id: u.id,
          name: u.user_metadata?.full_name ?? u.email?.split("@")[0] ?? "User",
          email: u.email ?? "",
        });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const u = session.user;
        setSupabaseUser({
          id: u.id,
          name: u.user_metadata?.full_name ?? u.email?.split("@")[0] ?? "User",
          email: u.email ?? "",
        });
      } else {
        setSupabaseUser(null);
      }
    });

    return () => { subscription.unsubscribe(); };
  }, [supabase]);

  function persist(next: Persisted | null) {
    setPersisted(next);
    try {
      if (next) localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }

  // Use Supabase user if configured, otherwise fall back to demo identity
  const effectiveUser = supabaseConfigured ? supabaseUser : persisted?.user ?? null;

  const value = useMemo<SessionState>(() => {
    const orgs = persisted?.orgs ?? (supabaseConfigured ? [] : []);
    const currentOrg = orgs.find((o) => o.id === persisted?.currentOrgId) ?? orgs[0] ?? null;

    return {
      user: effectiveUser,
      orgs,
      currentOrg,
      ready,
      supabaseConfigured,
      supabase,
      signIn: supabaseConfigured
        ? async (name: string, email: string) => {
            if (!supabase) return;
            const { error } = await supabase.auth.signInWithPassword({ email, password: "demo" });
            if (error) {
              // In demo mode, sign up creates a new user
              await supabase.auth.signUp({ 
                email, 
                password: "demo", 
                options: { data: { full_name: name } } 
              });
            }
          }
        : (name: string, email: string) => {
            const orgName = `\${name.split(" ")[0] || "My"}'s Workspace`;
            const org: Org = { id: `org_\${slug(orgName)}`, name: orgName, role: "owner" };
            const personal: Org = { id: "org_gsmaxall", name: "GSMAXALL", role: "member" };
            persist({
              user: { id: `usr_\${slug(email)}`, name, email },
              orgs: [org, personal],
              currentOrgId: org.id,
            });
          },
      signOut: supabaseConfigured
        ? async () => {
            if (supabase) await supabase.auth.signOut();
            setSupabaseUser(null);
          }
        : () => persist(null),
      setCurrentOrg: (orgId: string) =>
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
  }, [persisted, ready, supabaseConfigured, supabase, effectiveUser]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionState {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
