'use client';

import { MainLayout } from '@/components/MainLayout';
import { LoginForm } from '@/components/LoginForm';

export default function LoginPage() {
  return (
    <MainLayout>
      <div className="py-12">
        <LoginForm />
      </div>
    </MainLayout>
  );
}
