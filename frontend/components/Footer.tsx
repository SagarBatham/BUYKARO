'use client';

import Link from 'next/link';

export function Footer() {
  return (
    <footer className="mt-16 border-t border-white/10 bg-[#050505] py-10 text-white sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <h3 className="mb-4 text-xl font-semibold sm:text-2xl">BuyKaro</h3>
            <p className="max-w-xs text-sm leading-6 text-gray-400">Premium commerce, stripped to its essentials for modern buyers and sellers.</p>
          </div>
          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-gray-400 sm:text-sm">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/products" className="transition hover:text-white">Products</Link></li>
              <li><Link href="/cart" className="transition hover:text-white">Cart</Link></li>
              <li><Link href="/orders" className="transition hover:text-white">Orders</Link></li>
              <li><Link href="/seller" className="transition hover:text-white">Seller Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-gray-400 sm:text-sm">Support</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/login" className="transition hover:text-white">Login</Link></li>
              <li><Link href="/register" className="transition hover:text-white">Register</Link></li>
              <li><Link href="/checkout" className="transition hover:text-white">Checkout</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-gray-400 sm:text-sm">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/privacy" className="transition hover:text-white">Privacy Policy</Link></li>
              <li><Link href="/terms" className="transition hover:text-white">Terms of Service</Link></li>
              <li><Link href="/shipping" className="transition hover:text-white">Shipping Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-white/10 pt-8 text-center text-sm text-gray-500">
          <p>&copy; 2026 BuyKaro. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
