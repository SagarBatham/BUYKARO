import { MainLayout } from '@/components/MainLayout';

export default function TermsOfServicePage() {
  return (
    <MainLayout>
      <div className="mx-auto max-w-4xl rounded-[28px] border border-white/10 bg-[#050505]/90 p-6 shadow-sm sm:p-8 lg:p-10">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-gray-500">Legal</p>
        <h1 className="text-3xl font-semibold text-white sm:text-4xl">Terms of Service</h1>

        <div className="mt-8 space-y-6 text-sm leading-7 text-gray-300 sm:text-base">
          <p>
            By using BuyKaro, you agree to these Terms of Service and all applicable laws and regulations.
          </p>

          <div>
            <h2 className="mb-2 text-lg font-semibold text-white">1. Use of the platform</h2>
            <p>
              You agree to use BuyKaro only for lawful purposes and not to misuse the platform, interfere with services,
              or attempt unauthorized access to accounts or systems.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-semibold text-white">2. Orders and payments</h2>
            <p>
              Product listings, pricing, and availability may change without notice. Orders are subject to confirmation and
              successful payment authorization. We reserve the right to refuse or cancel orders when necessary.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-semibold text-white">3. Account responsibility</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials and for all activity that
              occurs under your account. Please notify us immediately if you suspect unauthorized use.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-semibold text-white">4. Intellectual property</h2>
            <p>
              All platform content, branding, product descriptions, and design assets remain the property of BuyKaro unless
              otherwise stated. You may not reproduce or redistribute them without authorization.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-semibold text-white">5. Limitation of liability</h2>
            <p>
              BuyKaro is provided on an as-is basis. We do not guarantee uninterrupted access or error-free functionality.
              We are not liable for indirect, incidental, or consequential damages arising from the use of the service.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-semibold text-white">6. Changes to terms</h2>
            <p>
              We may update these Terms of Service at any time. Continued use of the platform after updates indicates
              acceptance of the revised terms.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
