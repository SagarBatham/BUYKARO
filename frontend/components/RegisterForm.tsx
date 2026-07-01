'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authAPI } from '@/lib/apiServices';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

const registerSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    setError('');

    try {
      const username = data.email.split('@')[0].replace(/[^a-zA-Z0-9._-]/g, '') || 'user';

      await authAPI.register({
        username,
        email: data.email,
        password: data.password,
        fullName: {
          firstName: data.firstName,
          lastName: data.lastName,
        },
      });

      router.push('/login?registered=true');
    } catch (err: any) {
      const serverMessage = err.response?.data?.message || err.response?.data?.msg || err.response?.data?.error || err.message || 'Registration failed';
      setError(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl overflow-hidden rounded-[32px] border border-white/10 bg-slate-900/80 shadow-[0_30px_100px_-40px_rgba(15,23,42,0.8)] backdrop-blur">
      <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
        <div className="hidden bg-gradient-to-br from-primary via-slate-900 to-slate-950 p-8 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm font-medium text-slate-100">
              <Sparkles size={16} />
              Join BuyKaro
            </div>
            <h2 className="mt-5 text-3xl font-semibold">Create an account and shop with confidence.</h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">Fast checkout, personalized recommendations, and order tracking are just a few clicks away.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-sm text-slate-200">
            <p className="font-semibold text-white">Why join?</p>
            <p className="mt-2 text-slate-300">Enjoy secure payments, real-time support, and premium delivery options.</p>
          </div>
        </div>

        <div className="p-6 sm:p-8 lg:p-10">
          <div className="mb-6 text-center lg:text-left">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Register</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">Create your account</h2>
            <p className="mt-2 text-sm text-slate-400">Start your shopping journey in a few simple steps.</p>
          </div>

          {error && <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-300">First Name</label>
                <input {...register('firstName')} className="w-full rounded-2xl border border-white/10 bg-slate-800/80 px-4 py-3 text-sm text-white outline-none transition focus:border-primary focus:bg-slate-800 focus:ring-2 focus:ring-primary/20" placeholder="John" />
                {errors.firstName && <p className="mt-1 text-sm text-red-500">{errors.firstName.message}</p>}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-300">Last Name</label>
                <input {...register('lastName')} className="w-full rounded-2xl border border-white/10 bg-slate-800/80 px-4 py-3 text-sm text-white outline-none transition focus:border-primary focus:bg-slate-800 focus:ring-2 focus:ring-primary/20" placeholder="Doe" />
                {errors.lastName && <p className="mt-1 text-sm text-red-500">{errors.lastName.message}</p>}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-300">Email</label>
              <input type="email" {...register('email')} className="w-full rounded-2xl border border-white/10 bg-slate-800/80 px-4 py-3 text-sm text-white outline-none transition focus:border-primary focus:bg-slate-800 focus:ring-2 focus:ring-primary/20" placeholder="your@email.com" />
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-300">Password</label>
              <input type="password" {...register('password')} className="w-full rounded-2xl border border-white/10 bg-slate-800/80 px-4 py-3 text-sm text-white outline-none transition focus:border-primary focus:bg-slate-800 focus:ring-2 focus:ring-primary/20" placeholder="••••••••" />
              {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-300">Confirm Password</label>
              <input type="password" {...register('confirmPassword')} className="w-full rounded-2xl border border-white/10 bg-slate-800/80 px-4 py-3 text-sm text-white outline-none transition focus:border-primary focus:bg-slate-800 focus:ring-2 focus:ring-primary/20" placeholder="••••••••" />
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>}
            </div>

            <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60">
              {loading ? 'Registering...' : 'Register'}
              <ArrowRight size={16} />
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-primary hover:underline">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
