// app/products/page.tsx
'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import { Loader2 } from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
  category: string;
  stock: number;
  featured: boolean;
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string>('all');
  const [search, setSearch] = useState('');

  const categories = ['all', 'Men', 'Women', 'Kids', 'Sneakers', 'Accessories'];

  const fetchProducts = async (targetCategory: string, targetSearch: string) => {
    setLoading(true);
    
    try {
      let url = '/api/products?limit=50';
      if (targetCategory !== 'all') url += `&category=${targetCategory}`;
      if (targetSearch) url += `&search=${encodeURIComponent(targetSearch)}`;

      const res = await fetch(url);
      const data = await res.json();
      
      if (data.success) {
        setProducts(data.data);
        console.log(`Loaded ${data.data.length} products for category: ${targetCategory}`);
      } else {
        console.error('Failed to fetch products:', data.message);
        setProducts([]);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const catParam = searchParams.get('category');
    let resolvedCategory = 'all';
    if (catParam) {
      const matchedCat = categories.find(c => c.toLowerCase() === catParam.toLowerCase());
      resolvedCategory = matchedCat || catParam;
    }
    setCategory(resolvedCategory);
    fetchProducts(resolvedCategory, search);
  }, [searchParams, search]);

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    const params = new URLSearchParams(searchParams);
    if (newCategory === 'all') {
      params.delete('category');
    } else {
      params.set('category', newCategory);
    }
    
    const newUrl = params.toString() ? `/products?${params.toString()}` : '/products';
    router.push(newUrl);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">
            {category === 'all' ? 'All Products' : `${category} Collection`}
          </h1>
          <p className="text-gray-600 mt-2 sm:mt-3 text-base sm:text-lg">
            {category === 'all' 
              ? 'Discover our latest collection' 
              : `Explore our ${category.toLowerCase()} products`
            }
          </p>
        </div>

        <div className="w-full md:w-auto">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 sm:px-5 py-3 border rounded-2xl w-full md:w-72 lg:w-80 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
          />
        </div>
      </div>

      {/* Category Filters — scrollable on mobile */}
      <div className="flex gap-2 sm:gap-3 mb-8 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-2xl font-medium transition-all whitespace-nowrap text-sm sm:text-base flex-shrink-0 ${
              category === cat 
                ? 'bg-black text-white' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            {cat === 'all' ? 'All Products' : cat}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-gray-400" />
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-5">
            <p className="text-gray-600 text-sm sm:text-base">
              Showing {products.length} {products.length === 1 ? 'product' : 'products'}
              {category !== 'all' && ` in ${category}`}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </>
      )}

      {products.length === 0 && !loading && (
        <div className="text-center py-16 sm:py-20">
          <p className="text-xl sm:text-2xl text-gray-400">No products found</p>
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}