/** Unified AI provider router contracts. One abstraction over every model vendor. */

export type ProviderId =
  | "openai"
  | "anthropic"
  | "gemini"
  | "openrouter"
  | "ollama"
  | "deepseek"
  | "qwen"
  | "llama";

export interface ModelInfo {
  /** Canonical id, e.g. "openai/gpt-4o" or "anthropic/claude-3-5-sonnet". */
  id: string;
  provider: ProviderId;
  displayName: string;
  contextWindow: number;
  supportsTools: boolean;
  supportsVision: boolean;
}

export interface ChatTurn {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
}

export interface ChatRequest {
  model: string;
  messages: ChatTurn[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface ChatChunk {
  delta: string;
  done: boolean;
}

export interface ChatResult {
  content: string;
  model: string;
  promptTokens?: number;
  completionTokens?: number;
}

export interface EmbedRequest {
  model: string;
  input: string[];
}

export interface EmbedResult {
  model: string;
  vectors: number[][];
}

/** The single interface every provider adapter implements. */
export interface ProviderAdapter {
  readonly id: ProviderId;
  models(): Promise<ModelInfo[]>;
  chat(req: ChatRequest): Promise<ChatResult>;
  chatStream(req: ChatRequest): AsyncIterable<ChatChunk>;
  embed?(req: EmbedRequest): Promise<EmbedResult>;
}
