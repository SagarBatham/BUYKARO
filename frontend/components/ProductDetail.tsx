'use client';

import { useState, useEffect } from 'react';
import { productAPI } from '@/lib/apiServices';
import { useCartStore } from '@/store';
import { ShoppingCart, Star, ShieldCheck, Truck, RotateCcw } from 'lucide-react';

interface Product {
  _id: string;
  title: string;
  description: string;
  price: { amount: number; currency: string };
  image: string;
  category: string;
  stock: number;
}

interface ProductDetailProps {
  productId: string;
}

export function ProductDetail({ productId }: ProductDetailProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCartStore();

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const response = await productAPI.getProductById(productId);
      setProduct(response.data.data);
    } catch (error) {
      console.error('Failed to fetch product', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addItem({ productId: product._id, title: product.title, price: product.price.amount, quantity });
      alert(`${product.title} added to cart!`);
    }
  };

  if (loading) return <div className="rounded-[32px] border border-white/10 bg-slate-900/80 py-16 text-center text-sm text-slate-400 shadow-sm">Loading product...</div>;
  if (!product) return <div className="rounded-[32px] border border-white/10 bg-slate-900/80 py-16 text-center text-sm text-slate-400 shadow-sm">Product not found</div>;

  return (
    <div className="rounded-[32px] border border-white/10 bg-slate-900/80 p-6 shadow-[0_20px_70px_-30px_rgba(15,23,42,0.9)] sm:p-8">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="overflow-hidden rounded-[28px] border border-white/10 bg-slate-800">
          {product.image && <img src={product.image} alt={product.title} className="h-[420px] w-full object-cover" />}
        </div>

        <div className="space-y-6">
          <div>
            <div className="mb-3 inline-flex rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">{product.category}</div>
            <h1 className="text-3xl font-semibold text-white">{product.title}</h1>
            <div className="mt-3 flex items-center gap-2 text-sm text-slate-400">
              <div className="flex">
                {[...Array(5)].map((_, i) => <Star key={i} size={16} className={i < 4 ? 'fill-amber-400 text-amber-400' : 'text-slate-300'} />)}
              </div>
              <span>(128 reviews)</span>
            </div>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-slate-800/70 p-5">
            <p className="text-4xl font-semibold text-primary">₹{product.price.amount}</p>
            <p className="mt-1 text-sm text-slate-400">{product.price.currency}</p>
          </div>

          <div>
            <h3 className="mb-2 text-lg font-semibold text-white">Description</h3>
            <p className="leading-7 text-slate-400">{product.description}</p>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-slate-800/70 p-4 text-sm text-slate-400">
            <p><strong>Stock available:</strong> {product.stock} units</p>
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <label className="text-sm font-semibold text-slate-300">Quantity</label>
              <div className="flex items-center overflow-hidden rounded-full border border-white/10 bg-slate-800">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-2 text-lg text-slate-300 transition hover:bg-slate-700">−</button>
                <input type="number" value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} className="w-16 border-none bg-transparent text-center text-white outline-none" min="1" max={product.stock} />
                <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="px-4 py-2 text-lg text-slate-300 transition hover:bg-slate-700">+</button>
              </div>
            </div>

            <button onClick={handleAddToCart} disabled={product.stock === 0} className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60">
              <ShoppingCart size={18} />
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>

          <div className="grid gap-3 rounded-[24px] border border-white/10 bg-slate-800/70 p-4 text-sm text-slate-400 sm:grid-cols-3">
            <div className="flex items-center gap-2"><Truck size={16} className="text-primary" /> Free shipping</div>
            <div className="flex items-center gap-2"><RotateCcw size={16} className="text-primary" /> 30-day returns</div>
            <div className="flex items-center gap-2"><ShieldCheck size={16} className="text-primary" /> Secure checkout</div>
          </div>
        </div>
      </div>
    </div>
  );
}
