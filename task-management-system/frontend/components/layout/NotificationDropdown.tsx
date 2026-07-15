"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, Rocket } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-10 w-10 rounded-xl bg-purple-100 dark:bg-zinc-800 text-purple-600 flex items-center justify-center hover:bg-purple-200 dark:hover:bg-zinc-700 transition-colors duration-200"
      >
        <Bell size={20} />
      </button>

      {/* Notification Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 25,
              duration: 0.2,
            }}
            className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-100 dark:border-zinc-800 z-50"
          >
            {/* Header */}
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Notifications
              </h3>
            </div>

            {/* Notification List */}
            <div className="max-h-96 overflow-y-auto">
              {/* Welcome Message */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                className="p-4 border-b border-zinc-50 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                    <Rocket className="text-purple-600" size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
                      Welcome to TaskPilot
                      <Rocket className="text-purple-600" size={14} />
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                      Get started by creating your first task or team
                    </p>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-2">
                      Just now
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* No New Notifications */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className="p-4 text-center"
              >
                <div className="text-zinc-400 dark:text-zinc-500 text-sm">
                  <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Bell size={20} className="text-zinc-400" />
                  </div>
                  <p className="font-medium mb-1">No new notifications</p>
                  <p className="text-xs">You're all caught up! 🎉</p>
                </div>
              </motion.div>
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-zinc-100 dark:border-zinc-800">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full text-center text-sm text-purple-600 hover:text-purple-700 dark:hover:text-purple-400 font-medium transition-colors"
              >
                View All Notifications
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
