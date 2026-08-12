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

  // Increase inner chat size to make messages more visible
  const containerHeightClass = compact ? 'h-[460px] max-h-[70vh]' : 'h-[600px] max-h-[85vh]';
  const containerClass = `flex ${containerHeightClass} w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-950/90 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.6)]`;
  // More right padding so scrollbar doesn't overlap right-aligned bubbles
  const contentClass = `h-full min-h-0 overflow-y-auto pr-8 rounded-lg p-4 bg-slate-900/90`;

  return (
    <div className="flex justify-center">
      <div className={containerClass}>
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-800 text-white">
            <MessageCircle size={20} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-white">AI Buddy</p>
            <h2 className="text-lg font-semibold text-white">Smart shopping</h2>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-hidden p-3 sm:p-4">
          <div className={contentClass}>
            <div className="space-y-3">
              {messages.map((message, idx) => {
                const isUser = message.role === 'user';
                const alignClass = isUser ? 'justify-end' : 'justify-start';

                // If a custom background color is provided, apply it via inline style
                const customStyle = isUser
                  ? userBg
                    ? { background: userBg }
                    : undefined
                  : assistantBg
                  ? { background: assistantBg }
                  : undefined;

                // Use a solid, high-contrast style for user bubbles so sent messages are always visible
                const baseBubble = isUser
                  ? (userBg ? 'text-white' : 'bg-slate-700 text-white border border-white/20 shadow-md')
                  : (assistantBg ? 'text-white' : 'bg-slate-800/95 text-white border border-white/10');

                const bubbleClass = `relative z-40 max-w-[80%] min-w-[160px] min-h-[48px] rounded-lg px-4 py-3 text-base leading-6 break-words whitespace-pre-wrap ${baseBubble}`;

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

        <div className="flex flex-col gap-3 border-t border-white/10 bg-slate-900/95 px-4 py-3 shadow-inner sm:flex-row sm:items-center">
          <input
            type="text"
            value={input}
            ref={inputRef}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask about brands, sizes, or product recommendations..."
            className="flex-1 min-w-0 h-12 rounded-full border border-white/10 bg-slate-900 px-4 text-sm text-white placeholder-slate-400 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/50"
            disabled={loading}
          />
          <button
            type="button"
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="inline-flex h-12 min-h-[3rem] min-w-[7rem] items-center justify-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-slate-950 shadow-sm shadow-black/10 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Send size={18} />
            <span className="whitespace-nowrap">Send</span>
          </button>
        </div>
      </div>
    </div>
  );
}
