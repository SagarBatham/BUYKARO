import { MainLayout } from '@/components/MainLayout';

export default function ShippingPolicyPage() {
  return (
    <MainLayout>
      <div className="mx-auto max-w-4xl rounded-[28px] border border-white/10 bg-[#050505]/90 p-6 shadow-sm sm:p-8 lg:p-10">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-gray-500">Legal</p>
        <h1 className="text-3xl font-semibold text-white sm:text-4xl">Shipping Policy</h1>

        <div className="mt-8 space-y-6 text-sm leading-7 text-gray-300 sm:text-base">
          <p>
            We aim to dispatch orders promptly and deliver them in a safe, reliable, and timely manner.
          </p>

          <div>
            <h2 className="mb-2 text-lg font-semibold text-white">1. Processing time</h2>
            <p>
              Orders are typically processed within 1 to 3 business days, depending on stock availability and verification.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-semibold text-white">2. Delivery timeline</h2>
            <p>
              Delivery times vary by location and shipping method. Domestic orders generally arrive within 3 to 7 business
              days after dispatch, while remote locations may require additional time.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-semibold text-white">3. Shipping charges</h2>
            <p>
              Shipping charges may apply depending on the order value, weight, and destination. Free shipping may be offered
              on selected products or order thresholds at our discretion.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-semibold text-white">4. Order tracking</h2>
            <p>
              Once shipped, customers will receive tracking information or an order update through the communication channel
              provided during checkout.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-semibold text-white">5. Delays and exceptions</h2>
            <p>
              Shipping delays can occur due to weather, courier issues, public holidays, customs procedures, or other forces
              beyond our control. We will keep customers informed whenever such delays arise.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-semibold text-white">6. Address errors</h2>
            <p>
              Buyers are responsible for ensuring shipping addresses are accurate and complete. Additional charges may be
              incurred if a package is returned or reshipped because of incorrect address details.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
