import { PROVIDERS } from "../../registry";

export const runtime = "nodejs";

/** Provider status — which providers have a key configured in this deployment. */
export async function GET(): Promise<Response> {
  const providers = PROVIDERS.map((p) => ({
    id: p.id,
    name: p.name,
    envKey: p.envKey,
    configured: !!process.env[p.envKey],
  }));
  const anyConfigured = providers.some((p) => p.configured);
  return Response.json({ providers, mode: anyConfigured ? "live" : "demo" });
}
