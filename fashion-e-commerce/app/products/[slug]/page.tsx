// app/products/[slug]/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useToastStore } from '@/store/useToastStore';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Heart, ShoppingCart, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  sizes: string[];
  colors: string[];
  stock: number;
}

export default function ProductDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const { toggleItem, isFavorite } = useWishlistStore();
  const showToast = useToastStore((state) => state.showToast);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [currentImage, setCurrentImage] = useState(0);

  const favorited = product ? isFavorite(product._id) : false;

  useEffect(() => {
    fetchProduct();
  }, [slug]);

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/products/${slug}`);
      const data = await res.json();

      if (data.success) {
        setProduct(data.data);
        // Set default size and color
        if (data.data.sizes?.length > 0) setSelectedSize(data.data.sizes[0]);
        if (data.data.colors?.length > 0) setSelectedColor(data.data.colors[0]);
      }
    } catch (error) {
      console.error('Failed to fetch product');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    addItem(product as any, selectedSize, selectedColor);
    showToast(`${product.name} added to cart!`, 'success');
  };

  const handleToggleWishlist = () => {
    if (!product) return;
    
    toggleItem(product as any);
    if (favorited) {
      showToast(`${product.name} removed from favorites`, 'info');
    } else {
      showToast(`${product.name} added to favorites!`, 'success');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse space-y-4 text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-semibold">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
        <Link href="/products" className="bg-black text-white px-6 py-3 rounded-2xl">
          Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <Link href="/products" className="inline-flex items-center gap-2 text-gray-600 hover:text-purple-600 transition mb-8 font-medium">
        <ArrowLeft className="w-5 h-5" /> Back to Shop
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Images */}
        <div>
          <div className="relative aspect-square bg-white rounded-3xl overflow-hidden mb-3 shadow-sm border border-gray-100">
            <Image
              src={product.images[currentImage]}
              alt={product.name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="grid grid-cols-5 gap-2 sm:gap-4">
              {product.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImage(index)}
                  className={`aspect-square rounded-xl sm:rounded-2xl overflow-hidden border-2 relative bg-white shadow-sm transition ${
                    currentImage === index ? 'border-purple-600 scale-105' : 'border-transparent hover:border-gray-200'
                  }`}
                >
                  <Image src={img} alt="" fill sizes="20vw" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div>
            <Link
              href={`/products?category=${encodeURIComponent(product.category)}`}
              className="text-xs sm:text-sm font-bold uppercase tracking-widest text-purple-650 hover:text-purple-800 transition duration-300 mb-2 block hover:underline w-fit"
            >
              {product.category}
            </Link>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight">{product.name}</h1>
            <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-3">Rs. {product.price.toLocaleString()}</p>
          </div>

          <div className="border-t border-b py-5">
            <h3 className="font-semibold text-gray-800 mb-3">Description</h3>
            <p className="text-gray-600 leading-relaxed text-sm sm:text-base">{product.description}</p>
          </div>

          {/* Sizes */}
          {product.sizes?.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Select Size</h3>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-3 sm:px-5 py-2 sm:py-2.5 border rounded-xl sm:rounded-2xl font-medium transition text-sm ${
                      selectedSize === size
                        ? 'bg-black text-white border-black shadow-md scale-[1.02]'
                        : 'border-gray-200 hover:border-black text-gray-700'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Colors */}
          {product.colors?.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Select Color</h3>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-3 sm:px-5 py-2 sm:py-2.5 border rounded-xl sm:rounded-2xl font-medium transition text-sm ${
                      selectedColor === color
                        ? 'bg-black text-white border-black shadow-md scale-[1.02]'
                        : 'border-gray-200 hover:border-black text-gray-700'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 flex gap-3">
            <button
              onClick={handleAddToCart}
              disabled={!selectedSize && product.sizes?.length > 0}
              className="flex-1 bg-black text-white py-3.5 sm:py-4 md:py-5 rounded-2xl text-base sm:text-lg font-bold hover:bg-gray-900 transition flex items-center justify-center gap-2 sm:gap-3 disabled:opacity-50 shadow-lg hover:scale-[1.01] active:scale-[0.99]"
            >
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
              Add to Cart
            </button>

            <button
              onClick={handleToggleWishlist}
              className={`p-3.5 sm:p-4 md:p-5 border-2 rounded-2xl transition-all hover:scale-105 active:scale-95 ${
                favorited
                  ? 'border-rose-100 bg-rose-50 text-rose-500'
                  : 'border-gray-200 hover:border-gray-400 text-gray-600'
              }`}
              title={favorited ? 'Remove from Favorites' : 'Add to Favorites'}
            >
              <Heart className={`w-5 h-5 sm:w-6 sm:h-6 ${favorited ? 'fill-rose-500 text-rose-500' : 'text-gray-600'}`} />
            </button>
          </div>

          <div className="text-xs sm:text-sm text-gray-500 flex flex-wrap items-center gap-3 pt-2">
            <span className="flex items-center gap-1">✓ Free Shipping</span>
            <span className="flex items-center gap-1">✓ Easy Returns</span>
            <span className="flex items-center gap-1">✓ Secure Checkout</span>
          </div>
        </div>
      </div>
    </div>
  );
}