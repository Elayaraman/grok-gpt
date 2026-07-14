import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ChatStore, Conversation, Message, MessageUpdate, PersistedState } from '../types/chat';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const now = (): number => Date.now();

/**
 * Immutably update a single conversation inside the conversations record.
 * Returns a new record only if the conversation exists; otherwise returns
 * the original reference to avoid unnecessary object creation.
 */
function updateConversation(
  conversations: Record<string, Conversation>,
  id: string,
  updater: (conversation: Conversation) => Conversation,
): Record<string, Conversation> {
  const existing = conversations[id];
  if (!existing) return conversations;

  const updated = updater(existing);
  if (updated === existing) return conversations;

  return { ...conversations, [id]: updated };
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      // ----- Persisted state -----
      conversations: {},
      conversationOrder: [],
      activeConversationId: null,
      apiKey: '',

      // ----- Conversation actions -----

      createConversation: (): string => {
        const id = crypto.randomUUID();
        const timestamp = now();

        const conversation: Conversation = {
          id,
          title: 'New Chat',
          createdAt: timestamp,
          updatedAt: timestamp,
          messages: [],
        };

        set((state) => ({
          conversations: { ...state.conversations, [id]: conversation },
          conversationOrder: [id, ...state.conversationOrder],
          activeConversationId: id,
        }));

        return id;
      },

      deleteConversation: (id: string): void => {
        set((state) => {
          const { [id]: _, ...remainingConversations } = state.conversations;
          // Suppress the unused-variable lint — destructuring is the cleanest
          // way to omit a key immutably.
          void _;

          const conversationOrder = state.conversationOrder.filter(
            (conversationId) => conversationId !== id,
          );

          const activeConversationId =
            state.activeConversationId === id
              ? conversationOrder[0] ?? null
              : state.activeConversationId;

          return {
            conversations: remainingConversations,
            conversationOrder,
            activeConversationId,
          };
        });
      },

      setActiveConversation: (id: string | null): void => {
        set({ activeConversationId: id });
      },

      updateConversationTitle: (id: string, title: string): void => {
        set((state) => ({
          conversations: updateConversation(state.conversations, id, (conv) => ({
            ...conv,
            title,
            updatedAt: now(),
          })),
        }));
      },

      // ----- Message actions -----

      addMessage: (conversationId: string, message: Message): void => {
        set((state) => ({
          conversations: updateConversation(state.conversations, conversationId, (conv) => ({
            ...conv,
            messages: [...conv.messages, message],
            updatedAt: now(),
          })),
        }));
      },

      updateMessage: (
        conversationId: string,
        messageId: string,
        updates: MessageUpdate,
      ): void => {
        set((state) => ({
          conversations: updateConversation(state.conversations, conversationId, (conv) => {
            const messageIndex = conv.messages.findIndex((m) => m.id === messageId);
            if (messageIndex === -1) return conv;

            const existingMessage = conv.messages[messageIndex]!;
            const updatedMessage: Message = { ...existingMessage, ...updates };

            const messages = conv.messages.slice();
            messages[messageIndex] = updatedMessage;

            return { ...conv, messages, updatedAt: now() };
          }),
        }));
      },

      removeMessage: (conversationId: string, messageId: string): void => {
        set((state) => ({
          conversations: updateConversation(state.conversations, conversationId, (conv) => ({
            ...conv,
            messages: conv.messages.filter((m) => m.id !== messageId),
            updatedAt: now(),
          })),
        }));
      },

      clearMessages: (conversationId: string): void => {
        set((state) => ({
          conversations: updateConversation(state.conversations, conversationId, (conv) => {
            if (conv.messages.length === 0) return conv;
            return { ...conv, messages: [], updatedAt: now() };
          }),
        }));
      },

      // ----- API key -----

      setApiKey: (key: string): void => {
        set({ apiKey: key });
      },

      // ----- Utilities -----

      getActiveConversation: (): Conversation | null => {
        const { activeConversationId, conversations } = get();
        if (!activeConversationId) return null;
        return conversations[activeConversationId] ?? null;
      },
    }),
    {
      name: 'streaming-chat-storage',
      partialize: (state): PersistedState => ({
        conversations: state.conversations,
        conversationOrder: state.conversationOrder,
        activeConversationId: state.activeConversationId,
        apiKey: state.apiKey,
      }),
    },
  ),
);
