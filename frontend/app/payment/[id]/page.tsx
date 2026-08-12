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
      <div className="mx-auto max-w-3xl rounded-[32px] border border-white/10 bg-[#040404]/95 p-8 shadow-[0_30px_100px_-40px_rgba(15,23,42,0.9)]">
        <div className="flex flex-col gap-6 rounded-[28px] border border-white/10 bg-slate-950/90 p-8 shadow-sm">
          <div className="space-y-3 text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-primary">Secure payment</p>
            <h1 className="text-4xl font-semibold text-white">Complete your purchase</h1>
            <p className="mx-auto max-w-2xl text-sm leading-7 text-slate-400">Finish your order with a fast and secure checkout flow. Razorpay handles payments and we immediately verify your transaction.</p>
          </div>

          {loading ? (
            <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-8 text-center text-slate-400 shadow-sm">
              <p>Preparing your payment...</p>
            </div>
          ) : error ? (
            <div className="rounded-[28px] border border-red-500/20 bg-red-500/10 p-6 text-sm text-red-100 shadow-sm">
              {error}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="rounded-[28px] border border-white/10 bg-[#0d0d12]/80 p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Order ID</p>
                    <p className="mt-2 text-base font-semibold text-white">#{params.id}</p>
                  </div>
                  <div className="rounded-3xl bg-white/5 px-4 py-2 text-sm text-slate-300">₹{paymentData.order.totalPrice.amount}</div>
                </div>
                <p className="mt-4 text-sm text-slate-400">Total due now. Your payment details are encrypted and securely transmitted through Razorpay.</p>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-slate-950/90 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-white">Billing summary</h2>
                <div className="mt-4 grid gap-4 text-sm text-slate-400">
                  <div className="flex items-center justify-between"><span>Subtotal</span><span className="text-white">₹{paymentData.order.totalPrice.amount}</span></div>
                  <div className="flex items-center justify-between"><span>Convenience fee</span><span className="text-white">₹0</span></div>
                  <div className="flex items-center justify-between"><span className="font-semibold text-white">Total</span><span className="font-semibold text-white">₹{paymentData.order.totalPrice.amount}</span></div>
                </div>
              </div>

              <button
                onClick={openCheckout}
                disabled={!scriptLoaded}
                className="w-full rounded-full bg-primary px-7 py-4 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {scriptLoaded ? 'Pay with Razorpay' : 'Loading payment...'}
              </button>

              <p className="text-center text-sm text-slate-500">After successful payment, you’ll be redirected to your order page for confirmation and tracking.</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
