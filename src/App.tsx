import { useEffect } from 'react';
import { Sidebar } from './components/sidebar/Sidebar';
import { ChatArea } from './components/chat/ChatArea';
import { InputArea } from './components/chat/InputArea';
import { Header } from './components/layout/Header';
import { useChat } from './hooks/use-chat';
import { useChatStore } from './store/chat-store';

function App() {
  const conversationOrder = useChatStore((state) => state.conversationOrder);
  const createConversation = useChatStore((state) => state.createConversation);

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

  return (
    <div className="bg-brand-bg text-brand-text h-screen overflow-hidden flex flex-col font-sans antialiased selection:bg-brand-terracotta/20 selection:text-brand-text">
      {/* Top Navigation - spans full width */}
      <Header />

      {/* Content wrapper containing sidebar and main side-by-side */}
      <div className="flex-1 flex min-h-0 relative">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Workspace */}
        <main className="flex-1 flex flex-col h-full relative bg-brand-bg min-w-0">
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
