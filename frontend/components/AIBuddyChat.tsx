'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '@/store';
import { io, Socket } from 'socket.io-client';
import { Send, MessageCircle } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}
interface AIBuddyChatProps {
  compact?: boolean; // smaller height when true
  userBg?: string; // custom background color for user bubble (CSS color)
  assistantBg?: string; // custom background color for assistant bubble (CSS color)
}

export function AIBuddyChat({ compact = true, userBg, assistantBg }: AIBuddyChatProps) {
  const { user, token } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hi! I\'m your BuyKaro shopping assistant. How can I help you find the perfect product today?',
    },
  ]);
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!user) return;

    const socketUrl = process.env.NEXT_PUBLIC_AI_BUDDY_SERVICE || 'http://localhost:3005';
    const socketPath = '/api/socket/socket.io';

    const newSocket = io(socketUrl, {
      path: socketPath,
      withCredentials: true,
      transports: ['websocket', 'polling'],
      auth: token ? { token } : undefined,
    });

    newSocket.on('connect', () => {
      console.log('Connected to AI Buddy');
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from AI Buddy');
      setLoading(false);
    });

    newSocket.on('connect_error', (error: any) => {
      console.error('AI Buddy socket connection error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I could not reach the AI Buddy service right now.',
        },
      ]);
      setLoading(false);
    });

    newSocket.on('message', (data: any) => {
      const assistantMessages = data.messages?.filter(
        (m: any) => m.role === 'assistant'
      );
      if (assistantMessages?.length) {
        setMessages((prev) => [...prev, ...assistantMessages]);
      }
      setLoading(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user, token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
    };

    // Always show the user's message locally even if socket isn't connected
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    inputRef.current?.focus();

    if (socket) {
      setLoading(true);
      socket.emit('message', input);
    }
  };

  if (!user) {
    return (
      <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-10 text-center shadow-sm">
        <p className="mb-4 text-sm text-slate-400">Please login to use AI Buddy</p>
        <p className="text-sm text-slate-500">Once you’re signed in, the assistant can search products and add items to your cart.</p>
      </div>
    );
  }

  const containerHeightClass = compact ? 'h-[420px] max-h-[72vh] sm:h-[460px]' : 'h-[520px] max-h-[85vh] sm:h-[600px]';
  const containerClass = `flex ${containerHeightClass} w-full max-w-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-950/90 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.6)] sm:max-w-xl`;
  const contentClass = `h-full min-h-0 overflow-y-auto rounded-lg bg-slate-900/90 p-3 pr-2 sm:p-4 sm:pr-8`;

  return (
    <div className="flex w-full justify-center px-0 sm:px-2">
      <div className={containerClass}>
        <div className="flex items-center gap-3 px-3 py-3 sm:px-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-800 text-white sm:h-10 sm:w-10">
            <MessageCircle size={18} className="sm:h-5 sm:w-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-white sm:text-xs">AI Buddy</p>
            <h2 className="text-base font-semibold text-white sm:text-lg">Smart shopping</h2>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-hidden p-2 sm:p-4">
          <div className={contentClass}>
            <div className="space-y-3">
              {messages.map((message, idx) => {
                const isUser = message.role === 'user';
                const alignClass = isUser ? 'justify-end' : 'justify-start';

                const customStyle = isUser
                  ? userBg
                    ? { background: userBg }
                    : undefined
                  : assistantBg
                  ? { background: assistantBg }
                  : undefined;

                const baseBubble = isUser
                  ? (userBg ? 'text-white' : 'bg-slate-700 text-white border border-white/20 shadow-md')
                  : (assistantBg ? 'text-white' : 'bg-slate-800/95 text-white border border-white/10');

                const bubbleClass = `relative z-40 max-w-[86%] min-w-[120px] rounded-xl px-3 py-2.5 text-sm leading-6 break-words whitespace-pre-wrap sm:min-w-[160px] sm:px-4 sm:py-3 sm:text-base ${baseBubble}`;

                return (
                  <div key={idx} className={`flex ${alignClass}`}>
                    <div className={bubbleClass} style={customStyle}>
                      {message.content}
                    </div>
                  </div>
                );
              })}

              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-[20px] border border-white/10 bg-slate-900/95 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-slate-300"></span>
                      <span className="h-2 w-2 animate-pulse rounded-full bg-slate-300"></span>
                      <span className="h-2 w-2 animate-pulse rounded-full bg-slate-300"></span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/10 bg-slate-900/95 px-3 py-3.5 shadow-inner sm:flex-row sm:items-center sm:px-4">
          <input
            type="text"
            value={input}
            ref={inputRef}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask about brands, sizes, or products..."
            className="h-14 min-w-0 w-full flex-1 rounded-2xl border border-white/10 bg-slate-900 px-4 text-base text-white placeholder-slate-400 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/50 sm:h-11 sm:w-auto sm:text-sm"
            disabled={loading}
          />
          <button
            type="button"
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="inline-flex h-14 min-h-[3.5rem] w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 px-4 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60 sm:h-11 sm:w-auto sm:min-w-[110px]"
          >
            <Send size={18} />
            <span className="whitespace-nowrap">Send</span>
          </button>
        </div>
      </div>
    </div>
  );
}
