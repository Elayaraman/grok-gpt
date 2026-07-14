import { useChatStore } from '../../store/chat-store';

export function Header() {
  const createConversation = useChatStore((state) => state.createConversation);

  return (
    <header className="flex justify-between items-center h-[72px] px-lg max-w-full bg-brand-bg/90 backdrop-blur-md z-20 sticky top-0 border-b border-brand-border">
      <div className="flex items-center gap-md">
        <h1 className="font-serif text-[24px] font-semibold text-brand-text tracking-tight">GrokGPT</h1>
      </div>

      <div className="flex items-center gap-sm">
        {/* Create New Chat Button */}
        <button
          onClick={() => createConversation()}
          className="hidden md:flex items-center gap-xs px-sm py-[8px] bg-brand-terracotta text-white border border-brand-terracotta rounded-full hover:bg-brand-terracotta/90 transition-all text-[14px] font-medium shadow-xs"
        >
          <span className="material-symbols-outlined text-[18px]" style={{ fontWeight: 200 }}>
            add
          </span>
          <span>New Chat</span>
        </button>
      </div>
    </header>
  );
}
