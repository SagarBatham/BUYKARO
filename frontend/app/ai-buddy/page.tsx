'use client';

import { MainLayout } from '@/components/MainLayout';
import { AIBuddyChat } from '@/components/AIBuddyChat';

export default function AIBuddyPage() {
  return (
    <MainLayout>
      <div className="mx-auto w-full max-w-3xl">
        <h1 className="mb-4 text-2xl font-bold text-white sm:text-3xl">Shopping Assistant</h1>
        <p className="mb-5 text-sm text-slate-400 sm:text-base">Ask for product recommendations, compare options, and find the right fit for your next purchase.</p>
        <AIBuddyChat />
      </div>
    </MainLayout>
  );
}
