'use client';

import { useState, useEffect } from 'react';
import { sellerAPI } from '@/lib/apiServices';
import { BarChart3, TrendingUp, ShoppingBag } from 'lucide-react';

interface Metrics {
  sales: number;
  revenue: number;
  topProducts: any[];
}

interface Order {
  _id: string;
  customer: string;
  status: string;
  totalAmount: number;
  createdAt: string;
}

interface Product {
  _id: string;
  title: string;
  price: { amount: number };
  stock: number;
}

export function SellerDashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [metricsRes, ordersRes, productsRes] = await Promise.all([
        sellerAPI.getMetrics(),
        sellerAPI.getOrders(),
        sellerAPI.getProducts(),
      ]);

      setMetrics(metricsRes.data);
      setOrders(ordersRes.data.orders || []);
      setProducts(productsRes.data.products || []);
    } catch (error) {
      console.error('Failed to fetch seller dashboard', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="rounded-[28px] border border-white/10 bg-slate-900/80 py-12 text-center text-sm text-slate-400">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold text-white">Seller Dashboard</h1>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-4">
            <TrendingUp className="text-primary" size={32} />
            <div>
              <p className="text-sm text-slate-400">Total Revenue</p>
              <p className="text-3xl font-semibold text-white">₹{metrics?.revenue || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-4">
            <ShoppingBag className="text-secondary" size={32} />
            <div>
              <p className="text-sm text-slate-400">Total Sales</p>
              <p className="text-3xl font-semibold text-white">{metrics?.sales || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-4">
            <BarChart3 className="text-warning" size={32} />
            <div>
              <p className="text-sm text-slate-400">Products</p>
              <p className="text-3xl font-semibold text-white">{products.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Products */}
      {metrics?.topProducts && metrics.topProducts.length > 0 && (
        <div className="rounded-[24px] border border-white/10 bg-slate-900/80 p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-white">Top Products</h2>
          <div className="space-y-3">
            {metrics.topProducts.slice(0, 5).map((product: any, idx: number) => (
              <div key={idx} className="flex justify-between items-center pb-3 border-b last:border-b-0">
                <div>
                  <p className="font-semibold text-white">{product.title}</p>
                  <p className="text-sm text-slate-400">{product.sales} sold</p>
                </div>
                <p className="font-semibold text-white">₹{product.totalRevenue}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Orders */}
      <div className="rounded-[24px] border border-white/10 bg-slate-900/80 p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-white">Recent Orders</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800/70">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-slate-300">Customer</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-slate-300">Status</th>
                <th className="px-4 py-2 text-right text-sm font-semibold text-slate-300">Amount</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-slate-300">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 10).map((order) => (
                <tr key={order._id} className="border-b border-white/10 hover:bg-slate-800/60">
                  <td className="px-4 py-2 text-slate-300">{order.customer}</td>
                  <td className="px-4 py-2">
                    <span className="rounded-full bg-blue-500/20 px-2 py-1 text-sm text-blue-300">
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right font-semibold text-white">
                    ₹{order.totalAmount}
                  </td>
                  <td className="px-4 py-2 text-slate-300">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
