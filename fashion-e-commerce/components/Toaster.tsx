'use client';

import { useToastStore } from '@/store/useToastStore';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Toaster() {
  const { toasts, dismissToast } = useToastStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed top-20 right-6 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
      {toasts.map((toast) => {
        let bgColor = 'bg-white';
        let borderColor = 'border-gray-200';
        let icon = <Info className="w-5 h-5 text-purple-500" />;

        if (toast.type === 'success') {
          bgColor = 'bg-gradient-to-r from-emerald-50 to-teal-50/90';
          borderColor = 'border-emerald-200';
          icon = <CheckCircle className="w-5 h-5 text-emerald-600" />;
        } else if (toast.type === 'error') {
          bgColor = 'bg-gradient-to-r from-rose-50 to-red-50/90';
          borderColor = 'border-rose-200';
          icon = <AlertCircle className="w-5 h-5 text-rose-600" />;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-lg backdrop-blur-md transition-all duration-300 transform translate-x-0 animate-fadeInRight ${bgColor} ${borderColor}`}
            style={{
              boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.08)'
            }}
          >
            <div className="flex-shrink-0 mt-0.5">{icon}</div>
            <div className="flex-1 text-sm font-semibold text-gray-800">
              {toast.message}
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition p-0.5 rounded-lg hover:bg-black/5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
