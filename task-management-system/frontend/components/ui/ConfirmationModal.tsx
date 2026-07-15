"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Info, AlertCircle, X } from "lucide-react";
import { Button } from "./button";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  isLoading = false,
}: ConfirmationModalProps) {
  const iconMap = {
    danger: (
      <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
    ),
    warning: (
      <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
    ),
    info: <Info className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
  };

  const borderColors = {
    danger: "border-red-100 dark:border-red-950/50",
    warning: "border-amber-100 dark:border-amber-950/50",
    info: "border-blue-100 dark:border-blue-950/50",
  };

  const bgColors = {
    danger: "bg-red-50 dark:bg-red-950/20",
    warning: "bg-amber-50 dark:bg-amber-950/20",
    info: "bg-blue-50 dark:bg-blue-950/20",
  };

  const confirmButtonVariants = {
    danger:
      "bg-red-600 hover:bg-red-700 text-white shadow-sm shadow-red-500/10",
    warning:
      "bg-amber-600 hover:bg-amber-700 text-white shadow-sm shadow-amber-500/10",
    info: "bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/10",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop blur overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-2xl z-10"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              disabled={isLoading}
              className="absolute top-4 right-4 h-8 w-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition disabled:opacity-50"
            >
              <X size={18} />
            </button>

            {/* Header Content */}
            <div className="flex flex-col items-center text-center mt-2">
              <div
                className={`p-3 rounded-2xl mb-4 ${bgColors[variant]} border ${borderColors[variant]} flex items-center justify-center`}
              >
                {iconMap[variant]}
              </div>

              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                {title}
              </h3>

              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed mb-6">
                {description}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 w-full">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 py-5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 font-semibold transition"
              >
                {cancelText}
              </Button>
              <Button
                onClick={onConfirm}
                disabled={isLoading}
                className={`flex-1 py-5 rounded-xl font-semibold transition flex items-center justify-center gap-2 ${confirmButtonVariants[variant]}`}
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : null}
                <span>{confirmText}</span>
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
