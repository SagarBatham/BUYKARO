'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/MainLayout';
import { orderAPI, paymentAPI } from '@/lib/apiServices';

interface PaymentPageProps {
  params: { id: string };
}

export default function PaymentPage({ params }: PaymentPageProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentData, setPaymentData] = useState<any>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    const loadRazorpayScript = () => {
      if (typeof window === 'undefined') return;
      if ((window as any).Razorpay) {
        setScriptLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => setScriptLoaded(true);
      script.onerror = () => setError('Failed to load Razorpay checkout script');
      document.body.appendChild(script);
    };

    loadRazorpayScript();
  }, []);

  useEffect(() => {
    const createPaymentOrder = async () => {
      try {
        setLoading(true);
        const orderRes = await orderAPI.getOrderById(params.id);
        const order = orderRes.data?.data;

        if (!order) {
          throw new Error('Order not found');
        }

        const response = await paymentAPI.createRazorpayOrder(params.id, order.totalPrice.amount);
        const razorpayOrder = response.data?.razorpayOrder;

        if (!razorpayOrder) {
          throw new Error('Failed to create Razorpay order');
        }

        setPaymentData({ order, razorpayOrder });
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || 'Failed to initialize payment');
      } finally {
        setLoading(false);
      }
    };

    createPaymentOrder();
  }, [params.id]);

  const openCheckout = async () => {
    if (!scriptLoaded || !paymentData) return;

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: paymentData.razorpayOrder.amount,
      currency: paymentData.razorpayOrder.currency,
      name: 'BuyKaro',
      description: `Order #${params.id}`,
      order_id: paymentData.razorpayOrder.id,
      handler: async (response: any) => {
        try {
          await paymentAPI.verifyPayment({
            razorpayOrderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
          });
          router.push(`/orders/${params.id}`);
        } catch (verifyError: any) {
          setError(verifyError.response?.data?.message || verifyError.message || 'Payment verification failed');
        }
      },
      prefill: {
        name: paymentData.order?.user?.username || '',
        email: paymentData.order?.user?.email || '',
      },
      theme: { color: '#6366f1' },
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  };

  return (
    <MainLayout>
      <div className="rounded-[32px] border border-white/10 bg-slate-900/80 p-10 text-center shadow-sm">
        <h1 className="text-3xl font-semibold text-white">Payment</h1>
        {loading ? (
          <p className="mt-6 text-slate-400">Preparing your payment...</p>
        ) : error ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">{error}</div>
        ) : (
          <div className="mt-6 space-y-4">
            <p className="text-slate-400">Order total: ₹{paymentData.order.totalPrice.amount}</p>
            <button
              onClick={openCheckout}
              disabled={!scriptLoaded}
              className="inline-flex rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {scriptLoaded ? 'Pay with Razorpay' : 'Loading payment...'}
            </button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
