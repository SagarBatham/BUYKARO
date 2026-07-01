'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store';
import { io, Socket } from 'socket.io-client';
import { Send, MessageCircle } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function AIBuddyChat() {
  const { user, token } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hi! I\'m your BuyKaro shopping assistant. How can I help you find the perfect product today?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!user) return;

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL ||
      (typeof window !== 'undefined'
        ? `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}`
        : 'http://localhost:3005');
    const socketPathRaw = process.env.NEXT_PUBLIC_SOCKET_PATH || '/api/socket/socket.io';
    const socketPath = socketPathRaw.replace(/\/+$|\/$/, '');

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

  const sendMessage = () => {
    if (!input.trim() || !socket) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    socket.emit('message', input);
  };

  if (!user) {
    return (
      <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-10 text-center shadow-sm">
        <p className="mb-4 text-sm text-slate-400">Please login to use AI Buddy</p>
      </div>
    );
  }

  return (
    <div className="flex h-[440px] max-h-[70vh] w-full max-w-xl flex-col overflow-hidden rounded-[24px] border border-white/10 bg-slate-900/80 shadow-[0_16px_50px_-24px_rgba(15,23,42,0.9)]">
      <div className="flex items-center gap-2 bg-gradient-to-r from-primary to-secondary px-3 py-2.5 text-white">
        <MessageCircle size={18} />
        <h2 className="text-base font-semibold">AI Shopping Assistant</h2>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 p-3">
        {messages.map((message, idx) => (
          <div
            key={idx}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-5 ${
                message.role === 'user'
                  ? 'rounded-br-none bg-primary text-white'
                  : 'rounded-bl-none border border-white/10 bg-slate-800 text-slate-200'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl border border-white/10 bg-slate-800 px-4 py-2">
              <div className="flex gap-1">
                <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400"></div>
                <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '0.1s' }}></div>
                <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2 border-t border-white/10 p-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Ask me anything about products..."
          className="flex-1 rounded-full border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-primary"
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="flex items-center gap-2 rounded-full bg-primary px-3 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
