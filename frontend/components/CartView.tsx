'use client';

import { useEffect } from 'react';
import { useCartStore } from '@/store';
import { cartAPI, productAPI } from '@/lib/apiServices';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';

export function CartView() {
  const { items, removeItem, updateQuantity, clearCart, getTotalPrice, setItems } = useCartStore();
  const { user } = useAuth();

  useEffect(() => {
    const loadBackendCart = async () => {
      if (!user) return;

      try {
        const cartResponse = await cartAPI.getCart();
        const backendItems = cartResponse.data?.items || cartResponse.data?.cart?.items || [];

        if (!Array.isArray(backendItems) || backendItems.length === 0) return;

        const normalizedItems = await Promise.all(
          backendItems.map(async (item: any) => {
            const productId = item.productId?.toString?.() || item.product?.toString?.();
            const quantity = item.quantity || item.qty || 1;
            let title = item.title || item.product?.title || '';
            let price = Number(item.price?.amount ?? item.price ?? 0);

            if (!title || !price) {
              try {
                const productResponse = await productAPI.getProductById(productId);
                const product = productResponse.data?.product || productResponse.data?.data;
                title = title || product?.title || '';
                price = Number(product?.price?.amount || 0);
              } catch (productError) {
                console.warn('Failed to load product details for cart item', productId, productError);
              }
            }

            return {
              productId,
              title,
              price,
              quantity,
            };
          })
        );

        setItems(normalizedItems);
      } catch (error) {
        console.error('Failed to load cart items from backend:', error);
      }
    };

    loadBackendCart();
  }, [user, setItems]);

  const handleUpdateQuantity = async (productId: string, quantity: number) => {
    if (quantity < 1) return;

    if (user) {
      try {
        await cartAPI.updateItem(productId, quantity);
      } catch (error) {
        console.error('Failed to update cart item on backend:', error);
      }
    }

    updateQuantity(productId, quantity);
  };

  const handleRemoveItem = async (productId: string) => {
    if (user) {
      try {
        await cartAPI.removeItem(productId);
      } catch (error) {
        console.error('Failed to remove cart item on backend:', error);
      }
    }

    removeItem(productId);
  };

  const handleClearCart = async () => {
    if (user) {
      try {
        await cartAPI.clearCart();
      } catch (error) {
        console.error('Failed to clear backend cart:', error);
      }
    }

    clearCart();
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl rounded-[28px] border border-white/10 bg-[#060606] p-8 text-center shadow-sm sm:p-10">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white">
          <ShoppingBag size={24} />
        </div>
        <h2 className="mb-3 text-2xl font-semibold text-white">Your cart is empty</h2>
        <p className="mb-6 text-sm leading-6 text-gray-400">Browse our collection and add your favorite items to begin checkout.</p>
        <Link href="/products" className="inline-flex items-center gap-2 rounded-full bg-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:bg-violet-500">
          Continue shopping
          <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[24px] border border-white/10 bg-[#060606] p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 sm:text-sm">Cart</p>
            <h1 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">Shopping Cart</h1>
          </div>
          <p className="text-sm text-gray-400">{items.length} item{items.length > 1 ? 's' : ''} ready for checkout</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-[24px] border border-white/10 bg-[#060606] shadow-sm sm:rounded-[28px]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px]">
            <thead className="bg-[#0c0c0c]">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-400">Product</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-400">Price</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-400">Quantity</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-400">Total</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-400">Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const numericPrice = typeof item.price === 'object' && item.price !== null
                  ? Number(item.price.amount ?? 0)
                  : Number(item.price ?? 0);

                return (
                  <tr key={item.productId} className="border-t border-white/10">
                    <td className="px-4 py-4 text-sm font-medium text-white sm:text-base">{item.title}</td>
                    <td className="px-4 py-4 text-right text-sm text-gray-300 sm:text-base">₹{numericPrice}</td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleUpdateQuantity(item.productId, Math.max(1, item.quantity - 1))} className="rounded-full border border-white/10 p-1.5 text-gray-300 transition hover:bg-white/10">
                          <Minus size={14} />
                        </button>
                        <input type="number" value={item.quantity} onChange={(e) => handleUpdateQuantity(item.productId, parseInt(e.target.value) || 1)} className="w-12 rounded-full border border-white/10 bg-[#111111] px-2 py-1 text-center text-sm text-white outline-none" min="1" />
                        <button onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)} className="rounded-full border border-white/10 p-1.5 text-gray-300 transition hover:bg-white/10">
                          <Plus size={14} />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right text-sm font-semibold text-white sm:text-base">₹{numericPrice * item.quantity}</td>
                    <td className="px-4 py-4 text-center">
                      <button onClick={() => handleRemoveItem(item.productId)} className="rounded-full p-2 text-red-400 transition hover:bg-white/10">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col justify-end gap-3 rounded-[24px] border border-white/10 bg-[#060606] p-4 shadow-sm sm:p-6 md:flex-row md:items-center">
        <button onClick={handleClearCart} className="rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-gray-300 transition hover:bg-white/10">Clear Cart</button>
        <div className="md:ml-auto md:text-right">
          <p className="mb-2 text-sm text-gray-400">Subtotal <span className="ml-2 font-semibold text-white">₹{getTotalPrice()}</span></p>
          <Link href="/checkout" className="inline-flex items-center justify-center gap-2 rounded-full bg-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:bg-violet-500">
            Proceed to Checkout
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
