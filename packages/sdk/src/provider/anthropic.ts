import type {
  ChatChunk,
  ChatRequest,
  ChatResult,
  ModelInfo,
  ProviderAdapter,
} from "@gsmaxall/types";

export interface AnthropicConfig {
  apiKey?: string;
  baseUrl?: string;
  catalog?: ModelInfo[];
}

/** Adapter for Anthropic's Messages API (distinct request shape from OpenAI). */
export class AnthropicAdapter implements ProviderAdapter {
  readonly id = "anthropic" as const;
  private readonly apiKey?: string;
  private readonly baseUrl: string;
  private readonly catalog: ModelInfo[];

  constructor(cfg: AnthropicConfig = {}) {
    this.apiKey = cfg.apiKey;
    this.baseUrl = (cfg.baseUrl ?? "https://api.anthropic.com/v1").replace(/\/$/, "");
    this.catalog = cfg.catalog ?? [];
  }

  async models(): Promise<ModelInfo[]> {
    return this.catalog;
  }

  async chat(req: ChatRequest): Promise<ChatResult> {
    const res = await fetch(`${this.baseUrl}/messages`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify(this.body(req, false)),
    });
    if (!res.ok) {
      throw new Error(`anthropic chat failed: ${res.status} ${await res.text()}`);
    }
    const json = (await res.json()) as MessagesResponse;
    return {
      content: json.content?.map((c) => c.text ?? "").join("") ?? "",
      model: json.model ?? req.model,
      promptTokens: json.usage?.input_tokens,
      completionTokens: json.usage?.output_tokens,
    };
  }

  async *chatStream(req: ChatRequest): AsyncIterable<ChatChunk> {
    const res = await fetch(`${this.baseUrl}/messages`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify(this.body(req, true)),
    });
    if (!res.ok || !res.body) {
      throw new Error(`anthropic stream failed: ${res.status}`);
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
        const text = extractText(trimmed.slice(5).trim());
        if (text) yield { delta: text, done: false };
      }
    }
    yield { delta: "", done: true };
  }

  private headers(): Record<string, string> {
    const h: Record<string, string> = {
      "Content-Type": "application/json",
      "anthropic-version": "2023-06-01",
    };
    if (this.apiKey) h["x-api-key"] = this.apiKey;
    return h;
  }

  private body(req: ChatRequest, stream: boolean) {
    const system = req.messages
      .filter((msg) => msg.role === "system")
      .map((msg) => msg.content)
      .join("\n");
    const messages = req.messages
      .filter((msg) => msg.role !== "system")
      .map((msg) => ({ role: msg.role === "assistant" ? "assistant" : "user", content: msg.content }));
    return {
      model: stripPrefix(req.model),
      system: system || undefined,
      messages,
      max_tokens: req.maxTokens ?? 1024,
      temperature: req.temperature,
      stream,
    };
  }
}

function stripPrefix(model: string): string {
  const idx = model.indexOf("/");
  return idx === -1 ? model : model.slice(idx + 1);
}

function extractText(data: string): string | null {
  try {
    const parsed = JSON.parse(data) as StreamEvent;
    return parsed.delta?.text ?? null;
  } catch {
    return null;
  }
}

interface MessagesResponse {
  model?: string;
  content?: { text?: string }[];
  usage?: { input_tokens?: number; output_tokens?: number };
}

interface StreamEvent {
  delta?: { text?: string };
}
