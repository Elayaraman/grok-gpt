import { useChatStore } from '../../store/chat-store';

export function Header() {
  const createConversation = useChatStore((state) => state.createConversation);

  return (
    <header className="flex justify-between items-center h-[72px] px-lg max-w-full bg-brand-bg/90 backdrop-blur-md z-20 sticky top-0 border-b border-brand-border">
      <div className="flex items-center gap-md">
        <h1 className="font-serif text-[24px] font-semibold text-brand-text tracking-tight">GrokGPT</h1>
      </div>

      <div className="flex items-center gap-sm">
        {/* Create New Plan Button */}
        <button
          onClick={() => createConversation()}
          className="hidden md:flex items-center gap-xs px-sm py-[8px] border border-brand-border rounded-full hover:border-brand-text/20 transition-all text-[14px] text-brand-text/80"
        >
          <span className="material-symbols-outlined text-[18px]" style={{ fontWeight: 200 }}>
            add
          </span>
          <span>New Plan</span>
        </button>
      </div>
    </header>
  );
}
