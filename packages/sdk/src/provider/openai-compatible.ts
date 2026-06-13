import type {
  ChatChunk,
  ChatRequest,
  ChatResult,
  EmbedRequest,
  EmbedResult,
  ModelInfo,
  ProviderAdapter,
  ProviderId,
} from "@gsmaxall/types";

export interface OpenAICompatibleConfig {
  id: ProviderId;
  baseUrl: string;
  apiKey?: string;
  /** Static catalog fallback when the provider has no /models endpoint. */
  catalog?: ModelInfo[];
}

/**
 * Adapter for any OpenAI-compatible Chat Completions API:
 * OpenAI, DeepSeek, OpenRouter, Ollama, Qwen, Llama (via OpenRouter/Ollama).
 */
export class OpenAICompatibleAdapter implements ProviderAdapter {
  readonly id: ProviderId;
  private readonly baseUrl: string;
  private readonly apiKey?: string;
  private readonly catalog: ModelInfo[];

  constructor(cfg: OpenAICompatibleConfig) {
    this.id = cfg.id;
    this.baseUrl = cfg.baseUrl.replace(/\/$/, "");
    this.apiKey = cfg.apiKey;
    this.catalog = cfg.catalog ?? [];
  }

  async models(): Promise<ModelInfo[]> {
    return this.catalog;
  }

  async chat(req: ChatRequest): Promise<ChatResult> {
    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify(this.body(req, false)),
    });
    if (!res.ok) {
      throw new Error(`${this.id} chat failed: ${res.status} ${await res.text()}`);
    }
    const json = (await res.json()) as ChatCompletionResponse;
    return {
      content: json.choices?.[0]?.message?.content ?? "",
      model: json.model ?? req.model,
      promptTokens: json.usage?.prompt_tokens,
      completionTokens: json.usage?.completion_tokens,
    };
  }

  async *chatStream(req: ChatRequest): AsyncIterable<ChatChunk> {
    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify(this.body(req, true)),
    });
    if (!res.ok || !res.body) {
      throw new Error(`${this.id} stream failed: ${res.status}`);
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const data = trimmed.slice(5).trim();
        if (data === "[DONE]") {
          yield { delta: "", done: true };
          return;
        }
        const delta = extractDelta(data);
        if (delta) yield { delta, done: false };
      }
    }
    yield { delta: "", done: true };
  }

  async embed(req: EmbedRequest): Promise<EmbedResult> {
    const res = await fetch(`${this.baseUrl}/embeddings`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify({ model: req.model, input: req.input }),
    });
    if (!res.ok) {
      throw new Error(`${this.id} embed failed: ${res.status}`);
    }
    const json = (await res.json()) as EmbeddingResponse;
    return { model: json.model ?? req.model, vectors: json.data.map((d) => d.embedding) };
  }

  private headers(): Record<string, string> {
    const h: Record<string, string> = { "Content-Type": "application/json" };
    if (this.apiKey) h.Authorization = `Bearer ${this.apiKey}`;
    return h;
  }

  private body(req: ChatRequest, stream: boolean) {
    return {
      model: stripProviderPrefix(req.model),
      messages: req.messages,
      temperature: req.temperature,
      max_tokens: req.maxTokens,
      stream,
    };
  }
}

function stripProviderPrefix(model: string): string {
  const idx = model.indexOf("/");
  return idx === -1 ? model : model.slice(idx + 1);
}

function extractDelta(data: string): string | null {
  try {
    const parsed = JSON.parse(data) as ChatCompletionChunk;
    return parsed.choices?.[0]?.delta?.content ?? null;
  } catch {
    return null;
  }
}

interface ChatCompletionResponse {
  model?: string;
  choices?: { message?: { content?: string } }[];
  usage?: { prompt_tokens?: number; completion_tokens?: number };
}

interface ChatCompletionChunk {
  choices?: { delta?: { content?: string } }[];
}

interface EmbeddingResponse {
  model?: string;
  data: { embedding: number[] }[];
}
