/**
 * Static registries that mirror services/orchestrator. Kept in the web app so the
 * public Vercel deployment is self-contained; in full deployments these proxy to
 * the orchestrator gateway (NEXT_PUBLIC_ORCHESTRATOR_URL).
 */

export interface AgentEntry {
  id: string;
  name: string;
  source: "openhands" | "openclaw" | "native";
  capabilities: string[];
  description: string;
}

export interface ToolEntry {
  name: string;
  description: string;
  protocol: "mcp" | "acp" | "native";
}

export interface ProviderEntry {
  id: string;
  name: string;
  envKey: string;
}

export const AGENTS: AgentEntry[] = [
  {
    id: "developer",
    name: "Developer Agent",
    source: "openhands",
    capabilities: ["code", "terminal", "repo", "plan"],
    description: "Autonomous coding agent (OpenHands runtime) — edits repos in a sandbox and opens PRs.",
  },
  {
    id: "assistant",
    name: "Assistant Agent",
    source: "openclaw",
    capabilities: ["chat", "tools", "memory"],
    description: "General assistant (OpenClaw gateway) — conversational with tool + memory access.",
  },
  {
    id: "researcher",
    name: "Research Agent",
    source: "native",
    capabilities: ["search", "browse", "synthesize"],
    description: "Deep-research agent — multi-step web research with sourced synthesis.",
  },
];

export const TOOLS: ToolEntry[] = [
  { name: "shell.exec", description: "Run a command in the sandbox", protocol: "native" },
  { name: "repo.edit", description: "Edit files in a repository", protocol: "acp" },
  { name: "web.fetch", description: "Fetch and read a web page", protocol: "mcp" },
  { name: "memory.search", description: "Semantic search over long-term memory", protocol: "native" },
  { name: "image.generate", description: "Generate an image from a prompt", protocol: "acp" },
];

export const PROVIDERS: ProviderEntry[] = [
  { id: "openai", name: "OpenAI", envKey: "OPENAI_API_KEY" },
  { id: "anthropic", name: "Anthropic", envKey: "ANTHROPIC_API_KEY" },
  { id: "gemini", name: "Google Gemini", envKey: "GEMINI_API_KEY" },
  { id: "openrouter", name: "OpenRouter", envKey: "OPENROUTER_API_KEY" },
  { id: "deepseek", name: "DeepSeek", envKey: "DEEPSEEK_API_KEY" },
  { id: "ollama", name: "Ollama (local)", envKey: "OLLAMA_BASE_URL" },
  { id: "qwen", name: "Qwen", envKey: "QWEN_API_KEY" },
  { id: "llama", name: "Llama (via OpenRouter)", envKey: "OPENROUTER_API_KEY" },
];
