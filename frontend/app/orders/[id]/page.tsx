'use client';

import { MainLayout } from '@/components/MainLayout';
import { useEffect, useState } from 'react';
import { orderAPI, paymentAPI } from '@/lib/apiServices';

function getStatusClasses(status: string) {
  switch (status?.toUpperCase()) {
    case 'COMPLETED':
      return 'bg-emerald-500/15 text-emerald-200 border border-emerald-500/20';
    case 'CONFIRMED':
      return 'bg-sky-500/15 text-sky-200 border border-sky-500/20';
    case 'SHIPPED':
      return 'bg-purple-500/15 text-purple-200 border border-purple-500/20';
    case 'DELIVERED':
      return 'bg-emerald-500/15 text-emerald-200 border border-emerald-500/20';
    case 'FAILED':
    case 'CANCELLED':
      return 'bg-rose-500/15 text-rose-200 border border-rose-500/20';
    case 'PENDING':
      return 'bg-amber-500/15 text-amber-200 border border-amber-500/20';
    default:
      return 'bg-slate-500/15 text-slate-200 border border-slate-500/20';
  }
}

const orderProgressSteps = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'] as const;

type OrderProgressStep = (typeof orderProgressSteps)[number];

interface OrderPageProps {
  params: { id: string };
}

export default function OrderDetailPage({ params }: OrderPageProps) {
  const [order, setOrder] = useState<any>(null);
  const [paymentStatus, setPaymentStatus] = useState<string>('PENDING');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const orderResponse = await orderAPI.getOrderById(params.id);
        setOrder(orderResponse.data?.data || null);

        try {
          const paymentResponse = await paymentAPI.getPaymentByOrder(params.id);
          setPaymentStatus(paymentResponse.data?.data?.status || 'PENDING');
        } catch (paymentError: any) {
          if (paymentError.response?.status === 404) {
            setPaymentStatus('NONE');
          } else {
            console.error('Payment status lookup failed', paymentError);
            setPaymentStatus('PENDING');
          }
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [params.id]);

  if (loading) {
    return (
      <MainLayout>
        <div className="rounded-[28px] border border-white/10 bg-slate-900/80 py-12 text-center text-sm text-slate-400">Loading order details...</div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-10 text-center shadow-sm">
          <h2 className="mb-4 text-2xl font-semibold text-white">Unable to load order</h2>
          <p className="text-sm text-red-400">{error}</p>
        </div>
      </MainLayout>
    );
  }

  if (!order) {
    return (
      <MainLayout>
        <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-10 text-center shadow-sm">
          <h2 className="mb-4 text-2xl font-semibold text-white">Order not found</h2>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
          <div>
            <p className="text-sm text-slate-400">Order ID</p>
            <h1 className="text-2xl font-semibold text-white">{order._id}</h1>
          </div>
          <span className="rounded-full bg-slate-800 px-4 py-2 text-sm text-white">{order.status}</span>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[20px] border border-white/10 bg-slate-950/50 p-4">
            <p className="text-sm text-slate-400">Total Amount</p>
            <p className="mt-2 text-xl font-semibold text-white">₹{order.totalPrice?.amount}</p>
          </div>
          <div className="rounded-[20px] border border-white/10 bg-slate-950/50 p-4">
            <p className="text-sm text-slate-400">Placed on</p>
            <p className="mt-2 text-white">{new Date(order.createdAt).toLocaleString()}</p>
          </div>
          <div className="rounded-[20px] border border-white/10 bg-slate-950/50 p-4">
            <p className="text-sm text-slate-400">Items</p>
            <p className="mt-2 text-white">{order.items.length}</p>
          </div>
        </div>

        <div className="rounded-[20px] border border-white/10 bg-slate-950/50 p-4">
          <h2 className="text-lg font-semibold text-white">Shipping Address</h2>
          <p className="mt-2 text-slate-400">{order.shippingAddress?.street}</p>
          <p className="text-slate-400">{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zip}</p>
          <p className="text-slate-400">{order.shippingAddress?.country}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[20px] border border-white/10 bg-slate-950/50 p-4">
            <h2 className="text-lg font-semibold text-white">Payment Status</h2>
            <p className={`mt-2 inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium ${paymentStatus === 'NONE' ? 'bg-slate-500/15 text-slate-200 border border-slate-500/20' : getStatusClasses(paymentStatus)}`}>
              {paymentStatus === 'NONE' ? 'No payment record' : paymentStatus?.toUpperCase()}
            </p>
          </div>
          <div className="rounded-[20px] border border-white/10 bg-slate-950/50 p-4">
            <h2 className="text-lg font-semibold text-white">Order Status</h2>
            <p className={`mt-2 inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium ${getStatusClasses(order.status)}`}>
              {order.status?.toUpperCase()}
            </p>
          </div>
        </div>

        <div className="rounded-[20px] border border-white/10 bg-slate-950/50 p-4">
          <h2 className="text-lg font-semibold text-white">Order Progress</h2>
          <div className="mt-4 grid gap-3">
            {orderProgressSteps.map((step) => {
              const currentIndex = orderProgressSteps.indexOf(order.status as OrderProgressStep);
              const stepIndex = orderProgressSteps.indexOf(step);
              const stepState = stepIndex <= currentIndex ? 'completed' : 'pending';
              return (
                <div key={step} className="flex items-center gap-3">
                  <span className={`inline-flex h-3 w-3 rounded-full ${stepState === 'completed' ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                  <span className={`text-sm font-medium ${stepState === 'completed' ? 'text-white' : 'text-slate-400'}`}>
                    {step.toLowerCase().replace(/^(.)/, (m) => m.toUpperCase())}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-[20px] border border-white/10 bg-slate-950/50 p-4">
          <h2 className="text-lg font-semibold text-white">Order Items</h2>
          <div className="mt-4 space-y-3">
            {order.items.map((item: any, idx: number) => (
              <div key={idx} className="grid gap-4 rounded-2xl bg-slate-900/70 p-4 md:grid-cols-[96px_auto]">
                {item.product?.images?.[0]?.url ? (
                  <img
                    src={item.product.images[0].url}
                    alt={item.product.title || 'Product image'}
                    className="h-24 w-24 rounded-2xl object-cover"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-slate-800 text-sm text-slate-400">
                    No image
                  </div>
                )}

                <div className="space-y-2">
                  <div>
                    <p className="font-semibold text-white">{item.product?.title || item.product}</p>
                    {item.product?.description ? (
                      <p className="mt-1 text-sm text-slate-400 line-clamp-2">{item.product.description}</p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm text-slate-400">
                    <span>Qty: {item.quantity}</span>
                    <span>
                      Price: ₹{item.price?.amount || item.price}
                      {item.price?.currency ? ` ${item.price.currency}` : ''}
                    </span>
                    {item.product?.seller ? <span>Seller: {item.product.seller}</span> : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
