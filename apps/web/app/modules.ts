/** The 15 GSMAXALL OS modules surfaced in the unified UI. */

export interface ModuleDef {
  key: string;
  label: string;
  href: string;
  description: string;
  status: "live" | "scaffolded" | "planned";
}

export const MODULES: ModuleDef[] = [
  { key: "chat", label: "AI Chat OS", href: "/chat", description: "Multi-model chat", status: "live" },
  { key: "knowledge", label: "Knowledge OS", href: "/knowledge", description: "Docs + RAG", status: "scaffolded" },
  { key: "memory", label: "Memory OS", href: "/memory", description: "Long-term memory", status: "scaffolded" },
  { key: "agents", label: "Agent OS", href: "/agents", description: "Multi-agent orchestration", status: "scaffolded" },
  { key: "developer", label: "Developer OS", href: "/developer", description: "Autonomous coding", status: "scaffolded" },
  { key: "ide", label: "IDE OS", href: "/ide", description: "In-browser editor", status: "planned" },
  { key: "terminal", label: "Terminal OS", href: "/terminal", description: "Sandboxed shell", status: "scaffolded" },
  { key: "workflows", label: "Workflow OS", href: "/workflows", description: "Automations", status: "scaffolded" },
  { key: "builder", label: "Builder OS", href: "/builder", description: "App/site builder", status: "planned" },
  { key: "research", label: "Research OS", href: "/research", description: "Deep research", status: "scaffolded" },
  { key: "content", label: "Content OS", href: "/content", description: "Writing", status: "planned" },
  { key: "media", label: "Media OS", href: "/media", description: "Image/audio", status: "scaffolded" },
  { key: "business", label: "Business OS", href: "/business", description: "Billing + orgs", status: "scaffolded" },
  { key: "marketplace", label: "Marketplace OS", href: "/marketplace", description: "Plugins", status: "planned" },
  { key: "enterprise", label: "Enterprise OS", href: "/enterprise", description: "RBAC + audit", status: "scaffolded" },
];
