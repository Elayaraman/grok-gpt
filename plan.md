# AI Chat UI — Implementation Plan (Option 1: Client-side Conversation History)

## Overview

This application follows a **client-first architecture** where the browser is the source of truth.

The AI provider (Groq) is treated as a **stateless inference engine**.

No conversation history is stored on the server.

Every request rebuilds the conversation context from the locally persisted messages.

---

# Architecture

```
                   User

                     │

                     ▼

              Prompt Input

                     │

                     ▼

              useChat Hook

                     │

                     ▼

             Zustand Store
      (Conversation Source of Truth)

                     │

                     ▼

          buildMessages(conversation)

                     │

                     ▼

             Groq Chat API

                     │

          Token Stream (SSE)

                     │

                     ▼

          Update Assistant Message

                     │

                     ▼

            Persist to localStorage
```

---

# Core Principle

The browser owns every conversation.

The AI remembers nothing.

Every request contains enough context for the model to continue the conversation.

---

# Conversation Lifecycle

## New Chat

```
User clicks "New Chat"

↓

Create Conversation

↓

Store

{
    id,
    title: "New Chat",
    createdAt,
    updatedAt,
    messages:[]
}

↓

Set Active Conversation
```

---

## User Sends Message

```
User enters prompt

↓

Create User Message

↓

Append to Conversation

↓

Persist Store

↓

Build AI Request

↓

Start Streaming
```

---

## AI Response

```
Create Empty Assistant Message

↓

Append Assistant Message

↓

Start Streaming

↓

Receive Token

↓

Append Token

↓

Update Store

↓

Persist

↓

Repeat Until Stream Ends

↓

Mark Message Completed
```

---

## Refresh

```
Browser Refresh

↓

Zustand Persist

↓

Restore Store

↓

Restore Conversations

↓

Restore Active Conversation

↓

Application Ready
```

No API calls are required during restoration.

---

# Conversation Storage

```
Conversation

├── id
├── title
├── createdAt
├── updatedAt
└── messages[]

        │

        ├── Message
        │      id
        │      role
        │      content
        │      createdAt
        │      status
        │
        └── ...
```

---

# Source of Truth

Only one place owns conversation history.

```
Zustand Store

↓

Persist Middleware

↓

localStorage
```

Every screen renders from this state.

No duplicated state.

No temporary copies.

---

# Building Requests

Before every API call

```
Conversation

↓

buildMessages()

↓

messages[]

↓

POST /chat/completions
```

Example

```
Conversation

User:
Hello

Assistant:
Hi!

User:
Explain React Fiber
```

becomes

```json
[
    {
        "role":"user",
        "content":"Hello"
    },
    {
        "role":"assistant",
        "content":"Hi!"
    },
    {
        "role":"user",
        "content":"Explain React Fiber"
    }
]
```

The complete message history is sent on every request.

---

# Why This Works

Groq Chat Completions is stateless.

It does not remember previous requests.

Instead,

every request provides the complete conversation.

This is how ChatGPT-style applications are typically implemented on top of stateless chat completion APIs.

---

# Streaming Flow

```
User Message

↓

Append User Message

↓

Create Empty Assistant Message

↓

Start Fetch

↓

ReadableStream

↓

SSE Chunk

↓

Extract Token

↓

Append Token

↓

Update Assistant Message

↓

Persist

↓

Repeat

↓

Finish

↓

status = completed
```

---

# Stop Generation

```
Stop Button

↓

AbortController.abort()

↓

Fetch Cancelled

↓

Keep Partial Response

↓

status = aborted
```

No content is lost.

The user can continue the conversation from the partial response.

---

# Regenerate

```
Locate Last Assistant Message

↓

Remove Assistant Message

↓

Rebuild Request

↓

Send Again

↓

Stream New Response
```

The previous user prompt remains unchanged.

---

# Persistence Strategy

Persist only durable application state.

Persist

- conversations
- conversationOrder
- activeConversationId
- apiKey

Do NOT Persist

- AbortController
- Streaming state
- Loading flags
- Hover states
- Scroll position
- Textarea height
- Temporary UI state

---

# Error Recovery

Network Error

```
Current Messages

↓

Remain Unchanged

↓

Assistant Message

↓

status = error

↓

Retry Available
```

---

Abort

```
Streaming

↓

Abort

↓

Keep Generated Tokens

↓

status = aborted
```

---

Invalid API Key

```
401

↓

Display Friendly Error

↓

Conversation Remains Intact
```

---

Rate Limit

```
429

↓

Display Retry Message

↓

No Data Lost
```

---

# Advantages

- Extremely simple architecture
- No backend required
- Easy debugging
- Automatic persistence
- Offline conversation history
- Minimal moving parts
- Easy to migrate to a backend later
- AI provider can be replaced without changing application state

---

# Trade-offs

Advantages

✅ Fast implementation

✅ Small codebase

✅ Perfect for interview assignments

✅ No infrastructure

Disadvantages

❌ Entire conversation is sent every request

❌ Request size grows over time

❌ Eventually limited by the model's context window

These limitations are acceptable for this project's scope.

---

# Future Improvements

If conversations become very large, the architecture can evolve without changing the UI.

```
Conversation

↓

buildMessages()

↓

Summarize Older Messages

↓

Keep Recent Messages

↓

Send Optimized Context
```

Or later

```
Conversation Database

↓

Embeddings

↓

Semantic Search

↓

Relevant Context

↓

Groq
```

Since every request already flows through `buildMessages()`, these improvements require changing only a single layer instead of the entire application.

---

# Guiding Principles

- The browser owns the conversation.
- The AI provider is stateless.
- Every request is self-contained.
- Persist only durable state.
- Keep transient UI state out of persistence.
- Prefer simple architecture over premature optimization.
- Design for extension, optimize only when necessary.