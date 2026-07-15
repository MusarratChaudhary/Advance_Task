"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Rocket } from "lucide-react";

interface Props {
  children: ReactNode;
  title: string;
  description: string;
}

export default function AuthCard({ children, title, description }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 shadow-2xl border border-zinc-200 dark:border-zinc-800 p-8 backdrop-blur-sm"
    >
      <div className="mb-8 text-center">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl mb-4">
            <Rocket className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            <span className="text-purple-600">Task</span>Pilot
          </h1>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            {title}
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      {children}
    </motion.div>
  );
}
