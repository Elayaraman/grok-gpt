// ---------------------------------------------------------------------------
// Groq API Types — OpenAI-compatible chat completions
// ---------------------------------------------------------------------------

/** Roles accepted by the Groq chat completions API. */
export type ApiMessageRole = 'system' | 'user' | 'assistant';

/** A single message in the chat completions request. */
export interface ApiMessage {
  readonly role: ApiMessageRole;
  readonly content: string;
}

/** Request body for POST /openai/v1/chat/completions. */
export interface ChatCompletionRequest {
  readonly model: string;
  readonly messages: readonly ApiMessage[];
  readonly stream: true;
  readonly temperature?: number;
  readonly max_completion_tokens?: number;
  readonly top_p?: number;
  readonly stop?: string | readonly string[] | null;
}

// ---------------------------------------------------------------------------
// Streaming response chunks (SSE `data:` payloads)
// ---------------------------------------------------------------------------

/** Token delta within a streaming chunk. */
export interface ChunkDelta {
  readonly role?: ApiMessageRole;
  readonly content?: string;
}

/** A single choice inside a streaming chunk. */
export interface ChunkChoice {
  readonly index: number;
  readonly delta: ChunkDelta;
  readonly finish_reason: string | null;
}

/** Top-level shape of each SSE `data:` JSON payload. */
export interface ChatCompletionChunk {
  readonly id: string;
  readonly object: string;
  readonly created: number;
  readonly model: string;
  readonly choices: readonly ChunkChoice[];
}

// ---------------------------------------------------------------------------
// Error response
// ---------------------------------------------------------------------------

/** Shape of a Groq API error response body. */
export interface ApiErrorResponse {
  readonly error: {
    readonly message: string;
    readonly type: string;
    readonly code: string | null;
  };
}

// ---------------------------------------------------------------------------
// Service configuration
// ---------------------------------------------------------------------------

export interface StreamOptions {
  /** Groq API key (required). */
  readonly apiKey: string;
  /** Messages to send. */
  readonly messages: readonly ApiMessage[];
  /** Model identifier. */
  readonly model?: string;
  /** Temperature (0–2). */
  readonly temperature?: number;
  /** Maximum completion tokens. */
  readonly maxCompletionTokens?: number;
  /** Top-p nucleus sampling. */
  readonly topP?: number;
  /** AbortSignal for cancellation. */
  readonly signal?: AbortSignal;
}
