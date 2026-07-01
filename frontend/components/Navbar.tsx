'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store';
import { useState } from 'react';
import { Menu, X, ShoppingCart, LogOut, User, Sparkles } from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-6">
        <Link href="/" className="flex items-center gap-2 text-xl font-semibold text-white">
          <div className="rounded-full bg-gradient-to-br from-primary to-secondary p-2">
            <Sparkles size={16} />
          </div>
          <span>BuyKaro</span>
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          <NavLink href="/products">Products</NavLink>
          <NavLink href="/ai-buddy">AI Buddy</NavLink>
          <NavLink href="/cart">
            <ShoppingCart size={16} />
            Cart
          </NavLink>
          <NavLink href="/orders">Orders</NavLink>
          <NavLink href="/checkout">Checkout</NavLink>

          {user && user.id ? (
            <div className="relative group">
              <button className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20">
                <User size={16} />
                {user.fullName?.firstName || 'Account'}
              </button>
              <div className="absolute right-0 mt-2 hidden w-56 rounded-xl border border-white/10 bg-slate-900/95 p-2 text-slate-200 shadow-xl group-hover:block">
                <Link href="/seller" className="block rounded-lg px-3 py-2 hover:bg-white/10">Seller Dashboard</Link>
                <button
                  onClick={() => {
                    logout();
                    window.location.href = '/login';
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left hover:bg-white/10"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <>
              <Link href="/login" className="rounded-full px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10 hover:text-white">
                Login
              </Link>
              <Link href="/register" className="rounded-full bg-gradient-to-r from-primary to-secondary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90">
                Register
              </Link>
            </>
          )}
        </div>

        <button className="rounded-full p-2 text-white md:hidden" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {isOpen && (
        <div className="border-t border-white/10 bg-slate-950/95 px-4 py-4 md:hidden">
          <div className="flex flex-col gap-2 text-sm text-slate-200">
            <Link href="/products" className="rounded-lg px-3 py-2 hover:bg-white/10">Products</Link>
            <Link href="/ai-buddy" className="rounded-lg px-3 py-2 hover:bg-white/10">AI Buddy</Link>
            <Link href="/cart" className="rounded-lg px-3 py-2 hover:bg-white/10">Cart</Link>
            {user && user.id ? (
              <>
                <Link href="/orders" className="rounded-lg px-3 py-2 hover:bg-white/10">Orders</Link>
                <Link href="/seller" className="rounded-lg px-3 py-2 hover:bg-white/10">Seller Dashboard</Link>
                <button onClick={() => { logout(); window.location.href = '/login'; }} className="rounded-lg px-3 py-2 text-left hover:bg-white/10">Logout</button>
              </>
            ) : (
              <>
                <Link href="/login" className="rounded-lg px-3 py-2 hover:bg-white/10">Login</Link>
                <Link href="/register" className="rounded-lg px-3 py-2 hover:bg-white/10">Register</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10 hover:text-white">
      {children}
    </Link>
  );
}
