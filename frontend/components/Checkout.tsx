'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/store';
import { orderAPI, authAPI } from '@/lib/apiServices';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Address {
  _id: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export function Checkout() {
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await authAPI.getAddresses();
      setAddresses(response.data.data || []);
      if (response.data.data?.length > 0) {
        setSelectedAddressId(response.data.data[0]._id);
      }
    } catch (err) {
      console.error('Failed to fetch addresses', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = async () => {
    if (!selectedAddressId) {
      setError('Please select an address');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const orderData = {
        items: items.map((item) => ({ product: item.productId, quantity: item.quantity })),
        shippingAddress: selectedAddressId,
      };

      const response = await orderAPI.createOrder(orderData);
      const orderId = response.data.data._id;
      clearCart();
      router.push(`/payment/${orderId}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create order');
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="rounded-[32px] border border-white/10 bg-slate-900/80 p-10 text-center shadow-sm">
        <h2 className="mb-3 text-2xl font-semibold text-white">Your cart is empty</h2>
        <p className="mb-6 text-sm text-slate-400">Add a few items and you&apos;ll be ready to check out in minutes.</p>
        <Link href="/products" className="inline-flex rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90">Continue shopping</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Checkout</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Complete your order</h1>
      </div>

      {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <div className="grid gap-6 md:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-6">
          <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-white">Shipping Address</h2>
            {loading ? (
              <p className="text-sm text-slate-400">Loading addresses...</p>
            ) : addresses.length === 0 ? (
              <p className="text-sm text-slate-400">No addresses found. <Link href="/profile" className="font-semibold text-primary hover:underline">Add an address</Link></p>
            ) : (
              <div className="space-y-3">
                {addresses.map((address) => (
                  <label key={address._id} className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-slate-800/70 p-4 transition hover:bg-slate-800">
                    <input type="radio" name="address" value={address._id} checked={selectedAddressId === address._id} onChange={(e) => setSelectedAddressId(e.target.value)} className="mt-1" />
                    <div>
                      <p className="font-semibold text-white">{address.street}, {address.city}</p>
                      <p className="text-sm text-slate-400">{address.state}, {address.zipCode}, {address.country}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-white">Order Summary</h2>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.productId} className="flex items-center justify-between text-sm text-slate-400">
                  <span>{item.title} × {item.quantity}</span>
                  <span className="font-semibold text-white">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="h-fit rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-white">Price Details</h2>
          <div className="space-y-3 border-b border-white/10 pb-4">
            <div className="flex justify-between text-sm text-slate-400"><span>Subtotal</span><span>₹{getTotalPrice()}</span></div>
            <div className="flex justify-between text-sm text-slate-400"><span>Shipping</span><span>Free</span></div>
            <div className="flex justify-between text-sm text-slate-400"><span>Tax</span><span>₹0</span></div>
          </div>
          <div className="mt-4 flex justify-between text-lg font-semibold text-white"><span>Total</span><span>₹{getTotalPrice()}</span></div>
          <button onClick={handleCreateOrder} disabled={submitting || addresses.length === 0} className="mt-6 w-full rounded-full bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60">
            {submitting ? 'Processing...' : 'Continue to Payment'}
          </button>
        </div>
      </div>
    </div>
  );
}
