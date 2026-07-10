// components/Footer.tsx
import Link from 'next/link';
import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center">
                <span className="text-gray-900 font-bold text-3xl">T</span>
              </div>
              <span className="text-white text-3xl font-bold tracking-tight">Threadly</span>
            </div>
            
            <p className="text-sm leading-relaxed max-w-xs">
              Premium fashion for the modern generation. Quality you can trust, style you&apos;ll love.
            </p>
            
            <div className="mt-6 flex items-center gap-2 text-sm">
              Made with <Heart className="w-4 h-4 text-red-500" /> in Pakistan
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-white font-semibold mb-5">Shop</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/products" className="hover:text-white transition">All Products</Link></li>
              <li><Link href="/products?category=Men" className="hover:text-white transition">Men&apos;s Wear</Link></li>
              <li><Link href="/products?category=Women" className="hover:text-white transition">Women&apos;s Wear</Link></li>
              <li><Link href="/products?category=Sneakers" className="hover:text-white transition">Sneakers</Link></li>
              <li><Link href="/products?featured=true" className="hover:text-white transition">New Arrivals</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-5">Support</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="#" className="hover:text-white transition">Contact Us</Link></li>
              <li><Link href="#" className="hover:text-white transition">Shipping Policy</Link></li>
              <li><Link href="#" className="hover:text-white transition">Returns & Exchanges</Link></li>
              <li><Link href="#" className="hover:text-white transition">Size Guide</Link></li>
              <li><Link href="#" className="hover:text-white transition">FAQs</Link></li>
            </ul>
          </div>

          {/* Legal & Newsletter */}
          <div>
            <h3 className="text-white font-semibold mb-5">Stay Updated</h3>
            <p className="text-sm mb-4">Get early access to new drops and exclusive offers.</p>
            
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="bg-gray-800/80 border border-gray-700 rounded-2xl px-4 py-3 text-sm flex-1 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 text-white placeholder-gray-500"
              />
              <button className="btn-premium bg-gradient-to-r from-purple-600 to-pink-500 text-white px-6 rounded-2xl font-semibold shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 text-sm">
                Join
              </button>
            </div>

            <div className="mt-10 text-xs space-y-1">
              <p>© 2026 Threadly. All rights reserved.</p>
              <p>Privacy Policy • Terms of Service</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-16 pt-8 text-center text-xs">
          Built for Internship Advanced Task • Full Stack E-commerce
        </div>
      </div>
    </footer>
  );
}