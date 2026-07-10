'use client';

import { useWishlistStore } from '@/store/useWishlistStore';
import ProductCard from '@/components/ProductCard';
import { HeartOff, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function WishlistPage() {
  const { items } = useWishlistStore();

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mb-6">
          <HeartOff className="w-12 h-12" />
        </div>
        <h2 className="text-4xl font-bold mb-3">Your Wishlist is Empty</h2>
        <p className="text-gray-600 mb-8 max-w-md">
          Save your favorite items here to keep track of them and buy them later!
        </p>
        <Link
          href="/products"
          className="bg-black text-white px-8 py-4 rounded-2xl font-medium hover:bg-gray-800 transition shadow-lg hover:scale-105"
        >
          Browse Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-5xl font-bold">My Wishlist</h1>
        <p className="text-gray-600 mt-3 text-lg">
          You have {items.length} items saved in your favorites
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {items.map((product) => (
          <ProductCard key={product._id} product={product as any} />
        ))}
      </div>
    </div>
  );
}
