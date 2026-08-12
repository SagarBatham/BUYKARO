'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/store';
import { useAuth } from '@/hooks/useAuth';
import { orderAPI, authAPI } from '@/lib/apiServices';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Address {
  _id: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export function Checkout() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push('/login?redirect=/checkout');
      return;
    }

    fetchAddresses();
  }, [user, authLoading]);

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

    const selectedAddress = addresses.find((address) => address._id === selectedAddressId);
    if (!selectedAddress) {
      setError('Selected address not found');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      if (!selectedAddress.street || !selectedAddress.city || !selectedAddress.state || !selectedAddress.zip) {
        setError('Selected address is missing required fields');
        return;
      }

      const orderData = {
        items: items.map((item) => ({ product: item.productId, quantity: item.quantity })),
        shippingAddress: {
          street: selectedAddress.street,
          city: selectedAddress.city,
          state: selectedAddress.state,
          zip: selectedAddress.zip,
          country: selectedAddress.country || 'India'
        },
      };

      console.log('Creating order with payload:', orderData);
      const response = await orderAPI.createOrder(orderData);
      const orderId = response.data.data._id;
      clearCart();
      router.push(`/payment/${orderId}`);
    } catch (err: any) {
      console.error('Checkout create order error:', err.response?.data || err.message || err);
      const errors = err.response?.data?.errors;
      const message =
        err.response?.data?.message ||
        (Array.isArray(errors) && errors[0]?.msg) ||
        'Failed to create order';
      setError(message);
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
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="rounded-[32px] border border-white/10 bg-[#050505]/90 p-8 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.9)] backdrop-blur">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Checkout</p>
        <h1 className="mt-3 text-4xl font-semibold text-white">Review & place your order</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">Choose your shipping address, review the order details, and proceed to the secure payment flow built for a premium shopping experience.</p>
      </div>

      {error && <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-100">{error}</div>}

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <div className="space-y-6">
          <div className="rounded-[32px] border border-white/10 bg-slate-950/85 p-7 shadow-sm">
            <h2 className="mb-5 text-xl font-semibold text-white">Shipping Address</h2>
            {loading ? (
              <p className="text-sm text-slate-400">Loading addresses...</p>
            ) : addresses.length === 0 ? (
              <p className="text-sm text-slate-400">No addresses found. <Link href="/profile" className="font-semibold text-primary hover:underline">Add an address</Link></p>
            ) : (
              <div className="space-y-4">
                {addresses.map((address) => (
                  <label key={address._id} className="group flex cursor-pointer items-start gap-4 rounded-[24px] border border-white/10 bg-slate-900/80 p-5 transition hover:border-primary/60 hover:bg-slate-900">
                    <input type="radio" name="address" value={address._id} checked={selectedAddressId === address._id} onChange={(e) => setSelectedAddressId(e.target.value)} className="mt-1 h-5 w-5 accent-primary" />
                    <div>
                      <p className="font-semibold text-white group-hover:text-primary">{address.street}, {address.city}</p>
                      <p className="mt-1 text-sm text-slate-400">{address.state}, {address.zip}, {address.country}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-[32px] border border-white/10 bg-slate-950/85 p-7 shadow-sm">
            <h2 className="mb-5 text-xl font-semibold text-white">Order Summary</h2>
            <div className="space-y-4">
              {items.map((item) => {
                const itemPrice = Number((item as any).price?.amount ?? item.price ?? 0);
                const itemQuantity = Number(item.quantity ?? 0);
                return (
                  <div key={item.productId} className="flex items-center justify-between rounded-3xl bg-slate-900/80 px-4 py-4 text-sm text-slate-300">
                    <span>{item.title} × {itemQuantity}</span>
                    <span className="font-semibold text-white">₹{itemPrice * itemQuantity}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-slate-950/90 p-7 shadow-sm">
          <div className="flex items-center justify-between gap-3 rounded-3xl border border-white/10 bg-[#0d0d12]/70 px-5 py-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Total payment</p>
              <p className="mt-2 text-3xl font-semibold text-white">₹{getTotalPrice()}</p>
            </div>
            <span className="rounded-full bg-primary/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-primary">Secure</span>
          </div>

          <div className="mt-6 space-y-4 border-b border-white/10 pb-5">
            <div className="flex justify-between text-sm text-slate-400"><span>Subtotal</span><span>₹{getTotalPrice()}</span></div>
            <div className="flex justify-between text-sm text-slate-400"><span>Shipping</span><span>Free</span></div>
            <div className="flex justify-between text-sm text-slate-400"><span>Tax</span><span>₹0</span></div>
          </div>

          <button onClick={handleCreateOrder} disabled={submitting || addresses.length === 0} className="mt-6 w-full rounded-full bg-primary px-6 py-4 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60">
            {submitting ? 'Processing...' : 'Continue to Payment'}
          </button>

          <p className="mt-4 text-center text-sm text-slate-500">Payments are processed securely via Razorpay. You can complete the order and track it from your profile.</p>
        </div>
      </div>
    </div>
  );
}
