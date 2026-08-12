'use client';

import { Suspense } from 'react';
import { MainLayout } from '@/components/MainLayout';
import { ProductGrid } from '@/components/ProductGrid';

export default function ProductsPage() {
  return (
    <MainLayout>
      <h1 className="text-4xl font-bold mb-8">Our Products</h1>
      <Suspense fallback={<div className="rounded-[24px] border border-white/10 bg-[#070707] py-12 text-center text-sm text-gray-400 shadow-sm">Loading products...</div>}>
        <ProductGrid />
      </Suspense>
    </MainLayout>
  );
}
