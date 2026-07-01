'use client';

import { MainLayout } from '@/components/MainLayout';
import { RegisterForm } from '@/components/RegisterForm';

export default function RegisterPage() {
  return (
    <MainLayout>
      <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center py-3 sm:py-4 lg:py-6">
        <RegisterForm />
      </div>
    </MainLayout>
  );
}
