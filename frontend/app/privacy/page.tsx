import { MainLayout } from '@/components/MainLayout';

export default function PrivacyPolicyPage() {
  return (
    <MainLayout>
      <div className="mx-auto max-w-4xl rounded-[28px] border border-white/10 bg-[#050505]/90 p-6 shadow-sm sm:p-8 lg:p-10">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-gray-500">Legal</p>
        <h1 className="text-3xl font-semibold text-white sm:text-4xl">Privacy Policy</h1>

        <div className="mt-8 space-y-6 text-sm leading-7 text-gray-300 sm:text-base">
          <p>
            BuyKaro is committed to protecting your personal information and being transparent about how we collect,
            use, and safeguard data across our website and services.
          </p>

          <div>
            <h2 className="mb-2 text-lg font-semibold text-white">1. Information we collect</h2>
            <p>
              We may collect information such as your name, email address, shipping address, phone number, order history,
              product preferences, and payment information required to complete transactions.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-semibold text-white">2. How we use information</h2>
            <p>
              We use your information to process orders, provide customer support, improve user experience, personalize
              recommendations, prevent fraud, and comply with legal obligations.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-semibold text-white">3. Sharing information</h2>
            <p>
              We may share data with trusted service providers involved in shipping, payment processing, analytics, and
              platform security, but we do not sell personal information to third parties for marketing purposes.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-semibold text-white">4. Cookies and tracking</h2>
            <p>
              We may use cookies and similar technologies to remember login sessions, analyze usage trends, and optimize
              the shopping experience. You may adjust browser settings to disable cookies, though some features may be affected.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-semibold text-white">5. Your rights</h2>
            <p>
              You have the right to access, update, or delete your personal data where applicable, and to request information
              about how your data is being processed. Contact our support team to exercise these rights.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-semibold text-white">6. Security</h2>
            <p>
              We use reasonable technical and organizational safeguards to protect personal data against unauthorized access,
              disclosure, or loss. However, no internet-based system is completely immune to risk.
            </p>
          </div>

          <p>
            This policy may change occasionally. Any updates will be reflected on this page with the latest revision date.
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
