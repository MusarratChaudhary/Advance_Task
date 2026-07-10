// components/Navbar.tsx
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { ShoppingCart, User, Menu, X, Heart } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { items } = useCartStore();

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setUser(data.user);
        else setUser(null);
      })
      .catch(() => setUser(null));
  }, []);

  const cartCount = items.length;
  const wishlistCount = useWishlistStore((state) => state.items.length);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-lg">
      {/* News Ticker Style Top Banner */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="relative flex items-center h-4">
            <div className="overflow-hidden w-full">
              <div className="whitespace-nowrap animate-marquee text-white font-semibold text-sm uppercase tracking-widest flex items-center gap-8">
                FREE SHIPPING ON ORDERS OVER $50 
                <span className="hidden md:inline">•</span> 
                24/7 CUSTOMER SUPPORT 
                <span className="hidden md:inline">•</span> 
                NEW COLLECTIONS ARRIVING SOON
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="bg-white border-b backdrop-blur-lg bg-opacity-80">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16 relative">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-tr from-purple-500 to-pink-400 rounded-xl shadow-lg flex items-center justify-center transition-transform hover:scale-105">
                <span className="text-white font-bold text-3xl">T</span>
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-gray-800">Threadly</span>
            </Link>

            {/* Desktop Navigation - Professional Look */}
            <div className="hidden md:flex items-center gap-8 font-medium text-gray-700 text-sm uppercase tracking-wider">
              <Link 
                href="/products" 
                className="relative py-1.5 hover:text-purple-600 transition-all duration-300 group"
              >
                Shop
                <span className="absolute bottom-0 left-0 h-0.5 bg-purple-600 w-0 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link 
                href="/products?category=Men" 
                className="relative py-1.5 hover:text-purple-600 transition-all duration-300 group"
              >
                Men
                <span className="absolute bottom-0 left-0 h-0.5 bg-purple-600 w-0 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link 
                href="/products?category=Women" 
                className="relative py-1.5 hover:text-purple-600 transition-all duration-300 group"
              >
                Women
                <span className="absolute bottom-0 left-0 h-0.5 bg-purple-600 w-0 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link 
                href="/products?category=Kids" 
                className="relative py-1.5 hover:text-purple-600 transition-all duration-300 group"
              >
                Kids
                <span className="absolute bottom-0 left-0 h-0.5 bg-purple-600 w-0 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link 
                href="/products?category=Sneakers" 
                className="relative py-1.5 hover:text-purple-600 transition-all duration-300 group"
              >
                Sneakers
                <span className="absolute bottom-0 left-0 h-0.5 bg-purple-600 w-0 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link 
                href="/products?category=Accessories" 
                className="relative py-1.5 hover:text-purple-600 transition-all duration-300 group"
              >
                Accessories
                <span className="absolute bottom-0 left-0 h-0.5 bg-purple-600 w-0 group-hover:w-full transition-all duration-300"></span>
              </Link>
            </div>

            {/* Icons & Buttons */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Wishlist Icon */}
              <Link href="/wishlist" className="relative p-2 sm:p-3 hover:bg-purple-100 rounded-2xl transition hover:scale-105" title="Wishlist">
                <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center rounded-full shadow-lg">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart Icon */}
              <Link href="/cart" className="relative p-2 sm:p-3 hover:bg-purple-100 rounded-2xl transition hover:scale-105" title="Shopping Cart">
                <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center rounded-full shadow-lg">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Auth Buttons */}
              {user ? (
                <Link href="/profile" className="p-2 sm:p-3 hover:bg-purple-100 rounded-2xl transition hover:scale-105" title="Profile">
                  <User className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
                </Link>
              ) : (
                <>
                  {/* On mobile show icon only, on md+ show full button */}
                  <Link
                    href="/auth/login"
                    className="hidden sm:block btn-premium px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-semibold shadow-md shadow-purple-500/20 hover:shadow-purple-500/40 text-sm"
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/login"
                    className="sm:hidden p-2 hover:bg-purple-100 rounded-2xl transition"
                    title="Login"
                  >
                    <User className="w-5 h-5 text-purple-600" />
                  </Link>
                  <Link
                    href="/auth/register"
                    className="hidden sm:block btn-premium px-4 py-2 border-2 border-purple-600 text-purple-600 rounded-xl font-semibold hover:bg-purple-600 hover:text-white hover:shadow-md hover:shadow-purple-500/25 text-sm"
                  >
                    Register
                  </Link>
                </>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden p-2 text-gray-700 hover:bg-purple-100 rounded-full transition ml-1"
              >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu - Updated with new links */}
        {isOpen && (
          <div className="md:hidden bg-white border-t shadow-lg transition-all duration-300 ease-in-out max-h-96 overflow-y-auto">
            <div className="px-4 py-6 space-y-4 font-semibold text-gray-700 text-lg">
              <Link href="/products" className="block py-3 hover:text-purple-600 transition" onClick={() => setIsOpen(false)}>
                Shop
              </Link>
              <Link href="/products?category=Men" className="block py-3 hover:text-purple-600 transition" onClick={() => setIsOpen(false)}>
                Men
              </Link>
              <Link href="/products?category=Women" className="block py-3 hover:text-purple-600 transition" onClick={() => setIsOpen(false)}>
                Women
              </Link>
              <Link href="/products?category=Kids" className="block py-3 hover:text-purple-600 transition" onClick={() => setIsOpen(false)}>
                Kids
              </Link>
              <Link href="/products?category=Sneakers" className="block py-3 hover:text-purple-600 transition" onClick={() => setIsOpen(false)}>
                Sneakers
              </Link>
              <Link href="/products?category=Accessories" className="block py-3 hover:text-purple-600 transition" onClick={() => setIsOpen(false)}>
                Accessories
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

