import { useEffect, useRef } from 'react';
import { useChatStore } from '../../store/chat-store';
import { MessageItem } from './MessageItem';

interface ChatAreaProps {
  onSend: (content: string) => void;
  onRegenerate: () => void;
  isGenerating: boolean;
}

const SUGGESTED_PROMPTS = [
  "Focus on the Tuscan drive: suggest a scenic route from Florence to Siena avoiding highways.",
  "Suggest boutique hotels in Florence with historical charm.",
  "Create a 3-day itinerary for exploring Amalfi coast.",
  "What are some must-try local dishes in Kyoto?"
];

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
      className="flex-1 overflow-y-auto p-lg pb-[180px] scroll-smooth bg-brand-bg"
      id="chat-container"
    >
      <div className="max-w-[850px] mx-auto flex flex-col gap-[48px]">
        {messages.length === 0 ? (
          /* Empty / Welcome State */
          <div className="flex flex-col gap-[48px] py-md">
            {/* Bot Initial Message */}
            <div className="flex gap-md items-start max-w-[85%]">
              <div className="pt-[8px] text-brand-text/90 leading-relaxed text-[16px]">
                <p>
                  Hello! I'm Cora, your personal travel companion. I see we were planning a two-week trip to Italy.
                  Shall we start by looking at some boutique hotels in Florence, or would you prefer to map out the
                  Tuscan countryside drive first?
                </p>
              </div>
            </div>

            {/* Suggested Prompts */}
            <div className="flex flex-col gap-sm ml-[4px] md:ml-[0px] mt-xs">
              <span className="text-[12px] font-medium text-brand-text/30 uppercase tracking-wider pl-1">
                Suggested plans
              </span>
              <div className="flex flex-wrap gap-sm">
                {SUGGESTED_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSend(prompt)}
                    disabled={isGenerating}
                    className="text-left px-sm py-[10px] border border-brand-border rounded-xl hover:border-brand-sage/40 hover:bg-brand-sage/5 transition-all duration-200 text-[14px] text-brand-text/80 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed max-w-full"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>
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
