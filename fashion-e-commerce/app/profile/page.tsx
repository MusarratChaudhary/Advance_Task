'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToastStore } from '@/store/useToastStore';
import { Package, Truck, CheckCircle2, Clock, MapPin, ArrowRight, User as UserIcon, Calendar, DollarSign, LogOut } from 'lucide-react';
import Image from 'next/image';

interface OrderItem {
  product: {
    _id: string;
    name: string;
    images: string[];
    price: number;
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
    phone?: string;
  };
  items: OrderItem[];
  createdAt: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();
  const showToast = useToastStore((state) => state.showToast);

  useEffect(() => {
    const fetchProfileAndOrders = async () => {
      try {
        // Fetch User Info
        const userRes = await fetch('/api/auth/me');
        const userData = await userRes.json();

        if (!userData.success) {
          showToast('Please login to access your profile', 'info');
          router.push('/auth/login');
          return;
        }

        setUser(userData.user);

        // Fetch User Orders
        const ordersRes = await fetch('/api/orders');
        const ordersData = await ordersRes.json();

        if (ordersData.success) {
          setOrders(ordersData.data);
        }
      } catch (error) {
        console.error('Profile load error:', error);
        showToast('Error loading profile information', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndOrders();
  }, [router, showToast]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      const data = await res.json();
      
      if (data.success) {
        showToast('Logged out successfully!', 'success');
        // Clear cookie client-side too
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        setTimeout(() => {
          window.location.href = '/';
        }, 800);
      } else {
        showToast('Logout failed. Please try again.', 'error');
        setLoggingOut(false);
      }
    } catch (error) {
      showToast('Something went wrong.', 'error');
      setLoggingOut(false);
    }
  };

  const getStatusStep = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 1;
      case 'paid': return 2;
      case 'processing': return 3;
      case 'shipped': return 4;
      case 'delivered': return 5;
      case 'cancelled': return 0;
      default: return 1;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-500 font-semibold">Loading profile & order details...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
        
        {/* User Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8 lg:sticky lg:top-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 sm:w-28 sm:h-28 bg-gradient-to-tr from-purple-600 via-pink-500 to-red-500 rounded-full flex items-center justify-center text-white text-3xl sm:text-4xl font-black shadow-lg">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <h2 className="mt-4 sm:mt-6 font-bold text-xl sm:text-2xl text-gray-800">{user.name}</h2>
              <p className="text-sm text-gray-500 mt-1 break-all">{user.email}</p>
              
              <span className="mt-3 sm:mt-4 px-4 py-1.5 bg-purple-50 border border-purple-100 text-purple-700 text-xs font-bold uppercase tracking-wider rounded-full">
                {user.role} Account
              </span>
            </div>

            <div className="mt-6 sm:mt-8 border-t pt-6 sm:pt-8 space-y-4">
              <div className="flex items-center gap-3 text-gray-600">
                <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <span className="text-sm">
                  Member since {new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="mt-6 sm:mt-8 w-full bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold py-3 sm:py-4 rounded-2xl transition flex items-center justify-center gap-2 border border-rose-100 active:scale-95 disabled:opacity-50"
            >
              <LogOut className="w-5 h-5" />
              {loggingOut ? 'Logging out...' : 'Sign Out'}
            </button>
          </div>
        </div>

        {/* Orders List & Tracking */}
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">Order History</h1>
            <p className="text-gray-550 mt-2 text-sm sm:text-base">Track the delivery process and status of your orders</p>
          </div>

          {orders.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-gray-100 shadow-sm">
              <Package className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-bold text-gray-700 mb-1">No Orders Found</h3>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto text-sm sm:text-base">You haven&apos;t placed any orders yet. Start shopping and check back!</p>
              <button
                onClick={() => router.push('/products')}
                className="bg-black hover:bg-gray-800 text-white font-bold px-6 py-3 sm:py-3.5 rounded-2xl transition shadow-md text-sm sm:text-base"
              >
                Explore Products
              </button>
            </div>
          ) : (
            <div className="space-y-6 sm:space-y-8">
              {orders.map((order) => {
                const step = getStatusStep(order.status);
                return (
                  <div key={order._id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    {/* Order Header */}
                    <div className="bg-slate-50 px-4 sm:px-6 py-4 sm:py-5 border-b flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
                      <div className="min-w-0">
                        <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Order Reference</div>
                        <div className="font-mono text-xs sm:text-sm font-bold text-gray-800 break-all">#{order._id}</div>
                      </div>
                      
                      <div className="flex gap-4 sm:gap-6">
                        <div>
                          <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Placed On</div>
                          <div className="text-xs sm:text-sm font-semibold text-gray-700">
                            {new Date(order.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Paid</div>
                          <div className="text-xs sm:text-sm font-black text-gray-900">
                            Rs. {order.totalAmount.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
                      {/* Products List in Order */}
                      <div className="space-y-3 sm:space-y-4">
                        <h4 className="font-bold text-gray-800 text-xs sm:text-sm uppercase tracking-wider">Items Ordered</h4>
                        {order.items.map((item, idx) => {
                          const p = item.product;
                          return (
                            <div key={idx} className="flex gap-3 sm:gap-4 items-center">
                              <div className="relative w-12 h-12 sm:w-16 sm:h-16 bg-gray-55 rounded-xl overflow-hidden border flex-shrink-0">
                                <Image
                                  src={p ? p.images[0] : 'https://images.unsplash.com/photo-1445205170230-053b83016050'}
                                  alt={p ? p.name : 'Product'}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h5 className="font-semibold text-gray-850 text-xs sm:text-sm leading-tight line-clamp-2">
                                  {p ? p.name : 'Unknown Product'}
                                </h5>
                                <p className="text-xs text-gray-400 mt-0.5">
                                  {item.selectedSize && `Size: ${item.selectedSize}`}
                                  {item.selectedColor && ` • Color: ${item.selectedColor}`}
                                  {` • Qty: ${item.quantity}`}
                                </p>
                              </div>
                              <div className="text-xs sm:text-sm font-bold text-gray-800 flex-shrink-0">
                                Rs. {(item.priceAtPurchase * item.quantity).toLocaleString()}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Delivery Process Stepper */}
                      <div className="border-t pt-6 sm:pt-8">
                        <div className="flex flex-col xs:flex-row xs:justify-between xs:items-center gap-2 xs:gap-4 mb-4 sm:mb-6">
                          <h4 className="font-bold text-gray-800 text-xs sm:text-sm uppercase tracking-wider">Delivery Tracking Process</h4>
                          <span className={`self-start xs:self-auto px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            order.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                            order.status === 'cancelled' ? 'bg-red-50 text-red-700 border border-red-100' :
                            order.status === 'shipped' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                            'bg-amber-50 text-amber-700 border border-amber-100'
                          }`}>
                            {order.status}
                          </span>
                        </div>

                        {order.status === 'cancelled' ? (
                          <div className="bg-red-50 text-red-700 p-4 rounded-2xl border border-red-100 flex items-center gap-3">
                            <Clock className="w-5 h-5 flex-shrink-0" />
                            <span className="text-xs sm:text-sm font-semibold">This order has been cancelled and cannot be tracked.</span>
                          </div>
                        ) : (
                          <div className="relative flex justify-between items-center py-2 sm:py-4">
                            {/* Connector Line */}
                            <div className="absolute top-[22px] sm:top-[28px] left-[10px] right-[10px] h-1 bg-gray-100 -z-0">
                              <div 
                                className="h-full bg-gradient-to-r from-purple-500 to-emerald-500 transition-all duration-500" 
                                style={{ width: `${Math.max(0, (step - 1) * 25)}%` }}
                              ></div>
                            </div>

                            {[
                              { s: 1, label: 'Placed' },
                              { s: 2, label: 'Paid' },
                              { s: 3, label: 'Processing' },
                              { s: 4, label: 'Shipped' },
                              { s: 5, label: 'Delivered' },
                            ].map(({ s, label }) => (
                              <div key={s} className="flex flex-col items-center z-10 text-center">
                                <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all ${
                                  step >= s
                                    ? s === 5 ? 'bg-emerald-500 text-white shadow-md' : 'bg-purple-600 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-400 border border-gray-200'
                                }`}>
                                  {step >= s ? <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4" /> : <Clock className="w-3 h-3 sm:w-4 sm:h-4" />}
                                </div>
                                <span className={`text-[9px] sm:text-[10px] md:text-xs font-bold mt-1 sm:mt-2 leading-tight ${
                                  step >= s ? (s === 5 ? 'text-emerald-600' : 'text-gray-800') : 'text-gray-400'
                                }`}>{label}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Shipping Info details */}
                      <div className="border-t pt-4 sm:pt-6 flex flex-col sm:flex-row gap-4 sm:gap-6 justify-between text-sm bg-slate-50/50 p-3 sm:p-4 rounded-2xl border">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 font-bold text-gray-700 text-xs sm:text-sm">
                            <MapPin className="w-4 h-4 text-purple-600" />
                            Shipping Details
                          </div>
                          <p className="font-semibold text-gray-850 mt-1 text-sm">{order.shippingAddress.fullName}</p>
                          <p className="text-xs text-gray-500 leading-tight">
                            {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                          </p>
                        </div>
                        {order.shippingAddress.phone && (
                          <div className="space-y-1">
                            <div className="font-bold text-gray-700 text-xs sm:text-sm">Phone Number</div>
                            <p className="text-gray-600 font-semibold text-sm">{order.shippingAddress.phone}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}