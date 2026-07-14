import React, { useState, useRef, useEffect } from 'react';

interface InputAreaProps {
  onSend: (content: string) => void;
  onStop: () => void;
  isGenerating: boolean;
  error: string | null;
  onClearError: () => void;
}

export function InputArea({ onSend, onStop, isGenerating, error, onClearError }: InputAreaProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Clear input when successfully sent
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isGenerating) return;

    onSend(input.trim());
    setInput('');

    // Refocus textarea after sending
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 50);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Adjust input focus when streaming state changes
  useEffect(() => {
    if (!isGenerating) {
      textareaRef.current?.focus();
    }
  }, [isGenerating]);

  return (
    <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-brand-bg via-brand-bg/95 to-transparent pt-xl pb-lg px-md md:px-lg">
      <div className="max-w-[850px] mx-auto relative flex flex-col gap-3">
        {/* Error Message Display */}
        {error && (
          <div className="p-sm px-md bg-brand-terracotta/10 border border-brand-terracotta/20 rounded-xl text-brand-terracotta text-[14px] flex justify-between items-center shadow-xs animate-fade-in">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{error}</span>
            </div>
            <button
              onClick={onClearError}
              className="p-1 hover:bg-brand-terracotta/15 rounded-full transition-colors flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        )}

        {/* Form Input Box */}
        <form
          onSubmit={handleSubmit}
          className="relative bg-white/80 backdrop-blur-sm border border-brand-border rounded-2xl focus-within:border-brand-sage/40 focus-within:ring-1 focus-within:ring-brand-sage/20 transition-all duration-300 min-h-[56px] flex items-center"
        >
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent border-none resize-none focus:outline-none focus:ring-0 pl-md pr-[100px] py-md font-sans text-brand-text placeholder:text-brand-text/40 max-h-[200px] overflow-y-auto text-[16px] leading-relaxed"
            placeholder="Tell Cora what you have in mind..."
            disabled={false}
          />
          
          {/* Floating Pill Button in the Right Corner */}
          <div className="absolute right-3 bottom-3 flex items-center gap-xs">
            {isGenerating ? (
              <button
                type="button"
                onClick={onStop}
                className="flex items-center gap-xs px-sm py-[6px] bg-brand-terracotta text-white rounded-full hover:bg-brand-terracotta/90 transition-all text-[13px] font-medium shadow-xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]" style={{ fontWeight: 300 }}>
                  stop
                </span>
                <span>Stop</span>
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                className={`flex items-center gap-xs px-sm py-[6px] rounded-full transition-all text-[13px] font-medium ${
                  input.trim()
                    ? 'bg-brand-sage text-white hover:bg-brand-sage/90 cursor-pointer shadow-xs'
                    : 'bg-black/5 text-brand-text/30 cursor-not-allowed'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]" style={{ fontWeight: 300 }}>
                  arrow_upward
                </span>
                <span>Send</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
