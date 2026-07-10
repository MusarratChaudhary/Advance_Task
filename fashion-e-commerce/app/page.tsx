import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import { Truck, ShieldCheck, ArrowRightLeft, Sparkles, ArrowRight } from 'lucide-react';
import Image from 'next/image';

export default async function HomePage() {
  await connectDB();

  const featuredProducts = await Product.find({ featured: true }).limit(8).lean();
  const newArrivals = await Product.find({}).sort({ createdAt: -1 }).limit(4).lean();

  // Convert to plain objects and string IDs
  const plainFeaturedProducts = featuredProducts.map((prod: any) => ({
    ...prod,
    _id: prod._id.toString(),
    createdAt: prod.createdAt?.toString(),
    updatedAt: prod.updatedAt?.toString(),
  }));

  const plainNewArrivals = newArrivals.map((prod: any) => ({
    ...prod,
    _id: prod._id.toString(),
    createdAt: prod.createdAt?.toString(),
    updatedAt: prod.updatedAt?.toString(),
  }));

  const spotlights = [
    {
      name: "Men's Collection",
      tag: "Tailored Classics",
      image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80",
      href: "/products?category=Men"
    },
    {
      name: "Women's Collection",
      tag: "Summer Flow",
      image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=600&q=80",
      href: "/products?category=Women"
    },
    {
      name: "Sneakers Spotlight",
      tag: "Urban Streetwear",
      image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&q=80",
      href: "/products?category=Sneakers"
    },
    {
      name: "Premium Accessories",
      tag: "Timeless Essentials",
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80",
      href: "/products?category=Accessories"
    }
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative h-[92vh] flex items-center justify-center bg-black overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1445205170230-053b83016050')] bg-cover bg-center opacity-75"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/60 to-black"></div>
        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-6 py-2.5 rounded-full text-xs font-bold tracking-[3px] text-white mb-8 border border-white/10">
            NEW SPRING COLLECTION 2026
          </div>
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-white mb-6 leading-none">
            THREADLY
          </h1>
          <p className="text-lg md:text-2xl text-gray-200 max-w-2xl mx-auto mb-12 font-medium">
            Premium high-street fashion curated for your style. Uncompromising quality you deserve.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <Link
              href="/products"
              className="btn-hero-primary px-10 py-4 rounded-2xl text-lg font-bold"
            >
              Shop New Collection
            </Link>
            <Link
              href="/products?featured=true"
              className="btn-hero-secondary px-10 py-4 rounded-2xl text-lg font-bold"
            >
              Browse Featured
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-10 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {/* Badge 1 */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Truck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h4 className="font-bold text-gray-800 text-xs sm:text-sm md:text-base leading-tight">Free Shipping</h4>
              <p className="text-xs text-gray-400 hidden sm:block">On all orders above Rs. 5,000</p>
            </div>
          </div>
          {/* Badge 2 */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h4 className="font-bold text-gray-800 text-xs sm:text-sm md:text-base leading-tight">Secure Payments</h4>
              <p className="text-xs text-gray-400 hidden sm:block">100% Protected payments</p>
            </div>
          </div>
          {/* Badge 3 */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0">
              <ArrowRightLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h4 className="font-bold text-gray-800 text-xs sm:text-sm md:text-base leading-tight">Easy Returns</h4>
              <p className="text-xs text-gray-400 hidden sm:block">30-day hassle-free policy</p>
            </div>
          </div>
          {/* Badge 4 */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h4 className="font-bold text-gray-800 text-xs sm:text-sm md:text-base leading-tight">Premium Quality</h4>
              <p className="text-xs text-gray-400 hidden sm:block">Crafted from organic cotton</p>
            </div>
          </div>
        </div>
      </section>

      {/* Category Spotlights */}
      <section className="py-14 sm:py-20 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-14 md:mb-16">
            <div className="uppercase text-xs font-extrabold tracking-[4px] text-purple-600 mb-2">SHOP BY CATEGORY</div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900">Curated Categories</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {spotlights.map((spot, index) => (
              <Link key={index} href={spot.href} className="group relative aspect-[3/4.2] rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition duration-500">
                <Image
                  src={spot.image}
                  alt={spot.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 text-white">
                  <span className="text-xs text-purple-300 font-bold uppercase tracking-wider hidden sm:block">{spot.tag}</span>
                  <h3 className="text-base sm:text-xl md:text-2xl font-extrabold mt-1 flex items-center gap-1 sm:gap-2 leading-tight">
                    {spot.name}
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 group-hover:translate-x-1.5 transition-transform" />
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Collection */}
      <section className="py-14 sm:py-20 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-10 sm:mb-14 md:mb-16">
            <div>
              <div className="uppercase text-xs font-extrabold tracking-[4px] text-purple-600 mb-2">CURATED FOR YOU</div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900">Featured Collection</h2>
            </div>
            <Link href="/products?featured=true" className="btn-premium inline-flex items-center gap-1.5 bg-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white px-4 py-2.5 rounded-xl text-sm font-bold border border-purple-100 hover:border-purple-600 shadow-sm hover:shadow-purple-500/25 self-start sm:self-auto">
              View Full Collection <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 md:gap-8">
            {plainFeaturedProducts.map((product: any) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-14 sm:py-20 md:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-14 md:mb-16">
            <div className="uppercase text-xs font-extrabold tracking-[4px] text-purple-600 mb-2">FRESH DROPS</div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900">New Arrivals</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 md:gap-8">
            {plainNewArrivals.map((product: any) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}