'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useToastStore } from '@/store/useToastStore';
import { ShoppingCart, Heart } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    slug: string;
    price: number;
    images: string[];
    category: string;
    stock: number;
    featured?: boolean;
    description?: string;
    sizes?: string[];
    colors?: string[];
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const { toggleItem, isFavorite } = useWishlistStore();
  const showToast = useToastStore((state) => state.showToast);
  const [isAdding, setIsAdding] = useState(false);

  const [favorited, setFavorited] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const favStatus = isFavorite(product._id);
    setFavorited(favStatus);
  }, [product._id, isFavorite]);

  if (!mounted) return null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsAdding(true);

    const cartProduct = {
      ...product,
      description: product.description || '',
      sizes: product.sizes || [],
      colors: product.colors || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    addItem(cartProduct as any);
    showToast(`${product.name} added to cart!`, 'success');

    setTimeout(() => {
      setIsAdding(false);
    }, 600);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();

    const p = {
      ...product,
      description: product.description || '',
      sizes: product.sizes || [],
      colors: product.colors || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    toggleItem(p as any);

    if (favorited) {
      showToast(`${product.name} removed from favorites`, 'info');
    } else {
      showToast(`${product.name} added to favorites!`, 'success');
    }

    setFavorited(!favorited);
  };

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      {/* Card wrapper — premium lift + shine effect */}
      <div className="card-premium bg-white rounded-3xl overflow-hidden border border-gray-100/80 shadow-md">
        {/* Image Container */}
        <div className="relative aspect-[4/3.5] bg-gray-50 overflow-hidden">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
          />

          {/* Subtle gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />

          {/* Badges */}
          {product.featured && (
            <div className="absolute top-4 left-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white text-xs px-3 py-1.5 rounded-full font-semibold tracking-wider shadow-lg shadow-purple-500/30">
              Featured
            </div>
          )}

          {product.stock <= 5 && product.stock > 0 && (
            <div
              className={`absolute top-4 ${
                product.featured ? 'left-24' : 'left-4'
              } bg-gradient-to-r from-rose-500 to-orange-400 text-white text-xs px-3 py-1.5 rounded-full font-semibold shadow-md animate-pulse`}
            >
              Only {product.stock} left
            </div>
          )}

          {/* Wishlist Button — premium glass morphism */}
          <button
            onClick={handleToggleWishlist}
            className={`absolute top-4 right-4 p-2.5 rounded-full shadow-lg backdrop-blur-sm border transition-all duration-300
              hover:scale-115 active:scale-95 z-10
              ${favorited
                ? 'bg-rose-500 border-rose-400 shadow-rose-400/40'
                : 'bg-white/90 border-white/60 hover:bg-white shadow-black/10'
              }`}
            title={favorited ? 'Remove from Favorites' : 'Add to Favorites'}
          >
            <Heart
              className={`w-4 h-4 transition-all duration-300 ${
                favorited ? 'fill-white text-white' : 'text-gray-600 group-hover:text-rose-500'
              }`}
            />
          </button>

          {/* Quick Add Button — directly below the wishlist button */}
          <button
            onClick={handleAddToCart}
            disabled={isAdding || product.stock === 0}
            className={`absolute top-16 right-4 p-2.5 rounded-full shadow-lg backdrop-blur-sm border transition-all duration-300
              hover:scale-115 active:scale-95 z-10
              ${isAdding
                ? 'bg-purple-600 border-purple-500 shadow-purple-500/40 text-white'
                : 'bg-white/90 border-white/60 hover:bg-white text-gray-650 hover:text-purple-600 shadow-black/10'
              }
              disabled:opacity-40 disabled:cursor-not-allowed`}
            title="Add to Cart"
          >
            <ShoppingCart className={`w-4 h-4 transition-transform duration-300 ${isAdding ? 'scale-90' : ''}`} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="text-xs uppercase tracking-widest text-purple-400 font-bold mb-1">
            {product.category}
          </div>

          <h3 className="font-bold text-gray-800 text-lg line-clamp-1 group-hover:text-purple-600 transition-colors duration-300">
            {product.name}
          </h3>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Rs. {product.price.toLocaleString()}
            </div>

            {product.stock > 0 ? (
              <span className="text-xs font-semibold bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full border border-emerald-100 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                In Stock
              </span>
            ) : (
              <span className="text-xs font-semibold bg-rose-50 text-rose-600 px-3 py-1 rounded-full border border-rose-100 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 inline-block" />
                Out of Stock
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
