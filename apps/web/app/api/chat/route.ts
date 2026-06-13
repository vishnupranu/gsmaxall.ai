import { ProviderRouter } from "@gsmaxall/sdk";
import type { ChatRequest } from "@gsmaxall/types";

export const runtime = "nodejs";

const router = new ProviderRouter();

/**
 * Chat OS streaming endpoint. Streams provider-router output as plain text chunks.
 * Requires the relevant provider API key in the environment (see .env.example).
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

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
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
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}
