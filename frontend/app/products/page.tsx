'use client';

import { MainLayout } from '@/components/MainLayout';
import { ProductGrid } from '@/components/ProductGrid';

export default function ProductsPage() {
  return (
    <MainLayout>
      <h1 className="text-4xl font-bold mb-8">Our Products</h1>
      <ProductGrid />
    </MainLayout>
  );
}
