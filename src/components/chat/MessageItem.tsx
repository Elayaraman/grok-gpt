import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import type { Message } from '../../types/chat';

interface MessageItemProps {
  message: Message;
  isLast: boolean;
  onRegenerate?: () => void;
}

export function MessageItem({ message, isLast, onRegenerate }: MessageItemProps) {
  const isUser = message.role === 'user';

  // Extract and hide <think> blocks (must be parsed before hooks)
  let displayContent = message.content;
  let isThinking = false;
  let thinkContent = '';

  if (!isUser) {
    const thinkMatch = displayContent.match(/<think>([\s\S]*?)<\/think>/);
    if (thinkMatch) {
      thinkContent = thinkMatch[1];
      displayContent = displayContent.replace(thinkMatch[0], '').replace(/^\n+/, '');
    } else if (displayContent.includes('<think>')) {
      isThinking = true;
      const split = displayContent.split('<think>');
      displayContent = split[0];
      thinkContent = split[1];
    }
  }

  // Manage expanded state for thought process
  const [isThoughtExpanded, setIsThoughtExpanded] = useState(() => message.status === 'streaming');

  // Auto-collapse only when the ENTIRE message finishes streaming
  useEffect(() => {
    if (!isUser) {
      if (message.status !== 'streaming') {
        // Collapse when everything is fully returned
        const timer = setTimeout(() => setIsThoughtExpanded(false), 500);
        return () => clearTimeout(timer);
      } else {
        // Keep expanded while streaming
        setIsThoughtExpanded(true);
      }
    }
  }, [message.status, isUser]);

  if (isUser) {
    return (
      <div className="flex gap-md items-start justify-end max-w-[85%] ml-auto">
        <div className="bg-brand-sage/10 text-brand-sage rounded-2xl rounded-tr-sm p-[24px] border border-brand-sage/20 font-sans leading-relaxed text-[16px]">
          <p>{message.content}</p>
        </div>
      </div>
    );
  }

  // Assistant Message
  return (
    <div className="flex gap-md items-start max-w-[85%] group">
      <div className="pt-[8px] text-brand-text/90 w-full max-w-prose leading-relaxed text-[16px] flex flex-col gap-2">
        {/* Thought Process Block */}
        {(thinkContent || isThinking) && (
          <div className="mb-2 flex flex-col gap-2 border-l-2 border-brand-sage/30 pl-4 py-1">
            <button
              onClick={() => setIsThoughtExpanded(!isThoughtExpanded)}
              className="flex items-center gap-2 text-brand-text/50 text-[14px] font-medium hover:text-brand-text/70 transition-colors w-fit"
            >
              <span className={`material-symbols-outlined text-[16px] transition-transform duration-300 ${isThoughtExpanded ? 'rotate-90' : ''}`}>
                chevron_right
              </span>
              <span className="material-symbols-outlined text-[16px]">psychology</span>
              <span className={isThinking ? 'animate-pulse' : ''}>
                {isThinking ? 'Thinking...' : 'Thought process'}
              </span>
            </button>

            <div
              className={`grid transition-all duration-500 ease-in-out ${isThoughtExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
            >
              <div className="overflow-hidden">
                <div className="prose prose-stone max-w-none text-brand-text/50 text-[14px] leading-relaxed pt-2">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{thinkContent}</ReactMarkdown>
                  {isThinking && (
                    <span className="inline-block w-2 h-4 align-middle bg-brand-text/30 ml-1" />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {displayContent && (
          <div className="prose prose-stone max-w-none prose-p:leading-relaxed prose-pre:bg-black/5 prose-pre:border prose-pre:border-black/10 prose-pre:rounded-lg prose-pre:p-sm">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                p: ({ children }) => <p className="mb-4 last:mb-0 leading-relaxed text-[16px] text-brand-text/90">{children}</p>,
                ul: ({ children }) => <ul className="list-disc pl-5 mb-4 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-5 mb-4 space-y-1">{children}</ol>,
                li: ({ children }) => <li className="mb-0.5">{children}</li>,
                h1: ({ children }) => <h1 className="font-serif text-[22px] font-semibold text-brand-text mt-6 mb-3">{children}</h1>,
                h2: ({ children }) => <h2 className="font-serif text-[18px] font-semibold text-brand-text mt-4 mb-2">{children}</h2>,
                h3: ({ children }) => <h3 className="font-serif text-[16px] font-semibold text-brand-text mt-3 mb-1">{children}</h3>,
                blockquote: ({ children }) => <blockquote className="border-l-4 border-brand-border pl-4 italic my-4 text-brand-text/75">{children}</blockquote>,
                table: ({ children }) => (
                  <div className="overflow-x-auto my-4 border border-brand-border rounded-lg">
                    <table className="w-full text-left border-collapse text-[14px]">{children}</table>
                  </div>
                ),
                thead: ({ children }) => <thead className="bg-black/5 border-b border-brand-border font-medium">{children}</thead>,
                tbody: ({ children }) => <tbody>{children}</tbody>,
                tr: ({ children }) => <tr className="border-b border-brand-border last:border-b-0">{children}</tr>,
                th: ({ children }) => <th className="p-3 font-semibold">{children}</th>,
                td: ({ children }) => <td className="p-3">{children}</td>,
                code: ({ className, children, ...props }) => {
                  const match = /language-(\w+)/.exec(className || '');
                  return match ? (
                    <code className={`block bg-black/5 p-4 rounded-lg font-mono text-[14px] overflow-x-auto my-2 border border-brand-border ${className}`} {...props}>
                      {children}
                    </code>
                  ) : (
                    <code className="bg-black/5 px-1.5 py-0.5 rounded font-mono text-[14px] border border-black/5" {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {displayContent}
            </ReactMarkdown>
            {message.status === 'streaming' && (
              <span className="inline-block w-2 h-4 align-middle" />
            )}
          </div>
        )}

        {/* Retry or Regenerate controls */}
        {isLast && !isUser && (
          <div className="flex gap-2 items-center mt-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200">
            {message.status === 'completed' && onRegenerate && (
              <button
                onClick={onRegenerate}
                className="flex items-center gap-1 text-[12px] text-brand-text/50 hover:text-brand-terracotta transition-colors py-1 px-2 rounded-md hover:bg-black/5"
                title="Regenerate this response"
              >
                <span className="material-symbols-outlined text-[16px]" style={{ fontWeight: 300 }}>
                  refresh
                </span>
                <span>Regenerate</span>
              </button>
            )}

            {(message.status === 'error' || message.status === 'aborted') && onRegenerate && (
              <button
                onClick={onRegenerate}
                className="flex items-center gap-1 text-[12px] text-brand-terracotta hover:bg-brand-terracotta/10 border border-brand-terracotta/20 py-1 px-2.5 rounded-full transition-colors"
                title="Retry response"
              >
                <span className="material-symbols-outlined text-[16px]" style={{ fontWeight: 300 }}>
                  refresh
                </span>
                <span>Retry</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
