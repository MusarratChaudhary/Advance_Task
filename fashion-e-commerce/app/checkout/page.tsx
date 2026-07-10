'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { useToastStore } from '@/store/useToastStore';
import { loadStripe } from '@stripe/stripe-js';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { CreditCard, Truck, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CheckoutPage() {
  const { items, getTotalPrice } = useCartStore();
  const showToast = useToastStore((state) => state.showToast);
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cod'>('cod'); // Default to COD for easy testing
  const [formData, setFormData] = useState({
    fullName: '',
    address: '',
    city: '',
    postalCode: '',
    phone: '',
    country: 'Pakistan',
  });

  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart');
    }
  }, [items, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(item => ({
            product: item.product._id,
            quantity: item.quantity,
            selectedSize: item.selectedSize,
            selectedColor: item.selectedColor,
            price: item.product.price,
            name: item.product.name,
            image: item.product.images[0],
          })),
          shippingAddress: formData,
          paymentMethod,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        showToast(result.message || 'Checkout failed. Please try again.', 'error');
        setLoading(false);
        return;
      }

      showToast('Order placed successfully!', 'success');

      if (paymentMethod === 'cod') {
        router.push(`/success?order_id=${result.orderId}`);
      } else {
        const stripe = await stripePromise;
        if (stripe && result.sessionId) {
          await (stripe as any).redirectToCheckout({ sessionId: result.sessionId });
        } else {
          showToast('Failed to initialize credit card payment.', 'error');
        }
      }
    } catch (error) {
      console.error(error);
      showToast('Checkout session failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const total = getTotalPrice();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <Link href="/cart" className="inline-flex items-center gap-2 text-gray-600 hover:text-purple-650 mb-6 sm:mb-8 font-medium text-sm sm:text-base">
        <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" /> Back to Cart
      </Link>

      <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-8 sm:mb-10 tracking-tight">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Shipping Form */}
        <div className="lg:col-span-7 bg-white p-5 sm:p-6 md:p-8 rounded-3xl border shadow-sm h-fit">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-5 sm:mb-6 flex items-center gap-2">
            <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
            Shipping Information
          </h2>
          
          <form onSubmit={handleCheckout} className="space-y-5 sm:space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-600 transition bg-slate-50/50 text-sm sm:text-base"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-600 transition bg-slate-50/50 text-sm sm:text-base"
                placeholder="Apartment, suite, unit, street address"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-600 transition bg-slate-50/50 text-sm sm:text-base"
                  placeholder="e.g. Karachi, Lahore"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Postal Code</label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-600 transition bg-slate-50/50 text-sm sm:text-base"
                  placeholder="Postal/Zip Code"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-600 transition bg-slate-50/50 text-sm sm:text-base"
                placeholder="e.g. 03001234567"
              />
            </div>

            {/* Payment Method Selector */}
            <div className="border-t pt-5 sm:pt-6 mt-6 sm:mt-8">
              <h3 className="font-bold text-gray-800 text-base sm:text-lg mb-4 flex items-center gap-2">
                <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                Select Payment Method
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <label className={`flex flex-col p-4 border-2 rounded-2xl cursor-pointer transition ${
                  paymentMethod === 'cod' 
                    ? 'border-purple-600 bg-purple-50/30' 
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}>
                  <div className="flex items-center justify-between w-full">
                    <span className="font-bold text-gray-850 text-sm sm:text-base">Cash on Delivery</span>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="w-4 h-4 accent-purple-650"
                    />
                  </div>
                  <span className="text-xs text-gray-400 mt-1">Order now, pay on delivery</span>
                </label>

                <label className={`flex flex-col p-4 border-2 rounded-2xl cursor-pointer transition ${
                  paymentMethod === 'card' 
                    ? 'border-purple-600 bg-purple-50/30' 
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}>
                  <div className="flex items-center justify-between w-full">
                    <span className="font-bold text-gray-850 text-sm sm:text-base">Pay via Credit Card</span>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      className="w-4 h-4 accent-purple-650"
                    />
                  </div>
                  <span className="text-xs text-gray-400 mt-1">Secure payment via Stripe</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black hover:bg-gray-900 text-white py-4 rounded-2xl text-base sm:text-xl font-bold transition mt-6 sm:mt-8 shadow-md hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing Order...' : `Complete Order • Rs. ${total.toLocaleString()}`}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-5 bg-slate-50/70 border border-slate-100 rounded-3xl p-5 sm:p-6 md:p-8 h-fit lg:sticky lg:top-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-5 sm:mb-6">Order Summary</h2>
          
          <div className="space-y-4 sm:space-y-6 max-h-72 sm:max-h-96 overflow-y-auto pr-1">
            {items.map((item, index) => (
              <div key={index} className="flex gap-3 sm:gap-4 items-center">
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl overflow-hidden border flex-shrink-0">
                  <Image
                    src={item.product.images[0]}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-850 leading-snug text-sm sm:text-base line-clamp-2">{item.product.name}</p>
                  <p className="text-xs text-gray-450 mt-1">
                    Qty: {item.quantity} 
                    {item.selectedSize && ` • Size: ${item.selectedSize}`} 
                    {item.selectedColor && ` • Color: ${item.selectedColor}`}
                  </p>
                </div>
                <p className="font-bold text-gray-800 text-sm sm:text-base flex-shrink-0">
                  Rs. {(item.product.price * item.quantity).toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t border-dashed border-gray-300 mt-6 sm:mt-8 pt-5 sm:pt-6 space-y-2 sm:space-y-3">
            <div className="flex justify-between text-gray-500 text-sm sm:text-base">
              <span>Subtotal</span>
              <span className="font-semibold text-gray-850">Rs. {total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-500 text-sm sm:text-base">
              <span>Shipping Charge</span>
              <span className="text-emerald-600 font-bold">Free</span>
            </div>
            <div className="border-t pt-3 sm:pt-4 flex justify-between text-lg sm:text-2xl font-black text-gray-900">
              <span>Total Amount</span>
              <span>Rs. {total.toLocaleString()}</span>
            </div>
          </div>

          <div className="text-xs text-gray-400 text-center mt-6 sm:mt-8">
            Secure Payments Powered by Threadly Checkout Gateway
          </div>
        </div>
      </div>
    </div>
  );
}