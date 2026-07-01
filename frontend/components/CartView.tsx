'use client';

import { useCartStore } from '@/store';
import Link from 'next/link';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';

export function CartView() {
  const { items, removeItem, updateQuantity, clearCart, getTotalPrice } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="rounded-[32px] border border-white/10 bg-slate-900/80 p-10 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-800 text-primary">
          <ShoppingBag size={24} />
        </div>
        <h2 className="mb-3 text-2xl font-semibold text-white">Your cart is empty</h2>
        <p className="mb-6 text-sm text-slate-400">Browse our collection and add your favorite items to begin checkout.</p>
        <Link href="/products" className="inline-flex rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90">Continue shopping</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Cart</p>
            <h1 className="text-3xl font-semibold text-white">Shopping Cart</h1>
          </div>
          <p className="text-sm text-slate-400">{items.length} item{items.length > 1 ? 's' : ''} ready for checkout</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-[28px] border border-white/10 bg-slate-900/80 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Product</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-300">Price</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-slate-300">Quantity</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-300">Total</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-slate-300">Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.productId} className="border-t border-white/10">
                  <td className="px-4 py-4 font-medium text-white">{item.title}</td>
                  <td className="px-4 py-4 text-right text-slate-400">₹{item.price}</td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))} className="rounded-full border border-white/10 p-1.5 text-slate-400 transition hover:bg-slate-800"><Minus size={14} /></button>
                      <input type="number" value={item.quantity} onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value) || 1)} className="w-12 rounded-full border border-white/10 bg-slate-800 px-2 py-1 text-center text-sm text-white outline-none" min="1" />
                      <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="rounded-full border border-white/10 p-1.5 text-slate-400 transition hover:bg-slate-800"><Plus size={14} /></button>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right font-semibold text-white">₹{item.price * item.quantity}</td>
                  <td className="px-4 py-4 text-center"><button onClick={() => removeItem(item.productId)} className="rounded-full p-2 text-red-500 transition hover:bg-red-50"><Trash2 size={16} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col justify-end gap-4 rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-sm md:flex-row">
        <button onClick={clearCart} className="rounded-full border border-white/10 px-6 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800">Clear Cart</button>
        <div className="ml-auto text-right">
          <p className="mb-2 text-sm text-slate-400">Subtotal <span className="ml-2 font-semibold text-white">₹{getTotalPrice()}</span></p>
          <Link href="/checkout" className="inline-flex rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white transition hover:opacity-90">Proceed to Checkout</Link>
        </div>
      </div>
    </div>
  );
}
