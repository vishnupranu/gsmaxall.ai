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
  { key: "knowledge", label: "Knowledge OS", href: "/knowledge", description: "Docs + RAG", status: "live" },
  { key: "memory", label: "Memory OS", href: "/memory", description: "Long-term memory", status: "live" },
  { key: "agents", label: "Agent OS", href: "/agents", description: "Multi-agent orchestration", status: "live" },
  { key: "developer", label: "Developer OS", href: "/developer", description: "Autonomous coding", status: "live" },
  { key: "ide", label: "IDE OS", href: "/ide", description: "In-browser editor", status: "scaffolded" },
  { key: "terminal", label: "Terminal OS", href: "/terminal", description: "Sandboxed shell", status: "live" },
  { key: "workflows", label: "Workflow OS", href: "/workflows", description: "Automations", status: "live" },
  { key: "builder", label: "Builder OS", href: "/builder", description: "App/site builder", status: "live" },
  { key: "research", label: "Research OS", href: "/research", description: "Deep research", status: "live" },
  { key: "content", label: "Content OS", href: "/content", description: "Writing", status: "live" },
  { key: "media", label: "Media OS", href: "/media", description: "Image/audio", status: "live" },
  { key: "business", label: "Business OS", href: "/business", description: "Billing + orgs", status: "scaffolded" },
  { key: "marketplace", label: "Marketplace OS", href: "/marketplace", description: "Plugins", status: "scaffolded" },
  { key: "enterprise", label: "Enterprise OS", href: "/enterprise", description: "RBAC + audit", status: "scaffolded" },
];
