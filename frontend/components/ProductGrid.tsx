'use client';

import { useState, useEffect } from 'react';
import { productAPI } from '@/lib/apiServices';
import { useCartStore } from '@/store';
import Link from 'next/link';
import { ShoppingCart, Search, SlidersHorizontal } from 'lucide-react';

interface Product {
  _id: string;
  title: string;
  description: string;
  price: { amount: number; currency: string };
  image: string;
  category: string;
  stock: number;
}

export function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const { addItem } = useCartStore();

  useEffect(() => {
    fetchProducts();
  }, [searchQuery, selectedCategory]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (searchQuery) params.q = searchQuery;
      if (selectedCategory) params.category = selectedCategory;

      const response = await productAPI.getProducts(params);
      setProducts(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch products', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product: Product) => {
    addItem({ productId: product._id, title: product.title, price: product.price.amount, quantity: 1 });
    alert(`${product.title} added to cart!`);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-4 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-3 md:flex-row">
          <label className="flex flex-1 items-center gap-2 rounded-2xl border border-white/10 bg-slate-800/80 px-4 py-3 text-sm text-slate-400">
            <Search size={16} />
            <input type="text" placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full border-none bg-transparent text-white outline-none placeholder:text-slate-500" />
          </label>
          <label className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-800/80 px-4 py-3 text-sm text-slate-400">
            <SlidersHorizontal size={16} />
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="min-w-[180px] border-none bg-transparent text-white outline-none">
              <option value="">All Categories</option>
              <option value="Electronics">Electronics</option>
              <option value="Clothing">Clothing</option>
              <option value="Books">Books</option>
              <option value="Home">Home & Garden</option>
            </select>
          </label>
        </div>
      </div>

      {loading ? (
        <div className="rounded-[24px] border border-white/10 bg-slate-900/70 py-12 text-center text-sm text-slate-400 shadow-sm">Loading products...</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <div key={product._id} className="flex h-full flex-col overflow-hidden rounded-[24px] border border-white/10 bg-slate-900/75 shadow-sm transition hover:-translate-y-1 hover:shadow-[0_20px_60px_-20px_rgba(37,99,235,0.45)]">
              <Link href={`/products/${product._id}`} className="group flex flex-1 flex-col">
                <div className="h-48 overflow-hidden bg-slate-800">
                  {product.image && <img src={product.image} alt={product.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="rounded-full bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-300">{product.category || 'Featured'}</span>
                    <span className="text-xs font-medium text-slate-400">{product.stock > 0 ? 'In stock' : 'Sold out'}</span>
                  </div>
                  <h3 className="mb-2 line-clamp-2 text-lg font-semibold text-white">{product.title}</h3>
                  <p className="mb-4 line-clamp-2 text-sm leading-6 text-slate-400">{product.description}</p>
                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-2xl font-semibold text-primary">₹{product.price.amount}</span>
                    <span className="text-sm text-slate-500">Stock: {product.stock}</span>
                  </div>
                </div>
              </Link>
              <button onClick={(e) => { e.preventDefault(); handleAddToCart(product); }} className="m-5 mt-0 flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90" disabled={product.stock === 0}>
                <ShoppingCart size={18} />
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>
          ))}
        </div>
      )}

      {!loading && products.length === 0 && <div className="rounded-[24px] border border-white/10 bg-slate-900/70 py-12 text-center text-sm text-slate-400 shadow-sm">No products found</div>}
    </div>
  );
}
