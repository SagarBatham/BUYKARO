'use client';

import { MainLayout } from '@/components/MainLayout';
import { AIBuddyChat } from '@/components/AIBuddyChat';

export default function AIBuddyPage() {
  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Shopping Assistant</h1>
        <AIBuddyChat />
      </div>
    </MainLayout>
  );
}
