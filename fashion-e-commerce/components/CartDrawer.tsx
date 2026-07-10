// components/CartDrawer.tsx
'use client';
import { useCartStore } from '@/store/useCartStore';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCartStore();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-6 h-6" />
            <h2 className="text-2xl font-semibold">Your Cart</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-auto p-6 space-y-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-20">
              <ShoppingBag className="w-16 h-16 text-gray-300 mb-6" />
              <p className="text-xl font-medium text-gray-400">Cart is empty</p>
              <p className="text-gray-500 mt-2">Start adding some products!</p>
            </div>
          ) : (
            items.map((item, index) => (
              <div key={`${item.product._id}-${index}`} className="flex gap-4 bg-gray-50 p-4 rounded-2xl">
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0">
                  <Image
                    src={item.product.images[0]}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium line-clamp-2">{item.product.name}</p>
                  
                  {(item.selectedSize || item.selectedColor) && (
                    <p className="text-sm text-gray-500 mt-1">
                      {item.selectedSize && `Size: ${item.selectedSize}`}
                      {item.selectedColor && ` • Color: ${item.selectedColor}`}
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center border rounded-xl">
                      <button
                        onClick={() => updateQuantity(item.product._id, item.quantity - 1, item.selectedSize, item.selectedColor)}
                        className="px-3 py-1 hover:bg-white rounded-l-xl"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-4 font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product._id, item.quantity + 1, item.selectedSize, item.selectedColor)}
                        className="px-3 py-1 hover:bg-white rounded-r-xl"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.product._id, item.selectedSize, item.selectedColor)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="text-right font-semibold">
                  Rs. {(item.product.price * item.quantity).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t p-6 space-y-4">
            <div className="flex justify-between text-xl font-semibold">
              <span>Total</span>
              <span>Rs. {getTotalPrice().toLocaleString()}</span>
            </div>

            <Link
              href="/checkout"
              onClick={onClose}
              className="block w-full bg-black text-white text-center py-4 rounded-2xl font-semibold hover:bg-gray-800 transition"
            >
              Proceed to Checkout
            </Link>

            <button
              onClick={() => {
                clearCart();
                onClose();
              }}
              className="w-full text-red-600 py-3 text-sm font-medium hover:bg-red-50 rounded-2xl transition"
            >
              Clear Cart
            </button>
          </div>
        )}
      </div>
    </>
  );
}