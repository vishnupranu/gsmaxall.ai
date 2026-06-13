-- GSMAXALL — unified initial schema (merges users from all source systems).
-- See docs/GAP_ANALYSIS.md (G3) and docs/TARGET_ARCHITECTURE.md (§5).
-- Core tables per directive: users, organizations, agents, conversations,
-- projects, repositories, files, workflows, tasks, memories, knowledge, audit_logs.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Identity & tenancy ──────────────────────────────────────────────────────
CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email         TEXT UNIQUE NOT NULL,
    display_name  TEXT,
    avatar_url    TEXT,
    -- Supabase Auth is the identity provider; this mirrors auth.users.
    supabase_uid  TEXT UNIQUE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE organizations (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    slug        TEXT UNIQUE NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TYPE org_role AS ENUM ('owner', 'admin', 'member', 'viewer');

CREATE TABLE memberships (
    user_id          UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    organization_id  UUID NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
    role             org_role NOT NULL DEFAULT 'member',
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, organization_id)
);

-- ── Agents ──────────────────────────────────────────────────────────────────
CREATE TABLE agents (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id  UUID NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
    name             TEXT NOT NULL,
    source           TEXT NOT NULL,           -- openhands | openclaw | native
    capabilities     JSONB NOT NULL DEFAULT '[]',
    config           JSONB NOT NULL DEFAULT '{}',
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Projects & repositories ─────────────────────────────────────────────────
CREATE TABLE projects (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id  UUID NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
    name             TEXT NOT NULL,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE repositories (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id  UUID NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
    provider    TEXT NOT NULL DEFAULT 'github',
    full_name   TEXT NOT NULL,                -- owner/repo
    default_branch TEXT NOT NULL DEFAULT 'main',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Conversations (Chat OS) ─────────────────────────────────────────────────
CREATE TABLE conversations (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id  UUID NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
    user_id          UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    title            TEXT NOT NULL DEFAULT 'New conversation',
    model            TEXT NOT NULL,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE messages (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id  UUID NOT NULL REFERENCES conversations (id) ON DELETE CASCADE,
    role             TEXT NOT NULL,           -- system | user | assistant | tool
    content          TEXT NOT NULL,
    tool_call_id     TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Files ───────────────────────────────────────────────────────────────────
CREATE TABLE files (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id  UUID NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
    user_id          UUID REFERENCES users (id) ON DELETE SET NULL,
    name             TEXT NOT NULL,
    mime_type        TEXT,
    size_bytes       BIGINT,
    storage_url      TEXT NOT NULL,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Workflows & tasks ───────────────────────────────────────────────────────
CREATE TABLE workflows (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id  UUID NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
    name             TEXT NOT NULL,
    definition       JSONB NOT NULL DEFAULT '{}',   -- nodes, edges, triggers
    enabled          BOOLEAN NOT NULL DEFAULT true,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE tasks (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id  UUID NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
    workflow_id      UUID REFERENCES workflows (id) ON DELETE SET NULL,
    agent_id         UUID REFERENCES agents (id) ON DELETE SET NULL,
    status           TEXT NOT NULL DEFAULT 'pending',  -- pending|running|done|failed
    input            JSONB NOT NULL DEFAULT '{}',
    output           JSONB,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Memory & knowledge ──────────────────────────────────────────────────────
-- Vectors live in Qdrant; these tables hold the relational metadata/source rows.
CREATE TABLE memories (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id  UUID NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
    agent_id         UUID REFERENCES agents (id) ON DELETE SET NULL,
    content          TEXT NOT NULL,
    qdrant_point_id  TEXT,                      -- link to Qdrant vector
    metadata         JSONB NOT NULL DEFAULT '{}',
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE knowledge (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id  UUID NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
    name             TEXT NOT NULL,             -- knowledge base name
    file_id          UUID REFERENCES files (id) ON DELETE SET NULL,
    chunk_count      INTEGER NOT NULL DEFAULT 0,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Audit ───────────────────────────────────────────────────────────────────
CREATE TABLE audit_logs (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id  UUID REFERENCES organizations (id) ON DELETE CASCADE,
    actor_user_id    UUID REFERENCES users (id) ON DELETE SET NULL,
    action           TEXT NOT NULL,
    target_type      TEXT,
    target_id        TEXT,
    metadata         JSONB NOT NULL DEFAULT '{}',
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Indexes ─────────────────────────────────────────────────────────────────
CREATE INDEX idx_memberships_org ON memberships (organization_id);
CREATE INDEX idx_conversations_org_user ON conversations (organization_id, user_id);
CREATE INDEX idx_messages_conversation ON messages (conversation_id);
CREATE INDEX idx_tasks_org_status ON tasks (organization_id, status);
CREATE INDEX idx_memories_org ON memories (organization_id);
CREATE INDEX idx_knowledge_org ON knowledge (organization_id);
CREATE INDEX idx_audit_org_created ON audit_logs (organization_id, created_at);
