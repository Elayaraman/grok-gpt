import { useEffect, useRef } from 'react';
import { useChatStore } from '../../store/chat-store';
import { MessageItem } from './MessageItem';
import { WelcomeState } from './WelcomeState';

interface ChatAreaProps {
  onSend: (content: string) => void;
  onRegenerate: () => void;
  isGenerating: boolean;
}

export function ChatArea({ onSend, onRegenerate, isGenerating }: ChatAreaProps) {
  const activeConversationId = useChatStore((state) => state.activeConversationId);
  const conversations = useChatStore((state) => state.conversations);
  const activeConversation = activeConversationId ? conversations[activeConversationId] : null;
  const messages = activeConversation?.messages ?? [];

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new message added
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // Auto-scroll on token streaming
  const lastMessageContent = messages[messages.length - 1]?.content;
  const lastMessageStatus = messages[messages.length - 1]?.status;
  useEffect(() => {
    if (lastMessageStatus === 'streaming') {
      bottomRef.current?.scrollIntoView({ behavior: 'auto' });
    }
  }, [lastMessageContent, lastMessageStatus]);

  if (!activeConversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-lg text-center bg-brand-bg">
        <div className="max-w-[500px] flex flex-col items-center gap-md">
          <h2 className="font-serif text-[32px] font-semibold text-brand-text tracking-tight">GrokGPT</h2>
          <p className="text-[16px] text-brand-text/60 leading-relaxed">
            Create a new plan or select a past journey from the history list to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={chatContainerRef}
      className="flex flex-1 overflow-y-auto p-lg pb-[180px] scroll-smooth justify-center"
      id="chat-container"
    >
      <div className="max-w-[850px] mx-auto flex flex-col gap-[48px] w-full">
        {messages.length === 0 ? (
          <WelcomeState onSend={onSend} isGenerating={isGenerating} />
        ) : (
          /* Conversation Messages List */
          messages.map((message, index) => (
            <MessageItem
              key={message.id}
              message={message}
              isLast={index === messages.length - 1}
              onRegenerate={onRegenerate}
            />
          ))
        )}
        <div ref={bottomRef} className="h-2" />
      </div>
    </div>
  );
}
