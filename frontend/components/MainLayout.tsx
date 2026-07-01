'use client';

import { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

interface LayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-transparent">
      <Navbar />
      <main className="flex-grow w-full">
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6 lg:py-10">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
