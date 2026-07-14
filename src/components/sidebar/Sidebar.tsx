import { useState, useRef, useEffect } from 'react';
import { useChatStore } from '../../store/chat-store';

export function Sidebar() {
  const conversations = useChatStore((state) => state.conversations);
  const conversationOrder = useChatStore((state) => state.conversationOrder);
  const activeConversationId = useChatStore((state) => state.activeConversationId);
  const setActiveConversation = useChatStore((state) => state.setActiveConversation);
  const deleteConversation = useChatStore((state) => state.deleteConversation);
  const updateConversationTitle = useChatStore((state) => state.updateConversationTitle);

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

  return (
    <aside className="w-[280px] h-full border-r border-brand-border bg-brand-bg/80 backdrop-blur flex flex-col hidden md:flex shrink-0">
      {/* History List */}
      <div className="flex-1 overflow-y-auto p-md flex flex-col gap-xs">
        <div className="text-[12px] font-medium text-brand-text/40 px-sm pb-xs tracking-wider uppercase">
          History
        </div>

        {conversationOrder.length === 0 ? (
          <div className="px-sm py-4 text-[13px] text-brand-text/40 italic">No conversations yet</div>
        ) : (
          conversationOrder.map((id) => {
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
    </aside>
  );
}
