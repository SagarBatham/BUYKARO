'use client';

import { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

interface LayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-[#030303]">
      <Navbar />
      <main className="flex-grow w-full">
        <div className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
