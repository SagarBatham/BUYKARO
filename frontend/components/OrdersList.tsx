'use client';

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

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await orderAPI.getOrders();
      setOrders(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch orders', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800';
      case 'SHIPPED':
        return 'bg-purple-100 text-purple-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="rounded-[28px] border border-white/10 bg-slate-900/80 py-12 text-center text-sm text-slate-400">Loading orders...</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-10 text-center shadow-sm">
        <h2 className="mb-4 text-2xl font-semibold text-white">No orders yet</h2>
        <p className="text-sm text-slate-400">Start shopping to place your first order!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold text-white">My Orders</h1>

      {orders.map((order) => (
        <div key={order._id} className="rounded-[24px] border border-white/10 bg-slate-900/80 p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-slate-400">Order ID</p>
              <p className="text-lg font-semibold text-white">{order._id}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-bold ${getStatusColor(order.status)}`}>
              {order.status}
            </span>
          </div>

          <div className="mb-4 grid grid-cols-3 gap-4 border-y border-white/10 py-4">
            <div>
              <p className="text-sm text-slate-400">Order Date</p>
              <p className="font-semibold text-white">
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Items</p>
              <p className="font-semibold text-white">{order.items.length} items</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Total Amount</p>
              <p className="text-lg font-semibold text-white">
                ₹{order.totalPrice.amount}
              </p>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            {order.items.slice(0, 3).map((item: any, idx: number) => (
              <p key={idx} className="text-sm text-slate-400">
                • {item.product?.title || 'Product'} x {item.quantity}
              </p>
            ))}
            {order.items.length > 3 && (
              <p className="text-sm text-slate-400">
                • +{order.items.length - 3} more items
              </p>
            )}
          </div>

          <button className="font-semibold text-primary hover:underline">
            View Details
          </button>
        </div>
      ))}
    </div>
  );
}
