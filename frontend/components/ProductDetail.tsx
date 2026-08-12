'use client';

import { useState, useEffect } from 'react';
import { cartAPI, productAPI } from '@/lib/apiServices';
import { useCartStore } from '@/store';
import { useAuth } from '@/hooks/useAuth';
import { ShoppingCart, Star, ShieldCheck, Truck, RotateCcw } from 'lucide-react';

interface Product {
  _id: string;
  title: string;
  description: string;
  price: { amount: number; currency: string };
  image?: string;
  images?: Array<{ url?: string }>;
  category?: string;
  stock?: number;
}

interface ProductDetailProps {
  productId: string;
}

export function ProductDetail({ productId }: ProductDetailProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCartStore();
  const { user } = useAuth();

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const response = await productAPI.getProductById(productId);
      const payload = response.data?.product || response.data?.data || null;
      setProduct(payload);
    } catch (error) {
      console.error('Failed to fetch product', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    addItem({ productId: product._id, title: product.title, price: product.price.amount, quantity });

    if (user) {
      try {
        await cartAPI.addItem(product._id, quantity);
      } catch (error) {
        console.error('Failed to sync cart item with backend:', error);
      }
    }

    alert(`${product.title} added to cart!`);
  };

  if (loading) return <div className="rounded-[32px] border border-white/10 bg-slate-900/80 py-16 text-center text-sm text-slate-400 shadow-sm">Loading product...</div>;
  if (!product) return <div className="rounded-[32px] border border-white/10 bg-slate-900/80 py-16 text-center text-sm text-slate-400 shadow-sm">Product not found</div>;

  return (
    <div className="rounded-[32px] border border-white/10 bg-slate-900/80 p-6 shadow-[0_20px_70px_-30px_rgba(15,23,42,0.9)] sm:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-slate-800 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            <span>{product.category || 'Featured'}</span>
          </div>
          <h1 className="text-4xl font-semibold text-white sm:text-5xl">{product.title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">Premium styling and rich product details for a superior shopping experience.</p>
        </div>
        <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-slate-300">
          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
          {product.stock && product.stock > 0 ? 'In stock' : 'Out of stock'}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.9fr]">
        <div className="space-y-6">
          <div className="overflow-hidden rounded-[32px] border border-white/10 bg-slate-800 shadow-lg shadow-black/20">
            {(product.images?.[0]?.url || product.image) ? (
              <img src={product.images?.[0]?.url || product.image} alt={product.title} className="h-[520px] w-full object-cover" />
            ) : (
              <div className="flex h-[520px] items-center justify-center bg-slate-900 text-slate-500">Image not available</div>
            )}
          </div>

          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-3 gap-3">
              {product.images.slice(0, 3).map((img, idx) => (
                <div key={idx} className="overflow-hidden rounded-[24px] border border-white/10 bg-slate-800">
                  <img src={img.url} alt={`${product.title} ${idx + 1}`} className="h-24 w-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-[28px] border border-white/10 bg-slate-800/80 p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Price</p>
                <p className="mt-2 text-5xl font-semibold text-white">₹{product.price.amount}</p>
              </div>
              <div className="rounded-2xl bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200">{product.price.currency}</div>
            </div>

            <div className="mt-6 grid gap-3 text-sm text-slate-300">
              <div className="rounded-2xl bg-slate-900/70 p-4">
                <p className="text-slate-400">Category</p>
                <p className="mt-1 font-medium text-white">{product.category || 'General'}</p>
              </div>
              <div className="rounded-2xl bg-slate-900/70 p-4">
                <p className="text-slate-400">Stock</p>
                <p className="mt-1 font-medium text-white">{product.stock ?? 0} units</p>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-slate-800/80 p-6">
            <h2 className="mb-4 text-xl font-semibold text-white">Product Details</h2>
            <p className="leading-7 text-slate-300">{product.description}</p>
          </div>

          <div className="space-y-4 rounded-[28px] border border-white/10 bg-slate-800/80 p-6">
            <div className="space-y-3">
              <label className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">Quantity</label>
              <div className="flex items-center gap-3 rounded-full border border-white/10 bg-slate-900/70 px-3 py-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="rounded-full px-4 py-2 text-lg text-slate-300 transition hover:bg-slate-700"
                >
                  −
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 rounded-full border border-white/10 bg-slate-900 px-3 py-2 text-center text-white outline-none"
                  min="1"
                  max={product.stock ?? 0}
                />
                <button
                  onClick={() => setQuantity(Math.min(product.stock ?? 0, quantity + 1))}
                  className="rounded-full px-4 py-2 text-lg text-slate-300 transition hover:bg-slate-700"
                >
                  +
                </button>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={(product.stock ?? 0) === 0}
              className="flex w-full items-center justify-center gap-3 rounded-full bg-primary px-5 py-4 text-sm font-semibold text-slate-950 transition hover:opacity-90 disabled:opacity-60"
            >
              <ShoppingCart size={20} />
              {(product.stock ?? 0) === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>

          <div className="grid gap-3 rounded-[28px] border border-white/10 bg-slate-800/80 p-5 text-sm text-slate-300 sm:grid-cols-3">
            <div className="flex items-center gap-2"><Truck size={16} className="text-primary" /><span>Free shipping</span></div>
            <div className="flex items-center gap-2"><RotateCcw size={16} className="text-primary" /><span>30-day returns</span></div>
            <div className="flex items-center gap-2"><ShieldCheck size={16} className="text-primary" /><span>Secure checkout</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
