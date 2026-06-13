/** Identity, organization and tenancy contracts. Mirrors infrastructure/db schema. */

export type Role = "owner" | "admin" | "member" | "viewer";

export interface User {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  createdAt: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
}

export interface Membership {
  userId: string;
  organizationId: string;
  role: Role;
}

/** Verified identity attached to every authenticated request. */
export interface AuthContext {
  user: User;
  organizationId: string;
  role: Role;
}
