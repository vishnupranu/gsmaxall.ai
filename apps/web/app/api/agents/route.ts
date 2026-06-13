import { AGENTS } from "../../registry";

export const runtime = "nodejs";

/** Agent registry (mirrors services/orchestrator /v1/agents). */
export async function GET(): Promise<Response> {
  return Response.json({ agents: AGENTS });
}
