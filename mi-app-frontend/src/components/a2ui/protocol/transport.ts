import type { A2UIServerMessage } from "../types";

function normalizeJsonPayload(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (typeof payload === "object" && payload !== null && "messages" in payload) {
    const messages = (payload as { messages?: unknown }).messages;
    return Array.isArray(messages) ? messages : [];
  }
  return [payload];
}

export async function consumeA2UIResponse(
  response: Response,
  onMessage: (message: unknown) => void,
): Promise<void> {
  const contentType = response.headers.get("content-type") ?? "";
  const streamLike =
    contentType.includes("application/a2ui+json") ||
    contentType.includes("application/x-ndjson") ||
    contentType.includes("application/jsonl") ||
    contentType.includes("text/event-stream");

  if (!streamLike || !response.body) {
    const payload = await response.json();
    normalizeJsonPayload(payload).forEach(onMessage);
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  const consumeLine = (rawLine: string) => {
    let line = rawLine.trim();
    if (!line || line.startsWith(":")) return;
    if (line.startsWith("data:")) line = line.slice(5).trim();
    if (!line || line === "[DONE]") return;

    try {
      onMessage(JSON.parse(line) as A2UIServerMessage);
    } catch {
      // Keep malformed lines out of the renderer. Validation/reporting happens
      // at the protocol layer for successfully parsed JSON objects.
    }
  };

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() ?? "";
    lines.forEach(consumeLine);
  }

  buffer += decoder.decode();
  if (buffer.trim()) consumeLine(buffer);
}
