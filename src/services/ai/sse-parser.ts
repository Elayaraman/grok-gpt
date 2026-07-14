// ---------------------------------------------------------------------------
// SSE Stream Parser — Parses Server-Sent Events from a ReadableStream
// ---------------------------------------------------------------------------

/**
 * Parses an SSE byte stream into typed JSON payloads.
 *
 * Handles:
 * - Multi-line buffering (chunks may split across `data:` boundaries)
 * - The `data: [DONE]` termination sentinel
 * - Blank keep-alive lines
 *
 * Yields one parsed object per `data:` line that contains valid JSON.
 */
export async function* parseSSEStream<T>(
  stream: ReadableStream<Uint8Array>,
  signal?: AbortSignal,
): AsyncGenerator<T> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      if (signal?.aborted) return;

      const { done, value } = await reader.read();
      if (done) return;

      buffer += decoder.decode(value, { stream: true });

      // SSE events are separated by double newlines, but individual
      // `data:` lines are terminated by a single newline. We split on
      // newlines and process each line independently.
      const lines = buffer.split('\n');

      // The last element may be an incomplete line — keep it in the buffer.
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();

        // Skip empty lines (keep-alive) and non-data fields.
        if (!trimmed || !trimmed.startsWith('data:')) continue;

        const payload = trimmed.slice('data:'.length).trim();

        // End-of-stream sentinel.
        if (payload === '[DONE]') return;

        try {
          yield JSON.parse(payload) as T;
        } catch {
          // Malformed JSON — skip this line rather than crashing the stream.
          // In production you might log this to an error tracking service.
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
