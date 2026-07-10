'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCartStore } from '@/store/useCartStore';
import { CheckCircle } from 'lucide-react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const clearCart = useCartStore((state) => state.clearCart);

  const orderId = searchParams.get('order_id');
  const [countdown, setCountdown] = useState(4);

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  // Countdown then redirect to order tracking page
  useEffect(() => {
    if (!orderId) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          router.push(`/orders/${orderId}`);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [orderId, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-16 px-4">
      <div className="max-w-md w-full bg-white p-8 md:p-12 rounded-3xl shadow-xl text-center border border-gray-100">

        {/* Animated check */}
        <div className="inline-flex items-center justify-center w-24 h-24 bg-emerald-50 rounded-full text-emerald-500 mb-8 animate-bounce">
          <CheckCircle className="w-12 h-12" />
        </div>

        <h1 className="text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">Order Confirmed!</h1>
        <p className="text-gray-500 text-base mb-8">
          Thank you for shopping with Threadly. Your order has been placed successfully.
        </p>

        {orderId && (
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-8 text-left">
            <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Order Reference</div>
            <div className="font-mono text-gray-800 break-all font-semibold text-sm select-all">
              #{orderId}
            </div>
          </div>
        )}

        {orderId ? (
          <div className="space-y-4">
            <p className="text-gray-500 text-sm">
              Redirecting to your order tracking in{' '}
              <span className="font-extrabold text-purple-600 text-lg">{countdown}</span>
              {' '}second{countdown !== 1 ? 's' : ''}…
            </p>

            {/* Progress bar */}
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-emerald-400 rounded-full transition-all duration-1000"
                style={{ width: `${((4 - countdown) / 4) * 100}%` }}
              />
            </div>

            <button
              onClick={() => router.push(`/orders/${orderId}`)}
              className="w-full bg-black hover:bg-gray-900 text-white py-4 rounded-2xl font-bold transition shadow-md hover:scale-[1.01] mt-2"
            >
              Track My Order Now →
            </button>
          </div>
        ) : (
          <button
            onClick={() => router.push('/products')}
            className="w-full bg-black hover:bg-gray-900 text-white py-4 rounded-2xl font-bold transition shadow-md"
          >
            Continue Shopping
          </button>
        )}

      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
