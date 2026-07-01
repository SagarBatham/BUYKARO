'use client';

import { MainLayout } from '@/components/MainLayout';
import { ProductDetail } from '@/components/ProductDetail';

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  return (
    <MainLayout>
      <ProductDetail productId={params.id} />
    </MainLayout>
  );
}
