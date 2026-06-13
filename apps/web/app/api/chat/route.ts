import { ProviderRouter } from "@gsmaxall/sdk";
import type { ChatRequest } from "@gsmaxall/types";

export const runtime = "nodejs";

const router = new ProviderRouter();

const PROVIDER_KEYS = [
  "OPENAI_API_KEY",
  "ANTHROPIC_API_KEY",
  "GEMINI_API_KEY",
  "OPENROUTER_API_KEY",
  "DEEPSEEK_API_KEY",
];

function hasAnyProviderKey(): boolean {
  return PROVIDER_KEYS.some((k) => !!process.env[k]);
}

/**
 * Chat OS streaming endpoint. Streams provider-router output as plain text.
 * When no provider key is configured (e.g. the public demo deployment), it
 * streams a canned response so the UI stays interactive.
 */
export async function POST(req: Request): Promise<Response> {
  let body: ChatRequest;
  try {
    body = (await req.json()) as ChatRequest;
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }

  if (!body.model || !Array.isArray(body.messages)) {
    return new Response("`model` and `messages` are required", { status: 400 });
  }

  const lastUser = [...body.messages].reverse().find((m) => m.role === "user");
  const demo = !hasAnyProviderKey();

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        if (demo) {
          await streamDemo(controller, encoder, body.model, lastUser?.content ?? "");
          return;
        }
        for await (const chunk of router.chatStream({ ...body, stream: true })) {
          if (chunk.delta) controller.enqueue(encoder.encode(chunk.delta));
          if (chunk.done) break;
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        controller.enqueue(encoder.encode(`\n[provider error] ${message}`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-GSMAXALL-Mode": demo ? "demo" : "live",
    },
  });
}

async function streamDemo(
  controller: ReadableStreamDefaultController<Uint8Array>,
  encoder: TextEncoder,
  model: string,
  prompt: string,
): Promise<void> {
  const reply =
    `**GSMAXALL demo mode** — running without a provider API key, so this is a simulated response.\n\n` +
    `You asked: "${prompt.slice(0, 280)}"\n\n` +
    `In live mode this routes through the unified provider router to \`${model}\`. ` +
    `Set a provider key (e.g. OPENAI_API_KEY or ANTHROPIC_API_KEY) to get real model output across ` +
    `OpenAI, Anthropic, Gemini, OpenRouter, DeepSeek, Ollama, Qwen and Llama.`;
  for (const token of reply.split(/(\s+)/)) {
    controller.enqueue(encoder.encode(token));
    await new Promise((r) => setTimeout(r, 12));
  }
}
