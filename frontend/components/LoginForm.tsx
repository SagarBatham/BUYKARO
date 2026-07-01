'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authAPI } from '@/lib/apiServices';
import { useAuthStore } from '@/store';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Cookies from 'js-cookie';
import Link from 'next/link';
import { ArrowRight, ShieldCheck } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const { setUser, setToken } = useAuthStore();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.login(data.email, data.password);
      const { token, user } = response.data;

      Cookies.set('token', token, { expires: 7 });
      setToken(token);
      setUser(user);

      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl overflow-hidden rounded-[32px] border border-white/10 bg-slate-900/80 shadow-[0_30px_100px_-40px_rgba(15,23,42,0.8)] backdrop-blur">
      <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
        <div className="hidden bg-gradient-to-br from-slate-950 via-slate-900 to-primary p-8 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-300">Welcome back</p>
            <h2 className="mt-4 text-3xl font-semibold">Sign in to your premium shopping account.</h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">Track orders, manage saved items, and enjoy faster checkout with your secure profile.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-sm text-slate-200">
            <div className="flex items-center gap-2 font-medium"><ShieldCheck size={16} /> Secure experience</div>
            <p className="mt-2 text-slate-300">Encrypted logins and trusted payments built into every step.</p>
          </div>
        </div>

        <div className="p-8 sm:p-10">
          <div className="mb-8 text-center lg:text-left">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Login</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">Welcome back</h2>
            <p className="mt-2 text-sm text-slate-400">Use your email and password to continue shopping.</p>
          </div>

          {error && (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-300">Email</label>
              <input
                type="email"
                {...register('email')}
                className="w-full rounded-2xl border border-white/10 bg-slate-800/80 px-4 py-3 text-sm text-white outline-none transition focus:border-primary focus:bg-slate-800 focus:ring-2 focus:ring-primary/20"
                placeholder="your@email.com"
              />
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-300">Password</label>
              <input
                type="password"
                {...register('password')}
                className="w-full rounded-2xl border border-white/10 bg-slate-800/80 px-4 py-3 text-sm text-white outline-none transition focus:border-primary focus:bg-slate-800 focus:ring-2 focus:ring-primary/20"
                placeholder="••••••••"
              />
              {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
            >
              {loading ? 'Logging in...' : 'Login'}
              <ArrowRight size={16} />
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-semibold text-primary hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
