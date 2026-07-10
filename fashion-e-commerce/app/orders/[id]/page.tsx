'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  CheckCircle2, Clock, Package, Truck, MapPin,
  ArrowLeft, ShoppingBag, RefreshCw, DollarSign,
} from 'lucide-react';

interface OrderItem {
  product: {
    _id: string;
    name: string;
    images: string[];
  } | null;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  priceAtPurchase: number;
}

interface Order {
  _id: string;
  totalAmount: number;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    phone?: string;
  };
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

const STEPS = [
  { key: 'pending',    label: 'Order Placed',  icon: ShoppingBag,   step: 1 },
  { key: 'paid',       label: 'Payment Done',  icon: DollarSign,    step: 2 },
  { key: 'processing', label: 'Processing',    icon: Package,       step: 3 },
  { key: 'shipped',    label: 'Shipped',       icon: Truck,         step: 4 },
  { key: 'delivered',  label: 'Delivered',     icon: CheckCircle2,  step: 5 },
];

function getStep(status: Order['status']): number {
  switch (status) {
    case 'pending':    return 1;
    case 'paid':       return 2;
    case 'processing': return 3;
    case 'shipped':    return 4;
    case 'delivered':  return 5;
    default:           return 0; // cancelled
  }
}

function StatusBadge({ status }: { status: Order['status'] }) {
  const styles: Record<Order['status'], string> = {
    pending:    'bg-amber-50 text-amber-700 border-amber-200',
    paid:       'bg-blue-50 text-blue-700 border-blue-200',
    processing: 'bg-purple-50 text-purple-700 border-purple-200',
    shipped:    'bg-indigo-50 text-indigo-700 border-indigo-200',
    delivered:  'bg-emerald-50 text-emerald-700 border-emerald-200',
    cancelled:  'bg-red-50 text-red-700 border-red-200',
  };
  return (
    <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border ${styles[status]}`}>
      {status}
    </span>
  );
}

export default function OrderTrackingPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchOrder = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      const res = await fetch(`/api/orders/${id}`);
      const data = await res.json();

      if (data.success) {
        setOrder(data.data);
        setError('');
      } else {
        setError(data.message || 'Order not found.');
      }
    } catch {
      setError('Failed to load order. Please check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-500 font-semibold">Loading your order…</p>
        </div>
      </div>
    );
  }

  // ── Error / Not found ────────────────────────────────────────────────────────
  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4 px-4">
        <Package className="w-16 h-16 text-gray-300" />
        <h2 className="text-2xl font-bold text-gray-700">{error || 'Order not found'}</h2>
        <p className="text-gray-500 text-sm">Make sure you are logged in to the correct account.</p>
        <Link href="/profile" className="bg-black text-white px-6 py-3 rounded-2xl font-bold hover:bg-gray-900 transition">
          Go to Profile
        </Link>
      </div>
    );
  }

  const step = getStep(order.status);
  const isCancelled = order.status === 'cancelled';
  const progressPct = isCancelled ? 0 : Math.max(0, (step - 1) * 25);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">

      {/* Back link */}
      <Link
        href="/profile"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-purple-600 font-medium transition mb-8"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Profile
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">Order Tracking</h1>
          <p className="text-gray-500 mt-1 text-sm font-mono break-all">#{order._id}</p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={order.status} />
          <button
            onClick={() => fetchOrder(true)}
            disabled={refreshing}
            title="Refresh status"
            className="p-2 rounded-xl border border-gray-200 hover:border-purple-400 text-gray-500 hover:text-purple-600 transition disabled:opacity-40"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── Tracking Stepper ───────────────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-10 mb-6">
        <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wider mb-8">Delivery Status</h2>

        {isCancelled ? (
          <div className="bg-red-50 border border-red-100 text-red-700 rounded-2xl p-5 flex items-center gap-3">
            <Clock className="w-5 h-5 flex-shrink-0" />
            <span className="font-semibold text-sm">This order has been cancelled and is no longer trackable.</span>
          </div>
        ) : (
          <>
            {/* Progress bar + steps */}
            <div className="relative flex justify-between items-start">
              {/* Connector bar */}
              <div className="absolute top-5 left-5 right-5 h-1.5 bg-gray-100 rounded-full z-0">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-emerald-400 rounded-full transition-all duration-700"
                  style={{ width: `${progressPct}%` }}
                />
              </div>

              {STEPS.map(({ key, label, icon: Icon, step: s }) => {
                const done = step >= s;
                const active = step === s;
                return (
                  <div key={key} className="flex flex-col items-center z-10 flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm
                        ${done
                          ? s === 5
                            ? 'bg-emerald-500 text-white scale-110 shadow-emerald-200'
                            : 'bg-purple-600 text-white'
                          : 'bg-white border-2 border-gray-200 text-gray-400'
                        }
                        ${active && !done ? 'ring-4 ring-purple-100' : ''}
                      `}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span
                      className={`mt-2.5 text-[10px] md:text-xs font-bold text-center leading-tight px-1
                        ${done ? (s === 5 ? 'text-emerald-600' : 'text-gray-800') : 'text-gray-400'}
                      `}
                    >
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Status message */}
            <div className="mt-8 bg-purple-50 border border-purple-100 rounded-2xl p-4 text-sm text-purple-800 font-medium">
              {order.status === 'pending'    && '⏳ Your order has been received and is awaiting payment confirmation.'}
              {order.status === 'paid'       && '✅ Payment confirmed! Your order will start processing shortly.'}
              {order.status === 'processing' && '📦 Your items are being packed and prepared for dispatch.'}
              {order.status === 'shipped'    && '🚚 Your order is on the way! Estimated delivery within 3–5 business days.'}
              {order.status === 'delivered'  && '🎉 Your order has been delivered. Enjoy your purchase!'}
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

        {/* ── Order Summary ──────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wider mb-5">Order Summary</h2>
          <div className="space-y-4">
            {order.items.map((item, idx) => {
              const p = item.product;
              return (
                <div key={idx} className="flex gap-3 items-center">
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden border bg-gray-50 flex-shrink-0">
                    <Image
                      src={p?.images?.[0] ?? 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=200'}
                      alt={p?.name ?? 'Product'}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">{p?.name ?? 'Unknown Product'}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Qty: {item.quantity}
                      {item.selectedSize  && ` • Size: ${item.selectedSize}`}
                      {item.selectedColor && ` • Color: ${item.selectedColor}`}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-gray-800 flex-shrink-0">
                    Rs. {(item.priceAtPurchase * item.quantity).toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="border-t mt-5 pt-4 flex justify-between items-center">
            <span className="font-bold text-gray-700">Total Paid</span>
            <span className="text-xl font-black text-gray-900">Rs. {order.totalAmount.toLocaleString()}</span>
          </div>
        </div>

        {/* ── Shipping Info ──────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wider mb-5">
            <span className="inline-flex items-center gap-2">
              <MapPin className="w-4 h-4 text-purple-600" /> Shipping Address
            </span>
          </h2>
          <div className="space-y-2 text-sm text-gray-600">
            <p className="font-bold text-gray-800 text-base">{order.shippingAddress.fullName}</p>
            <p>{order.shippingAddress.address}</p>
            <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
            <p>{order.shippingAddress.country}</p>
            {order.shippingAddress.phone && (
              <p className="font-medium text-gray-700 pt-1">📞 {order.shippingAddress.phone}</p>
            )}
          </div>

          <div className="border-t mt-6 pt-4 space-y-2 text-xs text-gray-400">
            <p>
              <span className="font-semibold text-gray-500">Order placed: </span>
              {new Date(order.createdAt).toLocaleString('en-US', {
                day: 'numeric', month: 'long', year: 'numeric',
                hour: '2-digit', minute: '2-digit',
              })}
            </p>
            <p>
              <span className="font-semibold text-gray-500">Last updated: </span>
              {new Date(order.updatedAt).toLocaleString('en-US', {
                day: 'numeric', month: 'long', year: 'numeric',
                hour: '2-digit', minute: '2-digit',
              })}
            </p>
          </div>
        </div>
      </div>

      {/* CTA buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/products"
          className="flex-1 text-center bg-black hover:bg-gray-900 text-white py-4 rounded-2xl font-bold transition shadow-md hover:scale-[1.01]"
        >
          Continue Shopping
        </Link>
        <Link
          href="/profile"
          className="flex-1 text-center border-2 border-gray-200 hover:border-black text-gray-700 hover:text-black py-4 rounded-2xl font-bold transition hover:scale-[1.01]"
        >
          All My Orders
        </Link>
      </div>

    </div>
  );
}
