import type {
  ChatChunk,
  ChatRequest,
  ChatResult,
  ModelInfo,
  ProviderAdapter,
  ProviderId,
} from "@gsmaxall/types";
import { DEFAULT_CATALOG, providerOf } from "../catalog";
import { OpenAICompatibleAdapter } from "./openai-compatible";
import { AnthropicAdapter } from "./anthropic";

const OPENAI_COMPATIBLE_BASE_URLS: Partial<Record<ProviderId, string>> = {
  openai: "https://api.openai.com/v1",
  deepseek: "https://api.deepseek.com/v1",
  openrouter: "https://openrouter.ai/api/v1",
  ollama: "http://localhost:11434/v1",
  qwen: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  llama: "https://openrouter.ai/api/v1",
  gemini: "https://generativelanguage.googleapis.com/v1beta/openai",
};

/** Maps a ProviderId to its env var holding the API key. */
const API_KEY_ENV: Partial<Record<ProviderId, string>> = {
  openai: "OPENAI_API_KEY",
  anthropic: "ANTHROPIC_API_KEY",
  gemini: "GEMINI_API_KEY",
  openrouter: "OPENROUTER_API_KEY",
  deepseek: "DEEPSEEK_API_KEY",
  qwen: "QWEN_API_KEY",
  llama: "OPENROUTER_API_KEY",
};

/**
 * The single entry point for all model calls across GSMAXALL.
 * Resolves the right adapter by model prefix ("openai/...", "anthropic/...").
 */
export class ProviderRouter {
  private readonly adapters = new Map<ProviderId, ProviderAdapter>();

  constructor(env: Record<string, string | undefined> = process.env) {
    for (const provider of Object.keys(OPENAI_COMPATIBLE_BASE_URLS) as ProviderId[]) {
      const baseUrl = OPENAI_COMPATIBLE_BASE_URLS[provider];
      if (!baseUrl) continue;
      const apiKeyEnv = API_KEY_ENV[provider];
      this.adapters.set(
        provider,
        new OpenAICompatibleAdapter({
          id: provider,
          baseUrl,
          apiKey: apiKeyEnv ? env[apiKeyEnv] : undefined,
          catalog: DEFAULT_CATALOG.filter((modelInfo) => modelInfo.provider === provider),
        }),
      );
    }
    this.adapters.set(
      "anthropic",
      new AnthropicAdapter({
        apiKey: env.ANTHROPIC_API_KEY,
        catalog: DEFAULT_CATALOG.filter((modelInfo) => modelInfo.provider === "anthropic"),
      }),
    );
  }

  listModels(): ModelInfo[] {
    return DEFAULT_CATALOG;
  }

  chat(req: ChatRequest): Promise<ChatResult> {
    return this.adapterFor(req.model).chat(req);
  }

  chatStream(req: ChatRequest): AsyncIterable<ChatChunk> {
    return this.adapterFor(req.model).chatStream(req);
  }

  private adapterFor(model: string): ProviderAdapter {
    const provider = providerOf(model);
    const adapter = this.adapters.get(provider);
    if (!adapter) {
      throw new Error(`No provider adapter registered for "${provider}" (model "${model}")`);
    }
    return adapter;
  }
}
