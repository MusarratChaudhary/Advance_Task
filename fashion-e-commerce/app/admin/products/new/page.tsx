// app/admin/products/new/page.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, X } from 'lucide-react';
import { useToastStore } from '@/store/useToastStore';

export default function NewProductPage() {
  const router = useRouter();
  const showToast = useToastStore((state) => state.showToast);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Men',
    stock: '',
    featured: false,
    sizes: [] as string[],
    colors: [] as string[],
  });

  const categories = ['Men', 'Women', 'Kids', 'Sneakers', 'Accessories'];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages(prev => [...prev, ...files]);

    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...previews]);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) {
      showToast("Please upload at least one image", "error");
      return;
    }

    setLoading(true);

    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('price', formData.price);
    data.append('category', formData.category);
    data.append('stock', formData.stock);
    data.append('featured', formData.featured.toString());
    data.append('sizes', JSON.stringify(formData.sizes));
    data.append('colors', JSON.stringify(formData.colors));

    images.forEach(image => {
      data.append('images', image);
    });

    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        body: data,
      });

      const result = await res.json();

      if (result.success) {
        showToast('Product added successfully!', 'success');
        router.push('/admin/products');
      } else {
        showToast(result.message || 'Failed to add product', 'error');
      }
    } catch (error) {
      showToast('Something went wrong', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Add New Product</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm p-8 space-y-8">
        {/* Images Upload */}
        <div>
          <label className="block text-sm font-medium mb-3">Product Images</label>
          <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              id="image-upload"
            />
            <label htmlFor="image-upload" className="cursor-pointer">
              <Upload className="mx-auto w-12 h-12 text-gray-400" />
              <p className="mt-4 text-gray-600">Click to upload images (Max 8)</p>
            </label>
          </div>

          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview}
                    alt="preview"
                    className="w-full h-32 object-cover rounded-2xl"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Product Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={5}
              className="w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-black resize-y"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Price (Rs.)</label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
              className="w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-black"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Stock</label>
            <input
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              required
              className="w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
              className="w-5 h-5"
            />
            <label className="font-medium">Mark as Featured</label>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || images.length === 0}
          className="w-full bg-black text-white py-4 rounded-2xl font-semibold text-lg hover:bg-gray-900 disabled:opacity-50 transition"
        >
          {loading ? 'Adding Product...' : 'Add Product'}
        </button>
      </form>
    </div>
  );
}