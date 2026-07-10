'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, Loader2, Star, ShieldAlert } from 'lucide-react';
import { useToastStore } from '@/store/useToastStore';

interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  featured: boolean;
  images: string[];
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const showToast = useToastStore((state) => state.showToast);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/products');
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
      } else {
        showToast(data.message || 'Failed to load products', 'error');
      }
    } catch (error) {
      showToast('Error connecting to server', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDeleteProduct = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (data.success) {
        showToast('Product deleted successfully!', 'success');
        setProducts(prev => prev.filter(p => p._id !== id));
      } else {
        showToast(data.message || 'Failed to delete product', 'error');
      }
    } catch (error) {
      showToast('An error occurred during deletion', 'error');
    } finally {
      setDeletingId(null);
      setDeleteConfirmId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
        <p className="text-gray-500 font-medium">Fetching administrative inventory...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Products</h1>
          <p className="text-gray-500 mt-1">{products.length} products registered</p>
        </div>

        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-2xl hover:bg-purple-700 transition font-bold shadow-md hover:scale-[1.01] active:scale-[0.99]"
        >
          <Plus className="w-5 h-5" />
          Add New Product
        </Link>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50/50">
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Image</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Product Name</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Price</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Featured</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50/30 transition relative">
                  <td className="px-6 py-4">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded-xl border border-gray-150 shadow-sm"
                    />
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-850">{product.name}</td>
                  <td className="px-6 py-4">
                    <span className="inline-block px-3 py-1 bg-purple-50 border border-purple-100 text-purple-700 text-xs font-bold rounded-full">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-extrabold text-gray-900">Rs. {product.price.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`font-bold text-sm ${product.stock > 10 ? 'text-emerald-600' : 'text-rose-500'}`}>
                      {product.stock} units
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {product.featured ? (
                      <span className="text-amber-500 flex items-center gap-1 text-sm font-bold">
                        <Star className="w-4 h-4 fill-amber-500" /> Yes
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm font-medium">No</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {deleteConfirmId === product._id ? (
                      /* Inline Beautiful Custom Confirmation */
                      <div className="flex items-center justify-center gap-2 animate-fadeInUp">
                        <span className="text-xs text-rose-600 font-bold mr-1">Delete?</span>
                        <button
                          onClick={() => handleDeleteProduct(product._id)}
                          disabled={deletingId === product._id}
                          className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 transition"
                        >
                          {deletingId === product._id ? 'Deleting...' : 'Yes'}
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold transition"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-center gap-3">
                        <Link
                          href={`/admin/products/${product._id}/edit`}
                          className="p-2 hover:bg-gray-100 rounded-xl transition text-blue-600 hover:text-blue-800"
                          title="Edit Product"
                        >
                          <Edit className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => setDeleteConfirmId(product._id)}
                          className="p-2 hover:bg-rose-50 rounded-xl transition text-rose-550 hover:text-rose-700"
                          title="Delete Product"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {products.length === 0 && (
            <div className="text-center py-20 text-gray-500 font-medium bg-slate-50/50">
              No products found. Add your first product to display!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}