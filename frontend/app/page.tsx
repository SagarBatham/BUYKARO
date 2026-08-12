'use client';

import { Suspense } from 'react';
import { MainLayout } from '@/components/MainLayout';
import Link from 'next/link';
import { ShoppingCart, Users, Zap, Shield, ArrowRight, Sparkles, CheckCircle2, Globe2 } from 'lucide-react';
import { ProductGrid } from '@/components/ProductGrid';

const benefits = [
  { icon: ShoppingCart, title: 'Curated selection', desc: 'Discover fast-moving essentials and standout finds without the noise.' },
  { icon: Zap, title: 'Fast delivery', desc: 'Move from checkout to doorstep with a dependable experience.' },
  { icon: Shield, title: 'Secure purchase', desc: 'Protected payments and trusted support at every step.' },
  { icon: Users, title: 'Human support', desc: 'Guidance from real people whenever you need a quick answer.' },
];

const stats = [
  { value: '24/7', label: 'Live support' },
  { value: '99.9%', label: 'Checkout uptime' },
  { value: '2.1M+', label: 'Products indexed' },
  { value: '4.9/5', label: 'Buyer rating' },
];

const trustPoints = ['Monochrome-first interface', 'Enterprise-grade reliability', 'No clutter, just clarity'];

export default function Home() {
  return (
    <MainLayout>
      <section className="overflow-hidden rounded-[28px] border border-white/10 bg-[#050505]/90 px-4 py-8 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_30px_80px_-30px_rgba(255,255,255,0.25)] sm:px-8 lg:px-12 lg:py-14">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-gray-300 sm:text-[11px]">
              <Sparkles size={14} />
              Premium commerce, simplified
            </div>
            <h1 className="max-w-3xl text-balance text-4xl font-semibold leading-[0.95] tracking-[-0.04em] text-white sm:text-5xl lg:text-7xl mobile-tight">
              Discover the sharpest way to buy online.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-gray-400 sm:text-lg sm:leading-8">
              BuyKaro brings together a refined storefront, dependable delivery, and calm product discovery in a design that feels unmistakably premium.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href="/products" className="inline-flex items-center justify-center gap-2 rounded-full bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:bg-violet-500 sm:px-6">
                Start Shopping
                <ArrowRight size={18} />
              </Link>
              <Link href="/ai-buddy" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10 sm:px-6">
                Try AI Buddy
              </Link>
            </div>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-[#0a0a0a] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:p-6">
            <div className="rounded-[20px] border border-white/10 bg-black/80 p-4 sm:p-5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gray-400 sm:text-sm">
                <Globe2 size={16} />
                Built for modern buyers
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {stats.map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-xl font-semibold text-white sm:text-2xl">{stat.value}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-gray-500 sm:text-sm">{stat.label}</p>
                  </div>
                ))}
              </div>
              <ul className="mt-5 space-y-3">
                {trustPoints.map((point) => (
                  <li key={point} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3 text-sm text-gray-300 sm:px-4">
                    <CheckCircle2 size={16} className="text-white" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-14 border-t border-white/10 pt-12">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gray-500">Why BuyKaro</p>
            <h2 className="text-3xl font-semibold text-white">A quieter kind of excellence.</h2>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-gray-400">Thoughtful defaults, minimal visual noise, and consistent delivery create a shopping experience that feels calm and confident.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {benefits.map((item) => (
            <div key={item.title} className="rounded-[24px] border border-white/10 bg-[#060606] p-6 transition hover:border-white/20 hover:bg-[#0a0a0a]">
              <item.icon className="text-white" size={28} />
              <h3 className="mt-4 text-lg font-semibold text-white">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-gray-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-14 rounded-[28px] border border-white/10 bg-[#060606] p-6 shadow-sm sm:p-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gray-500">Featured</p>
            <h2 className="text-3xl font-semibold text-white">Popular products</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400">Browse a curated selection of items chosen for quality, simplicity, and everyday value.</p>
          </div>
          <Link href="/products" className="inline-flex items-center gap-2 text-sm font-semibold text-white">
            View all products
            <ArrowRight size={16} />
          </Link>
        </div>
        <Suspense fallback={<div className="rounded-[24px] border border-white/10 bg-[#070707] py-12 text-center text-sm text-gray-400 shadow-sm">Loading featured products...</div>}>
          <ProductGrid />
        </Suspense>
      </section>

      <section className="mt-14 rounded-[28px] border border-white/10 bg-[#050505] px-6 py-10 text-center sm:px-10">
        <h2 className="text-3xl font-semibold text-white">Ready for a cleaner way to shop?</h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-gray-400">Explore your next purchase with a crisp interface, dependable support, and a premium feel from start to finish.</p>
        <Link href="/products" className="mt-6 inline-flex items-center gap-2 rounded-full bg-violet-600 px-6 py-3 font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:bg-violet-500">
          Browse Now
          <ArrowRight size={16} />
        </Link>
      </section>
    </MainLayout>
  );
}
