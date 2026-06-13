import { ProviderRouter } from "@gsmaxall/sdk";

export const runtime = "nodejs";

const router = new ProviderRouter();

/** Returns the unified model catalog for the model selector. */
export async function GET(): Promise<Response> {
  return Response.json({ models: router.listModels() });
}
