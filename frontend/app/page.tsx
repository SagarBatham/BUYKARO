'use client';

import { MainLayout } from '@/components/MainLayout';
import Link from 'next/link';
import { ShoppingCart, Users, Zap, Shield, ArrowRight, Sparkles } from 'lucide-react';
import { ProductGrid } from '@/components/ProductGrid';

export default function Home() {
  return (
    <MainLayout>
      <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-slate-950 via-slate-900 to-primary px-6 py-16 text-white shadow-2xl sm:px-10 lg:px-14 lg:py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.16),_transparent_40%)]" />
        <div className="relative grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm font-medium text-slate-100 backdrop-blur">
              <Sparkles size={16} />
              Fresh deals every day
            </div>
            <h1 className="text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
              Shop smarter with <span className="text-secondary">BuyKaro</span>
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
              Discover premium products, fast delivery, and a beautifully simple shopping experience built for modern buyers.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/products" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-slate-900 transition hover:opacity-90">
                Start Shopping
                <ArrowRight size={18} />
              </Link>
              <Link href="/ai-buddy" className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 font-semibold text-white transition hover:bg-white/20">
                Try AI Buddy
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-2xl backdrop-blur">
            <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-6 text-white shadow-xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Why buyers love us</p>
              <div className="mt-6 space-y-4">
                {[
                  ['Wide selection', 'Thousands of products across every category.'],
                  ['Fast checkout', 'Secure payments and effortless ordering.'],
                  ['Real support', 'Friendly help whenever you need it.'],
                ].map(([title, desc]) => (
                  <div key={title} className="rounded-2xl border border-white/10 bg-slate-800/80 p-4">
                    <h3 className="font-semibold text-white">{title}</h3>
                    <p className="mt-1 text-sm text-slate-400">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-12">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Benefits</p>
            <h2 className="text-3xl font-semibold text-white">Why Choose BuyKaro?</h2>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {[
            { icon: ShoppingCart, title: 'Wide Selection', desc: 'Explore products from trusted sellers across top categories.', color: 'text-primary' },
            { icon: Zap, title: 'Fast Shipping', desc: 'Quick delivery and smooth logistics from checkout to doorstep.', color: 'text-secondary' },
            { icon: Shield, title: 'Secure Payments', desc: 'Protected transactions with reliable payment support.', color: 'text-amber-500' },
            { icon: Users, title: '24/7 Support', desc: 'Friendly assistance whenever you need help with your order.', color: 'text-emerald-500' },
          ].map((item) => (
            <div key={item.title} className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-sm backdrop-blur">
              <item.icon className={item.color} size={32} />
              <h3 className="mt-4 text-lg font-semibold text-white">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12 rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-sm sm:p-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Featured</p>
            <h2 className="text-3xl font-semibold text-white">Popular Products</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Browse a curated selection of trending products loved by customers.</p>
          </div>
          <Link href="/products" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
            View all products
            <ArrowRight size={16} />
          </Link>
        </div>
        <ProductGrid />
      </section>

      <section className="mt-12 rounded-[28px] border border-white/10 bg-slate-900/70 p-8 text-center shadow-sm sm:p-10">
        <h2 className="text-3xl font-semibold text-white">Ready to find your next favorite item?</h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-400">Explore your next purchase with quality, speed, and confidence all in one place.</p>
        <Link href="/products" className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-white transition hover:opacity-90">
          Browse Now
          <ArrowRight size={16} />
        </Link>
      </section>
    </MainLayout>
  );
}
