import { useState, useRef, useEffect } from 'react';
import { useChatStore } from '../../store/chat-store';

export function Sidebar() {
  const conversations = useChatStore((state) => state.conversations);
  const conversationOrder = useChatStore((state) => state.conversationOrder);
  const activeConversationId = useChatStore((state) => state.activeConversationId);
  const setActiveConversation = useChatStore((state) => state.setActiveConversation);
  const deleteConversation = useChatStore((state) => state.deleteConversation);
  const clearAllConversations = useChatStore((state) => state.clearAllConversations);
  const updateConversationTitle = useChatStore((state) => state.updateConversationTitle);

  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);

  // Focus input when editing starts
  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingId]);

  const handleStartRename = (id: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(id);
    setEditTitle(currentTitle);
  };

  const handleSaveRename = (id: string) => {
    if (editTitle.trim()) {
      updateConversationTitle(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleKeyDown = (id: string, e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveRename(id);
    } else if (e.key === 'Escape') {
      setEditingId(null);
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this chat?')) {
      deleteConversation(id);
    }
  };

  const handleClearAll = () => {
    if (conversationOrder.length === 0) return;

    if (confirm('Are you sure you want to clear all chats?')) {
      clearAllConversations();
      setEditingId(null);
      setSearchQuery('');
    }
  };

  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const filteredConversationOrder = conversationOrder.filter((id) => {
    const conversation = conversations[id];
    return conversation && conversation.title.toLowerCase().includes(normalizedSearchQuery);
  });

  return (
    <aside className="w-[280px] h-full border-r border-brand-border bg-brand-bg/80 backdrop-blur flex flex-col hidden md:flex shrink-0">
      <div className="p-md pb-sm">
        <label className="relative block">
          <span className="sr-only">Search chats</span>
          <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-brand-text/40">
            search
          </span>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search chats"
            className="w-full rounded-lg border border-brand-border bg-white/50 py-2 pl-10 pr-9 text-[13px] text-brand-text placeholder:text-brand-text/40 outline-none transition-colors focus:border-brand-terracotta/50 focus:ring-2 focus:ring-brand-terracotta/10"
          />
        </label>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto p-md flex flex-col gap-xs">
        <div className="text-[12px] font-medium text-brand-text/40 px-sm pb-xs tracking-wider uppercase">
          History
        </div>

        {conversationOrder.length === 0 ? (
          <div className="px-sm py-4 text-[13px] text-brand-text/40 italic">No conversations yet</div>
        ) : filteredConversationOrder.length === 0 ? (
          <div className="px-sm py-4 text-[13px] text-brand-text/40 italic">No chats found</div>
        ) : (
          filteredConversationOrder.map((id) => {
            const conv = conversations[id];
            if (!conv) return null;

            const isActive = activeConversationId === id;
            const isEditing = editingId === id;

            return (
              <div
                key={id}
                onClick={() => setActiveConversation(id)}
                className={`group relative flex items-center w-full px-sm py-2 rounded-lg text-left transition-colors duration-200 text-[14px] cursor-pointer ${
                  isActive
                    ? 'bg-brand-terracotta/10 text-brand-terracotta font-medium'
                    : 'text-brand-text/60 hover:text-brand-text hover:bg-black/5'
                }`}
              >
                {isEditing ? (
                  <input
                    ref={editInputRef}
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onBlur={() => handleSaveRename(id)}
                    onKeyDown={(e) => handleKeyDown(id, e)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full bg-transparent border-none focus:outline-none focus:ring-0 p-0 text-[14px] text-brand-text"
                  />
                ) : (
                  <>
                    <span className="truncate pr-10 block flex-1" onDoubleClick={(e) => handleStartRename(id, conv.title, e)}>
                      {conv.title}
                    </span>

                    {/* Action buttons (shown on hover/active) */}
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                      <button
                        onClick={(e) => handleStartRename(id, conv.title, e)}
                        title="Rename chat"
                        className="p-1 text-brand-text/40 hover:text-brand-text hover:bg-black/5 rounded-md transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]" style={{ fontWeight: 300 }}>
                          edit
                        </span>
                      </button>
                      <button
                        onClick={(e) => handleDelete(id, e)}
                        title="Delete chat"
                        className="p-1 text-brand-text/40 hover:text-brand-terracotta hover:bg-black/5 rounded-md transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]" style={{ fontWeight: 300 }}>
                          delete
                        </span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="border-t border-brand-border p-md">
        <button
          type="button"
          onClick={handleClearAll}
          disabled={conversationOrder.length === 0}
          className="flex w-full items-center justify-center gap-xs rounded-lg border border-brand-terracotta/20 px-sm py-2 text-[13px] font-medium text-brand-terracotta transition-colors hover:bg-brand-terracotta/10 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span className="material-symbols-outlined text-[18px]" style={{ fontWeight: 300 }}>
            delete_sweep
          </span>
          <span>Clear all chats</span>
        </button>
      </div>
    </aside>
  );
}
