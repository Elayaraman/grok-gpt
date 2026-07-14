PRD — Streaming Chat UI (AI Chat Client)
1. One-liner
A client-only, streaming AI chat application with persistent conversation history, built to showcase frontend engineering quality through real-time streaming, thoughtful state management, resilient UX, accessibility, and production-grade architecture—all without requiring a backend.

2. Goals
Deliver true token-by-token streaming from a live AI model.
Persist conversation history across browser refreshes.
Build a polished, distinctive interface rather than a pixel-perfect ChatGPT clone.
Demonstrate clean frontend architecture and maintainable code.
Require zero backend infrastructure.
Run via npm install && npm run dev, requiring only a user-provided API key.

3. Non-goals
To protect the implementation timeline, the following are intentionally excluded:
Authentication or multi-user support
Backend or server-side API proxy
Cloud synchronization
Conversation branching
Message editing
Chat renaming
Image or voice input
Model selection
Theme switching
File uploads
Server-side secret management

4. Tech Stack

Layer
Choice
Reason
Build Tool
Vite + React 18 + TypeScript
Fast startup, lightweight configuration
Styling
Tailwind CSS
Rapid development with consistent design system
State Management
Zustand
Minimal API with excellent developer experience
Persistence
Zustand Persist Middleware
Automatic localStorage persistence with partial state serialization
Markdown
react-markdown + remark-gfm
GitHub-flavored markdown support
Syntax Highlighting
rehype-highlight
Lightweight syntax highlighting with minimal setup
AI Provider
Groq Chat Completions API
Fast inference with generous free tier
Streaming
Fetch + ReadableStream + AbortController
Native browser APIs with complete streaming control


5. High-Level Architecture


graph TD
    PromptInput --> useChat
    useChat --> AIService[AI Service Groq]
    AIService --> StreamingFetch[Streaming Fetch SSE]
    StreamingFetch --> ParseStream[Parse Stream Chunks]
    ParseStream --> AppendTokens[Append Tokens]
    AppendTokens --> ZustandStore[Zustand Store]
    ZustandStore --> Persist[Persist localStorage]
    Persist --> ChatWindow[Chat Window]


6. Data Architecture
Conversation

interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
}


Message

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: number;
  status: 'streaming' | 'completed' | 'aborted' | 'error';
}

Message status:
streaming
completed
aborted
error

Store Structure
The chat store is normalized for efficient updates.
{
    conversations: Record<string, Conversation>

    conversationOrder: string[]

    activeConversationId: string | null

    apiKey: string
}

Only the following data is persisted:
conversations
conversationOrder
activeConversationId
apiKey
Transient UI state remains in React hooks and is never serialized.
Examples:
AbortController
Streaming status
Hover states
Scroll state
Textarea height
Current streaming statistics

7. Streaming Flow


sequenceDiagram
    participant U as User
    participant S as Store/State
    participant A as API (Groq)
    U->>S: Submit prompt
    S->>S: Add user message
    S->>S: Create empty assistant message
    S->>A: Start streaming request
    loop Streaming
        A->>S: Emit chunk (SSE)
        S->>S: Parse token & update message
        S->>U: UI rerender (auto-scroll)
    end
    A->>S: Stream complete
    S->>S: Mark message completed

Stopping generation:
Stop Button

↓

AbortController.abort()

↓

Network request cancelled

↓

Current assistant message retained

↓

Message status = aborted


8. Feature Scope
Must Have
Conversations
Create new conversation
Delete conversation
Switch conversations
Automatic conversation title from first prompt
Persist conversation history

Chat
Token-by-token streaming
Markdown rendering
GitHub-flavored markdown
Syntax highlighted code blocks
Copy code button
Copy message button
Stop generation
Regenerate latest response
Assistant typing cursor
Auto-scroll while pinned to bottom

Input
Auto-growing textarea
Enter to send
Shift + Enter for newline
Escape stops generation
Disabled while no API key exists
Disabled while streaming

