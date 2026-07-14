import { useState, useRef, useCallback, useEffect } from 'react';
import { useChatStore } from '../store/chat-store';
import { streamChatCompletion, GroqAbortError } from '../services/ai/groq-service';
import type { Message } from '../types/chat';
import type { ApiMessage } from '../services/ai';

export function useChat() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const activeConversationId = useChatStore((state) => state.activeConversationId);
  const conversations = useChatStore((state) => state.conversations);
  const createConversation = useChatStore((state) => state.createConversation);
  const addMessage = useChatStore((state) => state.addMessage);
  const updateMessage = useChatStore((state) => state.updateMessage);
  const removeMessage = useChatStore((state) => state.removeMessage);
  const getActiveConversation = useChatStore((state) => state.getActiveConversation);
  const updateConversationTitle = useChatStore((state) => state.updateConversationTitle);

  const abortControllerRef = useRef<AbortController | null>(null);
  const isGeneratingRef = useRef(false);

  // Clean up any active generation on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGenerating(false);
    isGeneratingRef.current = false;
  }, []);

  const startStreaming = useCallback(
    async (targetConversationId: string, messagesToSend: readonly ApiMessage[], assistantMessageId: string) => {
      const apiKey = import.meta.env.GROK_KEY;
      if (!apiKey) {
        setChatError('Groq API Key is not configured. Please define GROK_KEY in your .env file.');
        updateMessage(targetConversationId, assistantMessageId, {
          content: 'Error: GROK_KEY is not defined in the environment. Please add it to your .env file.',
          status: 'error',
        });
        setIsGenerating(false);
        isGeneratingRef.current = false;
        return;
      }

      setIsGenerating(true);
      isGeneratingRef.current = true;
      setChatError(null);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      let contentAccumulator = '';

      try {
        const stream = streamChatCompletion({
          apiKey,
          messages: messagesToSend,
          signal: controller.signal,
        });

        for await (const chunk of stream) {
          if (controller.signal.aborted) {
            throw new GroqAbortError();
          }

          const token = chunk.choices[0]?.delta.content;
          if (token) {
            contentAccumulator += token;
            updateMessage(targetConversationId, assistantMessageId, {
              content: contentAccumulator,
            });
          }
        }

        updateMessage(targetConversationId, assistantMessageId, {
          status: 'completed',
        });
      } catch (error: any) {
        console.error('Streaming error:', error);
        if (error instanceof GroqAbortError || (error instanceof DOMException && error.name === 'AbortError')) {
          updateMessage(targetConversationId, assistantMessageId, {
            status: 'aborted',
          });
        } else {
          const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
          setChatError(errorMessage);
          updateMessage(targetConversationId, assistantMessageId, {
            content: contentAccumulator 
              ? `${contentAccumulator}\n\n[Generation error: ${errorMessage}]`
              : `Error: ${errorMessage}`,
            status: 'error',
          });
        }
      } finally {
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
        }
        setIsGenerating(false);
        isGeneratingRef.current = false;
      }
    },
    [updateMessage]
  );

  const sendMessage = useCallback(
    async (content: string) => {
      if (isGeneratingRef.current) return;

      let conversationId = activeConversationId;
      if (!conversationId) {
        conversationId = createConversation();
      }

      // Add user message
      const userMessageId = crypto.randomUUID();
      const userMessage: Message = {
        id: userMessageId,
        role: 'user',
        content,
        createdAt: Date.now(),
        status: 'completed',
      };
      addMessage(conversationId, userMessage);

      // Auto-update conversation title if it is default
      const currentConversation = conversations[conversationId];
      if (currentConversation && currentConversation.title === 'New Chat') {
        const snippet = content.trim().slice(0, 30);
        const title = snippet.length < content.trim().length ? `${snippet}...` : snippet;
        updateConversationTitle(conversationId, title);
      }

      // Add empty assistant shell message
      const assistantMessageId = crypto.randomUUID();
      const assistantMessage: Message = {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        createdAt: Date.now(),
        status: 'streaming',
      };
      addMessage(conversationId, assistantMessage);

      // Re-read active conversation messages to compile request
      const updatedConversation = useChatStore.getState().conversations[conversationId];
      if (!updatedConversation) return;

      // Build message array for Groq API (exclude the last streaming assistant message)
      const messagesToSend: ApiMessage[] = updatedConversation.messages
        .filter((msg) => msg.id !== assistantMessageId && msg.status !== 'error')
        .map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

      await startStreaming(conversationId, messagesToSend, assistantMessageId);
    },
    [activeConversationId, createConversation, addMessage, conversations, updateConversationTitle, startStreaming]
  );

  const regenerateLastMessage = useCallback(async () => {
    if (isGeneratingRef.current || !activeConversationId) return;

    const currentConversation = getActiveConversation();
    if (!currentConversation || currentConversation.messages.length === 0) return;

    const messages = [...currentConversation.messages];
    const lastMsg = messages[messages.length - 1];

    let messagesToSend: ApiMessage[] = [];

    if (lastMsg.role === 'assistant') {
      // Remove the last assistant message
      removeMessage(activeConversationId, lastMsg.id);
      
      const remainingMessages = messages.slice(0, -1);
      messagesToSend = remainingMessages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));
    } else if (lastMsg.role === 'user') {
      // The last message is user message, which means previous assistant generation failed or was deleted.
      messagesToSend = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));
    }

    if (messagesToSend.length === 0) return;

    // Add empty assistant message
    const newAssistantMessageId = crypto.randomUUID();
    const assistantMessage: Message = {
      id: newAssistantMessageId,
      role: 'assistant',
      content: '',
      createdAt: Date.now(),
      status: 'streaming',
    };
    addMessage(activeConversationId, assistantMessage);

    await startStreaming(activeConversationId, messagesToSend, newAssistantMessageId);
  }, [activeConversationId, getActiveConversation, removeMessage, addMessage, startStreaming]);

  const clearError = useCallback(() => {
    setChatError(null);
  }, []);

  return {
    isGenerating,
    chatError,
    sendMessage,
    stopGeneration,
    regenerateLastMessage,
    clearError,
  };
}
