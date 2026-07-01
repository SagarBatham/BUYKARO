'use client';

import { MainLayout } from '@/components/MainLayout';
import { OrdersList } from '@/components/OrdersList';

export default function OrdersPage() {
  return (
    <MainLayout>
      <OrdersList />
    </MainLayout>
  );
}