API Key
User-managed Groq API key
Stored locally only
Never hardcoded
Never committed

Error Handling
Friendly error messages for:
Invalid API key (401)
Rate limit exceeded (429)
Network failure
Request aborted
Unexpected server response

Accessibility
Proper button labels
Keyboard navigation
Visible focus indicators
aria-live for streaming responses
Semantic HTML

Performance
React.memo on heavy components
Incremental message updates
Normalized state updates
Partial persistence
Native streaming APIs

9. UI Content Plan
Sidebar
Top
New Chat button
Middle
Conversation list
Active conversation indicator
Relative timestamps
Delete action on hover
Empty state
Nothing here yet — start a chat to see it appear.
Footer
Groq API Key
Label

Groq API Key

Input

gsk_...

Helper Text

Stored locally in your browser only.


Empty Chat Screen
Centered illustration/icon
Heading
What are you working on?
Supporting text
Ask anything. Responses stream in real time.

Active Conversation
User
Right aligned
Filled accent bubble
Assistant
Left aligned
Markdown rendered
No surrounding bubble
Optimized reading width
Streaming
Blinking cursor
Character counter
Elapsed generation time
Hover Actions
Copy
Regenerate (latest assistant response only)
Errors
Human-readable message
Retry action
No raw stack traces

Code Blocks
Dark background
Rounded corners
Language label
Copy button
Syntax highlighting

Input Bar
Features
Auto-growing textarea
Maximum height (~6 lines)
Sticky bottom positioning
States
Empty
Message...

No API key
Add your Groq API key in the sidebar to start

Streaming
Send Button

↓

Stop Button


10. Scrolling Behavior
The interface follows modern AI chat behavior.
If the user remains near the bottom:
Automatically scroll during streaming.
If the user scrolls upward:
Stop automatic scrolling.
Display a floating
↓ New Response

button.
Selecting the button scrolls smoothly to the newest message and resumes automatic scrolling.

graph TD
    Start([Streaming Starts]) --> CheckPos{User at bottom?}
    CheckPos -- Yes --> AutoScroll[Automatically scroll]
    CheckPos -- No --> ManualScroll[Stop auto-scroll]
    ManualScroll --> ShowButton[Display New Response button]
    ShowButton --> UserClick[User clicks button]
    UserClick --> ScrollNew[Scroll to newest message]
    ScrollNew --> Resume[Resume auto-scroll]

11. Animations
Animations remain subtle and inexpensive.
Included
New message appearance
Sidebar selection
Conversation deletion
Hover transitions
Cursor blink
Excluded
Token-by-token animations
Heavy motion libraries
Physics-based transitions
Implementation uses CSS transitions only.

12. Success Criteria
The assignment is considered complete when:
Project starts with npm install && npm run dev
No backend is required
Only a Groq API key is needed
Conversations survive refreshes
Streaming occurs token-by-token
Stop generation works without crashes
Partial responses remain after abort
Markdown renders correctly
Syntax-highlighted code blocks support copying
Regenerate latest response functions correctly
Error states are understandable
Interface remains usable down to approximately 375px viewport width
Accessibility fundamentals are implemented
Performance remains smooth during long streaming sessions

13. Time Budget

Task
Estimate
Project scaffold, Tailwind, Zustand
30 min
Store architecture & persistence
20 min
Streaming service + SSE parsing
45 min
Sidebar & conversation management
45 min
Chat window & markdown rendering
45 min
Input bar, stop, regenerate
45 min
Auto-scroll, copy actions, error states
30 min
Accessibility, responsive polish, README
30 min
Total
~5 hours


14. Engineering Principles
Keep architecture simple without unnecessary abstractions.
Optimise for readability over cleverness.
Separate persistent application state from transient UI state.
Prefer native browser APIs over additional dependencies.
Fail gracefully with actionable error messages.
Prioritise responsiveness and perceived performance.
Deliver a polished, production-quality frontend within a constrained implementation window.

