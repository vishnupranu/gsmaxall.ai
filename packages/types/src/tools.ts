/** Unified tool contract — normalizes MCP servers and ACP/plugin tools (see GAP_ANALYSIS G4). */

export type ToolProtocol = "mcp" | "acp" | "native";

export interface ToolParameterSchema {
  /** JSON Schema describing the tool input. */
  type: "object";
  properties: Record<string, unknown>;
  required?: string[];
}

export interface Tool {
  name: string;
  description: string;
  protocol: ToolProtocol;
  parameters: ToolParameterSchema;
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

export interface ToolResult {
  callId: string;
  ok: boolean;
  content: string;
  error?: string;
}
