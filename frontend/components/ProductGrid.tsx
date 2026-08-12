'use client';

import { useState, useEffect } from 'react';
import { cartAPI, productAPI } from '@/lib/apiServices';
import { useCartStore } from '@/store';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ShoppingCart, Search, SlidersHorizontal } from 'lucide-react';

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

export function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const categories = ['All Categories', 'Electronics', 'Clothing', 'Home', 'Books', 'Beauty', 'Sports'];
  const { addItem } = useCartStore();
  const { user } = useAuth();

  const PAGE_SIZE = 12;

  useEffect(() => {
    const categoryFromUrl = searchParams.get('category') || '';
    setSelectedCategory(categoryFromUrl);
  }, [searchParams]);

  useEffect(() => {
    const loadInitialProducts = async () => {
      setPage(0);
      setHasMore(true);
      await fetchProducts(0, true);
    };

    loadInitialProducts();
  }, [searchQuery, selectedCategory]);

  const fetchProducts = async (requestedPage: number, reset: boolean) => {
    setLoading(true);
    try {
      const params: any = {
        skip: requestedPage * PAGE_SIZE,
        limit: PAGE_SIZE,
      };
      if (searchQuery) params.q = searchQuery;
      if (selectedCategory) params.category = selectedCategory;

      const response = await productAPI.getProducts(params);
      const payload = response.data?.data || response.data?.products || [];
      const nextProducts = Array.isArray(payload) ? payload : [];
      setProducts((prev) => reset ? nextProducts : [...prev, ...nextProducts]);
      setHasMore(nextProducts.length === PAGE_SIZE);
    } catch (error) {
      console.error('Failed to fetch products', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set('category', value);
    } else {
      params.delete('category');
    }

    const queryString = params.toString();
    router.replace(`${pathname}${queryString ? `?${queryString}` : ''}`, { scroll: false });
    setSelectedCategory(value);
  };

  const handleLoadMore = async () => {
    if (loading || !hasMore) return;

    const nextPage = page + 1;
    setPage(nextPage);
    await fetchProducts(nextPage, false);
  };

  const handleAddToCart = async (product: Product) => {
    addItem({ productId: product._id, title: product.title, price: product.price.amount, quantity: 1 });

    if (user) {
      try {
        await cartAPI.addItem(product._id, 1);
      } catch (error) {
        console.error('Failed to sync cart item with backend:', error);
      }
    }

    alert(`${product.title} added to cart!`);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[24px] border border-white/10 bg-[#070707] p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <label className="flex items-center flex-1 gap-2 px-4 py-3 text-sm text-gray-400 border rounded-2xl border-white/10 bg-black/40">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-white bg-transparent border-none outline-none placeholder:text-gray-500"
            />
          </label>
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((category) => {
              const value = category === 'All Categories' ? '' : category;
              const active = selectedCategory === value;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => handleCategoryChange(value)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    active
                      ? 'bg-primary text-slate-950 shadow-md shadow-primary/20'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="rounded-[24px] border border-white/10 bg-[#070707] py-12 text-center text-sm text-gray-400 shadow-sm">Loading products...</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <div key={product._id} className="flex h-full flex-col overflow-hidden rounded-[24px] border border-white/10 bg-[#070707] shadow-sm transition hover:-translate-y-1 hover:shadow-[0_20px_60px_-20px_rgba(255,255,255,0.18)]">
              <Link href={`/products/${product._id}`} className="flex flex-col flex-1 group">
                <div className="h-48 overflow-hidden bg-[#111111]">
                  {(product.images?.[0]?.url || product.image) && <img src={product.images?.[0]?.url || product.image} alt={product.title} className="object-cover w-full h-full transition duration-500 group-hover:scale-105" />}
                </div>
                <div className="flex flex-col flex-1 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-gray-300">{product.category || 'Featured'}</span>
                    <span className="text-xs font-medium text-gray-500">{(product.stock ?? 0) > 0 ? 'In stock' : 'Sold out'}</span>
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-white line-clamp-2">{product.title}</h3>
                  <p className="mb-4 text-sm leading-6 text-gray-400 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-2xl font-semibold text-white">₹{product.price.amount}</span>
                    <span className="text-sm text-gray-500">Stock: {product.stock ?? 0}</span>
                  </div>
                </div>
              </Link>
              <button onClick={(e) => { e.preventDefault(); handleAddToCart(product); }} className="flex items-center justify-center gap-2 px-4 py-3 m-5 mt-0 text-sm font-semibold text-black transition bg-white rounded-full hover:opacity-90" disabled={(product.stock ?? 0) === 0}>
                <ShoppingCart size={18} />
                {(product.stock ?? 0) === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>
          ))}
        </div>
      )}

      {!loading && products.length === 0 && <div className="rounded-[24px] border border-white/10 bg-[#070707] py-12 text-center text-sm text-gray-400 shadow-sm">No products found</div>}

      {hasMore && products.length > 0 && (
        <div className="flex justify-center">
          <button onClick={handleLoadMore} disabled={loading} className="rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60">
            {loading ? 'Loading...' : 'Load more products'}
          </button>
        </div>
      )}
    </div>
  );
}
