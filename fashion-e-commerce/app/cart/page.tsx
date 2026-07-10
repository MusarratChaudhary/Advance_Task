// app/cart/page.tsx
'use client';
import { useCartStore } from '@/store/useCartStore';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCartStore();
  const router = useRouter();

  const handleCheckout = () => {
    if (items.length === 0) return;
    router.push('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <ShoppingBag className="w-24 h-24 text-gray-300 mb-6" />
        <h2 className="text-4xl font-bold mb-3">Your Cart is Empty</h2>
        <p className="text-gray-600 mb-8 max-w-md">Looks like you haven&apos;t added anything yet. Start shopping!</p>
        <Link
          href="/products"
          className="btn-premium bg-gradient-to-r from-purple-600 to-pink-500 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <h1 className="text-3xl sm:text-4xl font-bold mb-8 sm:mb-10">Your Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item, index) => (
            <div key={`${item.product._id}-${index}`} className="card-premium bg-white rounded-3xl p-4 sm:p-6 flex flex-col sm:flex-row gap-4 border border-gray-100/80 shadow-md">
              <div className="relative w-full sm:w-28 h-48 sm:h-28 flex-shrink-0">
                <Image
                  src={item.product.images[0]}
                  alt={item.product.name}
                  fill
                  sizes="(max-width: 640px) 100vw, 112px"
                  className="object-cover rounded-2xl"
                />
              </div>

              <div className="flex-1">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h3 className="font-semibold text-base sm:text-lg leading-tight">{item.product.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {item.selectedSize && `Size: ${item.selectedSize}`}
                      {item.selectedColor && ` • Color: ${item.selectedColor}`}
                    </p>
                  </div>
                  <button
                    onClick={() => removeItem(item.product._id, item.selectedSize, item.selectedColor)}
                    className="text-red-400 hover:text-white hover:bg-red-500 p-2 rounded-xl transition-all duration-200 flex-shrink-0 hover:scale-105 active:scale-95"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
                  <div className="flex items-center border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                    <button
                      onClick={() => updateQuantity(item.product._id, item.quantity - 1, item.selectedSize, item.selectedColor)}
                      className="px-3 sm:px-4 py-2 hover:bg-purple-50 hover:text-purple-600 rounded-l-2xl transition-all duration-200 active:bg-purple-100"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 sm:px-6 font-semibold text-gray-800">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product._id, item.quantity + 1, item.selectedSize, item.selectedColor)}
                      className="px-3 sm:px-4 py-2 hover:bg-purple-50 hover:text-purple-600 rounded-r-2xl transition-all duration-200 active:bg-purple-100"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold text-lg">
                      Rs. {(item.product.price * item.quantity).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">Rs. {item.product.price.toLocaleString()} each</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl p-8 sticky top-8 border border-gray-100 shadow-lg shadow-gray-100/50 relative overflow-hidden">
            {/* Accent line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-400 rounded-t-3xl" />
            <h2 className="text-2xl font-semibold mb-6">Order Summary</h2>

            <div className="space-y-4">
              <div className="flex justify-between text-lg">
                <span>Subtotal</span>
                <span>Rs. {getTotalPrice().toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-lg">
                <span>Shipping</span>
                <span className="text-green-600 font-semibold">Free</span>
              </div>
              <div className="border-t pt-4 flex justify-between text-xl font-bold">
                <span>Total</span>
                <span className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">Rs. {getTotalPrice().toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="btn-premium w-full mt-8 bg-gradient-to-r from-purple-600 to-pink-500 text-white py-4 rounded-2xl text-lg font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
            >
              Proceed to Checkout
            </button>

            <button
              onClick={clearCart}
              className="w-full mt-4 text-red-500 hover:text-red-600 py-3 text-sm font-medium hover:bg-red-50 rounded-2xl transition-all duration-200"
            >
              Clear Cart
            </button>

            <p className="text-center text-xs text-gray-400 mt-6 flex items-center justify-center gap-1">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
              Secure checkout powered by Stripe
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}