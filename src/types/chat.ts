// ---------------------------------------------------------------------------
// Domain Types — Streaming Chat UI
// ---------------------------------------------------------------------------

/** Identifies who authored a message. */
export type MessageRole = 'user' | 'assistant';

/** Lifecycle status of a single message. */
export type MessageStatus = 'streaming' | 'completed' | 'aborted' | 'error';

/** A single chat message within a conversation. */
export interface Message {
  readonly id: string;
  readonly role: MessageRole;
  readonly content: string;
  readonly createdAt: number;
  readonly status: MessageStatus;
}

/** A conversation containing an ordered list of messages. */
export interface Conversation {
  readonly id: string;
  readonly title: string;
  readonly createdAt: number;
  readonly updatedAt: number;
  readonly messages: readonly Message[];
}

// ---------------------------------------------------------------------------
// Store Types
// ---------------------------------------------------------------------------

/** The subset of ChatStore that is serialized to localStorage. */
export interface PersistedState {
  conversations: Record<string, Conversation>;
  conversationOrder: string[];
  activeConversationId: string | null;
  apiKey: string;
}

/** Partial update payload for a message (excludes identity fields). */
export type MessageUpdate = Partial<Omit<Message, 'id' | 'role' | 'createdAt'>>;

/** Complete Zustand store shape: persisted state + actions. */
export interface ChatStore extends PersistedState {
  // Conversation actions
  createConversation: () => string;
  deleteConversation: (id: string) => void;
  clearAllConversations: () => void;
  setActiveConversation: (id: string | null) => void;
  updateConversationTitle: (id: string, title: string) => void;

  // Message actions
  addMessage: (conversationId: string, message: Message) => void;
  updateMessage: (conversationId: string, messageId: string, updates: MessageUpdate) => void;
  removeMessage: (conversationId: string, messageId: string) => void;
  clearMessages: (conversationId: string) => void;

  // API key
  setApiKey: (key: string) => void;

  // Utilities
  getActiveConversation: () => Conversation | null;
}
