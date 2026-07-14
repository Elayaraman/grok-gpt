import { useState, useEffect } from 'react';
import { Sidebar } from './components/sidebar/Sidebar';
import { ChatArea } from './components/chat/ChatArea';
import { InputArea } from './components/chat/InputArea';
import { useChat } from './hooks/use-chat';
import { useChatStore } from './store/chat-store';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeConversationId = useChatStore((state) => state.activeConversationId);
  const conversationOrder = useChatStore((state) => state.conversationOrder);
  const createConversation = useChatStore((state) => state.createConversation);
  const conversations = useChatStore((state) => state.conversations);

  const {
    isGenerating,
    chatError,
    sendMessage,
    stopGeneration,
    regenerateLastMessage,
    clearError,
  } = useChat();

  // Create an initial conversation on start if history is empty
  useEffect(() => {
    if (conversationOrder.length === 0) {
      createConversation();
    }
  }, [conversationOrder, createConversation]);

  const activeConv = activeConversationId ? conversations[activeConversationId] : null;

  return (
    <div className="bg-brand-bg text-brand-text h-screen overflow-hidden flex font-sans antialiased selection:bg-brand-terracotta/20 selection:text-brand-text">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main App Area */}
      <div className="flex-1 flex flex-col h-full relative min-w-0">
        {/* Top Navigation */}
        <header className="flex justify-between items-center h-[72px] px-lg max-w-full bg-brand-bg/90 backdrop-blur-md z-20 sticky top-0 border-b border-brand-border">
          <div className="flex items-center gap-md">
            {/* Hamburger button for mobile */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-brand-text/60 p-xs rounded-full hover:bg-black/5 transition-colors"
            >
              <span className="material-symbols-outlined" style={{ fontWeight: 200 }}>
                menu
              </span>
            </button>
            <div className="flex items-center gap-xs">
              <h1 className="font-serif text-[24px] font-semibold text-brand-text tracking-tight md:hidden">
                GrokGPT
              </h1>
              {activeConv && (
                <span className="hidden md:inline-block text-[14px] text-brand-text/40 font-medium">
                  {activeConv.title}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-sm">
            {/* Create New Plan Button */}
            <button
              onClick={() => createConversation()}
              className="flex items-center gap-xs px-sm py-[8px] border border-brand-border rounded-full hover:border-brand-text/20 transition-all text-[14px] text-brand-text/80 hover:bg-black/[2%] cursor-pointer"
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

        {/* Main Workspace */}
        <main className="flex-1 flex flex-col h-full relative bg-brand-bg">
          {/* Chat Container */}
          <ChatArea
            onSend={sendMessage}
            onRegenerate={regenerateLastMessage}
            isGenerating={isGenerating}
          />

          {/* Form Composer */}
          <InputArea
            onSend={sendMessage}
            onStop={stopGeneration}
            isGenerating={isGenerating}
            error={chatError}
            onClearError={clearError}
          />
        </main>
      </div>
    </div>
  );
}

export default App;
