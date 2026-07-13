"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle, Shield, CheckCircle, Send } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

export default function Footer() {
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const isAuthPage = pathname === "/login" || pathname === "/register";
  if (isAuthPage) return null;

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <footer className="border-t border-zinc-200 dark:border-white/5 bg-zinc-50/50 dark:bg-black/30 backdrop-blur-md relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute -bottom-24 left-1/3 -z-10 h-64 w-64 rounded-full bg-orange-500/5 dark:bg-orange-500/10 blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Column */}
          <div className="flex flex-col gap-6">
            <Link
              href="/"
              className="flex items-center gap-3 group w-fit"
              id="footer-logo"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white shadow-lg shadow-orange-500/20 group-hover:shadow-orange-500/40 transition-all duration-300">
                <MessageCircle
                  size={22}
                  className="group-hover:rotate-12 transition-transform duration-300"
                />
              </div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-700 dark:from-white dark:via-zinc-200 dark:to-zinc-300 bg-clip-text text-transparent">
                ChatSphere
              </span>
            </Link>

            <p className="text-sm leading-6 text-zinc-500 dark:text-zinc-450">
              A modern, real-time messaging platform designed for smooth,
              secure, and meaningful communication.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3">
              <motion.a
                whileHover={{ y: -3, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 dark:border-white/10 bg-white/50 dark:bg-white/5 text-zinc-605 dark:text-zinc-400 hover:text-orange-550 dark:hover:text-orange-400 hover:border-orange-500/30 hover:shadow-md hover:shadow-orange-500/5 transition-all duration-200"
                id="footer-social-github"
                aria-label="GitHub"
              >
                <svg
                  className="h-5 w-5 fill-current"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </motion.a>
              <motion.a
                whileHover={{ y: -3, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 dark:border-white/10 bg-white/50 dark:bg-white/5 text-zinc-605 dark:text-zinc-400 hover:text-orange-550 dark:hover:text-orange-400 hover:border-orange-500/30 hover:shadow-md hover:shadow-orange-500/5 transition-all duration-200"
                id="footer-social-linkedin"
                aria-label="LinkedIn"
              >
                <svg
                  className="h-5 w-5 fill-current"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764.784-1.764 1.75-1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
                    clipRule="evenodd"
                  />
                </svg>
              </motion.a>
              <motion.a
                whileHover={{ y: -3, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 dark:border-white/10 bg-white/50 dark:bg-white/5 text-zinc-605 dark:text-zinc-400 hover:text-orange-550 dark:hover:text-orange-400 hover:border-orange-500/30 hover:shadow-md hover:shadow-orange-500/5 transition-all duration-200"
                id="footer-social-twitter"
                aria-label="Twitter/X"
              >
                <svg
                  className="h-4 w-4 fill-current"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </motion.a>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-455 dark:text-zinc-500 mb-6">
              Platform
            </h4>
            <ul className="flex flex-col gap-3 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-zinc-500 dark:text-zinc-400 hover:text-orange-500 dark:hover:text-orange-400 hover:translate-x-1 inline-block transition-all duration-200"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/chat"
                  className="text-zinc-500 dark:text-zinc-400 hover:text-orange-500 dark:hover:text-orange-400 hover:translate-x-1 inline-block transition-all duration-200"
                >
                  Live Chat
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="text-zinc-500 dark:text-zinc-400 hover:text-orange-500 dark:hover:text-orange-400 hover:translate-x-1 inline-block transition-all duration-200"
                >
                  Sign In
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="text-zinc-500 dark:text-zinc-400 hover:text-orange-500 dark:hover:text-orange-400 hover:translate-x-1 inline-block transition-all duration-200"
                >
                  Register
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Legal */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-455 dark:text-zinc-500 mb-6">
              Legal & Security
            </h4>
            <ul className="flex flex-col gap-3 text-sm">
              <li className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                <Shield size={14} className="text-orange-500 flex-shrink-0" />
                <span className="hover:text-orange-500 dark:hover:text-orange-400 cursor-pointer transition-colors duration-200">
                  End-to-End Encryption
                </span>
              </li>
              <li>
                <a
                  href="#"
                  className="text-zinc-500 dark:text-zinc-400 hover:text-orange-500 dark:hover:text-orange-400 hover:translate-x-1 inline-block transition-all duration-200"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-zinc-500 dark:text-zinc-400 hover:text-orange-500 dark:hover:text-orange-400 hover:translate-x-1 inline-block transition-all duration-200"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-zinc-500 dark:text-zinc-400 hover:text-orange-500 dark:hover:text-orange-400 hover:translate-x-1 inline-block transition-all duration-200"
                >
                  Security Hub
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter / Systems status */}
          <div className="flex flex-col gap-6">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-455 dark:text-zinc-500 mb-6">
                Stay Updated
              </h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-450 mb-4 leading-relaxed">
                Subscribe to our updates for new features and releases.
              </p>
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition-all duration-200"
                  id="newsletter-email"
                />
                <button
                  type="submit"
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transition-all duration-250 cursor-pointer flex-shrink-0"
                  aria-label="Subscribe"
                  id="newsletter-submit"
                >
                  <Send size={14} />
                </button>
              </form>
              {subscribed && (
                <p className="text-[11px] text-green-605 dark:text-green-450 mt-2 flex items-center gap-1">
                  <CheckCircle size={12} />
                  Thanks for subscribing!
                </p>
              )}
            </div>

            {/* Systems status */}
            <div className="flex items-center gap-2 border border-zinc-200 dark:border-white/5 bg-zinc-100/50 dark:bg-white/5 px-3.5 py-2.5 rounded-xl w-fit">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-[11px] font-semibold text-zinc-650 dark:text-zinc-300">
                Systems: All operational
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-zinc-200 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 dark:text-zinc-450">
          <p>© {new Date().getFullYear()} ChatSphere. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-550" />
              Built for modern connections
            </span>
            <a href="#" className="hover:text-orange-500 transition-colors">
              Documentation
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
