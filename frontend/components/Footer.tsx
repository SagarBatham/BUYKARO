'use client';

export function Footer() {
  return (
    <footer className="mt-16 border-t border-white/10 bg-slate-950/95 py-12 text-white">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <h3 className="mb-4 text-2xl font-semibold">BuyKaro</h3>
            <p className="text-sm leading-6 text-slate-400">Shop smarter with curated products, fast delivery, and a seamless buying experience.</p>
          </div>
          <div>
            <h4 className="mb-4 font-semibold">Quick Links</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="/products" className="transition hover:text-white">Products</a></li>
              <li><a href="/cart" className="transition hover:text-white">Cart</a></li>
              <li><a href="/orders" className="transition hover:text-white">Orders</a></li>
              <li><a href="/seller" className="transition hover:text-white">Seller Dashboard</a></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-semibold">Support</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="/login" className="transition hover:text-white">Login</a></li>
              <li><a href="/register" className="transition hover:text-white">Register</a></li>
              <li><a href="/checkout" className="transition hover:text-white">Checkout</a></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-semibold">Legal</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="/privacy" className="transition hover:text-white">Privacy Policy</a></li>
              <li><a href="/terms" className="transition hover:text-white">Terms of Service</a></li>
              <li><a href="/shipping" className="transition hover:text-white">Shipping Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-slate-800 pt-8 text-center text-sm text-slate-400">
          <p>&copy; 2024 BuyKaro. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
