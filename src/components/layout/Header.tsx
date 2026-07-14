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

        {/* Avatar Profile */}
        <div className="w-8 h-8 rounded-full border border-brand-border overflow-hidden">
          <img
            alt="User Profile"
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAcYrqdMGREKHbfWQ1OqG1t71vqFKAcEQ_ORTsroxj5CgNe6xLKHCOyaGlFRXNgOCnwGvyA6Tonkyr5rrweU8QzGff5mikNORORSjEwxwERndueegI81KNDlFGaeu0FI8x15ktdS-nVl3pDkuAI-RPjZOhEnStVPHas3P5EosQC2mLDYIdXqBebT4bcD1PSIc5-5NqDdCNvcjgm-lgJrqYFEirFBUKdSK7sjqhuI_FEJxd86abfJh2cEFoNllLEsxPoqhB9eAIBMyE"
          />
        </div>
      </div>
    </header>
  );
}
