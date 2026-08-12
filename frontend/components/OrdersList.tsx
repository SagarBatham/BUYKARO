'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { orderAPI } from '@/lib/apiServices';

interface Order {
  _id: string;
  totalPrice: { amount: number; currency: string };
  status: string;
  createdAt: string;
  items: any[];
}

export function OrdersList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await orderAPI.getOrders();
      setOrders(response.data.data || []);
    } catch (error: any) {
      console.error('Failed to fetch orders', error);
      setError(error.response?.data?.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'border border-amber-400/40 bg-amber-400/10 text-amber-200';
      case 'CONFIRMED':
        return 'border border-sky-400/40 bg-sky-400/10 text-sky-200';
      case 'SHIPPED':
        return 'border border-violet-400/40 bg-violet-400/10 text-violet-200';
      case 'DELIVERED':
        return 'border border-emerald-400/40 bg-emerald-400/10 text-emerald-200';
      case 'CANCELLED':
        return 'border border-rose-400/40 bg-rose-400/10 text-rose-200';
      default:
        return 'border border-white/10 bg-white/10 text-gray-200';
    }
  };

  if (loading) {
    return <div className="rounded-[24px] border border-white/10 bg-[#060606] py-12 text-center text-sm text-gray-400">Loading orders...</div>;
  }

  if (error) {
    return (
      <div className="rounded-[24px] border border-white/10 bg-[#060606] p-8 text-center shadow-sm sm:p-10">
        <h2 className="mb-4 text-2xl font-semibold text-white">Unable to load orders</h2>
        <p className="text-sm text-red-400">{error}</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-[24px] border border-white/10 bg-[#060606] p-8 text-center shadow-sm sm:p-10">
        <h2 className="mb-4 text-2xl font-semibold text-white">No orders yet</h2>
        <p className="text-sm text-gray-400">Start shopping to place your first order!</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <h1 className="text-2xl font-semibold text-white sm:text-3xl">My Orders</h1>

      {orders.map((order) => (
        <div key={order._id} className="rounded-[22px] border border-white/10 bg-[#060606] p-4 shadow-sm sm:p-6">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="text-xs text-gray-500 sm:text-sm">Order ID</p>
              <p className="mt-1 text-sm font-semibold text-white break-all sm:text-lg">{order._id}</p>
            </div>
            <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold sm:px-3 sm:text-sm ${getStatusColor(order.status)}`}>
              {order.status}
            </span>
          </div>

          <div className="mb-4 grid gap-3 border-y border-white/10 py-4 sm:grid-cols-3">
            <div>
              <p className="text-xs text-gray-500 sm:text-sm">Order Date</p>
              <p className="mt-1 text-sm font-semibold text-white sm:text-base">
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 sm:text-sm">Items</p>
              <p className="mt-1 text-sm font-semibold text-white sm:text-base">{order.items.length} items</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 sm:text-sm">Total Amount</p>
              <p className="mt-1 text-base font-semibold text-white sm:text-lg">₹{order.totalPrice.amount}</p>
            </div>
          </div>

          <div className="mb-4 space-y-2">
            {order.items.slice(0, 3).map((item: any, idx: number) => (
              <p key={idx} className="text-sm text-gray-400">
                • {item.product?.title || 'Product'} x {item.quantity}
              </p>
            ))}
            {order.items.length > 3 && (
              <p className="text-sm text-gray-400">
                • +{order.items.length - 3} more items
              </p>
            )}
          </div>

          <Link href={`/orders/${order._id}`} className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10">
            View Details
          </Link>
        </div>
      ))}
    </div>
  );
}
