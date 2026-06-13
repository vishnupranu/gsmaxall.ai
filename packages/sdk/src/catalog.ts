import type { ModelInfo, ProviderId } from "@gsmaxall/types";

/**
 * Default model catalog. Sourced/curated per provider; in production this is
 * augmented by OpenClaw's model-catalog-core and live provider `models()` calls.
 */
export const DEFAULT_CATALOG: ModelInfo[] = [
  m("openai/gpt-4o", "openai", "GPT-4o", 128_000, true, true),
  m("openai/gpt-4o-mini", "openai", "GPT-4o mini", 128_000, true, true),
  m("anthropic/claude-3-5-sonnet", "anthropic", "Claude 3.5 Sonnet", 200_000, true, true),
  m("anthropic/claude-3-5-haiku", "anthropic", "Claude 3.5 Haiku", 200_000, true, false),
  m("gemini/gemini-1.5-pro", "gemini", "Gemini 1.5 Pro", 1_000_000, true, true),
  m("deepseek/deepseek-chat", "deepseek", "DeepSeek Chat", 64_000, true, false),
  m("openrouter/auto", "openrouter", "OpenRouter Auto", 128_000, true, true),
  m("ollama/llama3.1", "ollama", "Llama 3.1 (local)", 128_000, false, false),
  m("qwen/qwen2.5-72b-instruct", "qwen", "Qwen 2.5 72B", 131_072, true, false),
];

export function providerOf(modelId: string): ProviderId {
  const prefix = modelId.split("/")[0];
  return (prefix ?? "openai") as ProviderId;
}

function m(
  id: string,
  provider: ProviderId,
  displayName: string,
  contextWindow: number,
  supportsTools: boolean,
  supportsVision: boolean,
): ModelInfo {
  return { id, provider, displayName, contextWindow, supportsTools, supportsVision };
}
