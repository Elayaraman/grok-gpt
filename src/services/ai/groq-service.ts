// ---------------------------------------------------------------------------
// Groq Streaming Service — Native fetch + ReadableStream + AbortController
// ---------------------------------------------------------------------------

import type {
  ApiErrorResponse,
  ChatCompletionChunk,
  ChatCompletionRequest,
  StreamOptions,
} from './types';
import { parseSSEStream } from './sse-parser';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const MODELS = ['qwen/qwen3-32b', 'qwen/qwen3.6-27b'] as const;
// Toggle index — flips between 0 and 1 on each request
let modelToggle = 0;
const getNextModel = () => {
  const model = MODELS[modelToggle % MODELS.length];
  modelToggle++;
  return model;
};

// ---------------------------------------------------------------------------
// Error types
// ---------------------------------------------------------------------------

export class GroqApiError extends Error {
  readonly status: number;
  readonly code: string | null;

  constructor(message: string, status: number, code: string | null = null) {
    super(message);
    this.name = 'GroqApiError';
    this.status = status;
    this.code = code;
  }
}

export class GroqNetworkError extends Error {
  override readonly cause: unknown;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = 'GroqNetworkError';
    this.cause = cause;
  }
}

export class GroqAbortError extends Error {
  constructor() {
    super('Request was aborted');
    this.name = 'GroqAbortError';
  }
}

// ---------------------------------------------------------------------------
// Human-readable error messages
// ---------------------------------------------------------------------------

function humanErrorMessage(status: number, apiMessage: string): string {
  switch (status) {
    case 401:
      return 'Invalid API key. Please check your Groq API key and try again.';
    case 429:
      return 'Rate limit exceeded. Please wait a moment and try again.';
    case 400:
      return `Bad request: ${apiMessage}`;
    case 500:
    case 502:
    case 503:
      return 'Groq servers are temporarily unavailable. Please try again shortly.';
    default:
      return `Unexpected error (${status}): ${apiMessage}`;
  }
}

// ---------------------------------------------------------------------------
// Core streaming function
// ---------------------------------------------------------------------------

/**
 * Streams chat completion tokens from the Groq API.
 *
 * Yields individual `ChatCompletionChunk` objects as they arrive via SSE.
 * Callers can extract `chunk.choices[0].delta.content` for token text
 * and `chunk.choices[0].finish_reason` for stream termination.
 *
 * @example
 * ```ts
 * const controller = new AbortController();
 *
 * for await (const chunk of streamChatCompletion({
 *   apiKey: 'gsk_...',
 *   messages: [{ role: 'user', content: 'Hello!' }],
 *   signal: controller.signal,
 * })) {
 *   const token = chunk.choices[0]?.delta.content;
 *   if (token) process.stdout.write(token);
 * }
 * ```
 */
export async function* streamChatCompletion(
  options: StreamOptions,
): AsyncGenerator<ChatCompletionChunk> {
  const {
    apiKey,
    messages,
    model = getNextModel(),
    temperature = 0.6,
    maxCompletionTokens = 4096,
    topP = 0.95,
    signal,
  } = options;

  const body: ChatCompletionRequest = {
    model,
    messages,
    stream: true,
    temperature,
    max_completion_tokens: maxCompletionTokens,
    top_p: topP,
  };

  let response: Response;

  try {
    response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      signal,
    });
  } catch (error: unknown) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new GroqAbortError();
    }
    throw new GroqNetworkError(
      'Failed to connect to Groq. Please check your network connection.',
      error,
    );
  }

  // Handle HTTP error responses
  if (!response.ok) {
    let apiMessage = 'Unknown error';
    let code: string | null = null;

    try {
      const errorBody = (await response.json()) as ApiErrorResponse;
      apiMessage = errorBody.error.message;
      code = errorBody.error.code;
    } catch {
      // Could not parse error body — fall through with defaults.
    }

    throw new GroqApiError(
      humanErrorMessage(response.status, apiMessage),
      response.status,
      code,
    );
  }

  // Ensure we received a readable body
  if (!response.body) {
    throw new GroqNetworkError('Response body is empty — no stream available.');
  }

  // Yield parsed SSE chunks
  yield* parseSSEStream<ChatCompletionChunk>(response.body, signal);
}
