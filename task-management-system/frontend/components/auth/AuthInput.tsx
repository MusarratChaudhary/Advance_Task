"use client";

import { InputHTMLAttributes, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export default function AuthInput({ label, type, ...props }: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = type === "password";
  const inputType = isPasswordField
    ? showPassword
      ? "text"
      : "password"
    : type;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label}
      </label>

      <div className="relative">
        <input
          {...props}
          type={inputType}
          className="
            w-full rounded-lg border border-zinc-300 dark:border-zinc-600 
            bg-white dark:bg-zinc-800 px-4 py-3 text-zinc-900 dark:text-zinc-100
            placeholder:text-zinc-400 dark:placeholder:text-zinc-500
            focus:border-purple-500 dark:focus:border-purple-400 
            focus:ring-2 focus:ring-purple-500/20 dark:focus:ring-purple-400/20 
            outline-none transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            pr-12
          "
        />

        {isPasswordField && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="
              absolute right-3 top-1/2 -translate-y-1/2 p-1 
              text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 
              transition-colors duration-200 focus:outline-none focus:ring-2 
              focus:ring-purple-500/20 rounded
            "
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
