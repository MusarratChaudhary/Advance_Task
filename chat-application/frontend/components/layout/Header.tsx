"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  MessageCircle,
  Menu,
  X,
  LogOut,
  MessageSquare,
  User,
  ChevronDown,
  Sparkles,
  Settings,
  Sun,
  Moon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import api from "@/lib/axios";
import ProfileSettingsModal from "@/components/chat/ProfileSettingsModal";

export default function Header() {
  const { user, setUser, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu and dropdown on page change
  useEffect(() => {
    setOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      setUser(null);
      setDropdownOpen(false);
      setOpen(false);
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const isAuthPage = pathname === "/login" || pathname === "/register";

  if (isAuthPage) return null;

  const socketUrl =
    process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

  const navLinks = [
    { name: "Home", href: "/" },
    ...(user ? [{ name: "Chat", href: "/chat" }] : []),
  ];

  const isChatPage = pathname === "/chat";

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isChatPage
            ? "border-b border-zinc-200/80 dark:border-white/10 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl py-3"
            : scrolled
              ? "border-b border-zinc-200/80 dark:border-white/10 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl py-3.5 shadow-sm shadow-zinc-100/50 dark:shadow-none"
              : "border-b border-transparent bg-transparent py-5"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 group"
            id="header-logo"
          >
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white shadow-lg shadow-orange-500/30"
            >
              <MessageCircle size={22} />
            </motion.div>

            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-700 dark:from-white dark:via-zinc-200 dark:to-zinc-300 bg-clip-text text-transparent group-hover:opacity-90 transition-opacity">
              ChatSphere
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-8 md:flex">
            <div className="flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative text-sm font-medium px-1 py-1.5 transition-colors duration-200 ${
                    pathname === link.href
                      ? "text-orange-500 dark:text-orange-400"
                      : "text-zinc-600 dark:text-zinc-300 hover:text-orange-500 dark:hover:text-orange-400"
                  }`}
                >
                  {link.name}
                  {pathname === link.href && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-orange-500 dark:bg-orange-400 rounded-full"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 30,
                      }}
                    />
                  )}
                </Link>
              ))}
            </div>

            {/* Auth Status & CTA */}
            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <motion.button
                onClick={toggleTheme}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 hover:border-orange-500/40 hover:text-orange-500 dark:hover:text-orange-400 transition-colors duration-200 cursor-pointer"
                title={
                  theme === "dark"
                    ? "Switch to light mode"
                    : "Switch to dark mode"
                }
                aria-label="Toggle theme"
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={theme}
                    initial={{ opacity: 0, rotate: -30, scale: 0.7 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={{ opacity: 0, rotate: 30, scale: 0.7 }}
                    transition={{ duration: 0.18 }}
                    className="flex items-center justify-center"
                  >
                    {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                  </motion.span>
                </AnimatePresence>
              </motion.button>

              {!loading &&
                (user ? (
                  <div className="relative">
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="flex items-center gap-2 p-1.5 pr-3 rounded-full border border-zinc-200 dark:border-white/10 hover:border-orange-500/40 hover:bg-zinc-50 dark:hover:bg-white/5 transition-all duration-200 cursor-pointer"
                      id="user-menu-btn"
                    >
                      <div className="h-8 w-8 rounded-full overflow-hidden border border-orange-500/50 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                        {user.avatar ? (
                          <img
                            src={
                              user.avatar.startsWith("http")
                                ? user.avatar
                                : `${socketUrl}${user.avatar}`
                            }
                            alt={user.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <User size={16} className="text-zinc-400" />
                        )}
                      </div>
                      <span className="text-sm font-semibold max-w-[100px] truncate text-zinc-700 dark:text-zinc-200">
                        {user.name.split(" ")[0]}
                      </span>
                      <ChevronDown
                        size={14}
                        className={`text-zinc-500 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                      />
                    </button>

                    <AnimatePresence>
                      {dropdownOpen && (
                        <>
                          {/* Backdrop for click outside */}
                          <div
                            className="fixed inset-0 z-30"
                            onClick={() => setDropdownOpen(false)}
                          />

                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 mt-2 w-56 rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-950 p-2 shadow-2xl z-40"
                          >
                            <div className="px-3 py-2.5 mb-1.5">
                              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider">
                                Account
                              </p>
                              <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
                                {user.name}
                              </p>
                              <p className="text-xs text-zinc-500 dark:text-zinc-450 truncate">
                                {user.email}
                              </p>
                            </div>

                            <div className="h-[1px] bg-zinc-150 dark:bg-white/5 my-1" />

                            <Link
                              href="/chat"
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-xl text-zinc-700 dark:text-zinc-200 hover:bg-zinc-55 dark:hover:bg-white/5 hover:text-orange-500 transition"
                            >
                              <MessageSquare
                                size={16}
                                className="text-orange-500"
                              />
                              Launch Chat
                            </Link>

                            <button
                              onClick={() => {
                                setDropdownOpen(false);
                                setShowSettings(true);
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-xl text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-white/5 hover:text-orange-500 transition cursor-pointer text-left"
                            >
                              <Settings size={16} className="text-orange-500" />
                              Profile Settings
                            </button>

                            <div className="h-[1px] bg-zinc-150 dark:bg-white/5 my-1" />

                            <button
                              onClick={handleLogout}
                              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition cursor-pointer text-left"
                              id="logout-btn"
                            >
                              <LogOut size={16} />
                              Sign Out
                            </button>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="text-sm font-semibold text-zinc-600 dark:text-zinc-300 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
                      id="nav-login"
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold text-sm px-5 py-2.5 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/35 hover:-translate-y-0.5 transition-all duration-250 flex items-center gap-1.5"
                      id="nav-signup"
                    >
                      <span>Get Started</span>
                      <Sparkles size={14} className="animate-pulse" />
                    </Link>
                  </>
                ))}
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setOpen(!open)}
            className="rounded-xl p-2.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/5 transition md:hidden cursor-pointer"
            aria-label="Toggle Menu"
            id="mobile-menu-toggle"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden border-t border-zinc-200 dark:border-white/5 bg-white dark:bg-zinc-950 md:hidden"
            >
              <div className="flex flex-col gap-4 px-6 py-5">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={`text-base font-medium py-1 transition-colors ${
                      pathname === link.href
                        ? "text-orange-500"
                        : "text-zinc-600 dark:text-zinc-300 hover:text-orange-500"
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}

                {/* Mobile theme toggle */}
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-3 py-1 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-orange-500 dark:hover:text-orange-400 transition-colors cursor-pointer"
                >
                  {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                  {theme === "dark" ? "Light Mode" : "Dark Mode"}
                </button>

                {user ? (
                  <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-white/5 flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full overflow-hidden border border-orange-500 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                        {user.avatar ? (
                          <img
                            src={
                              user.avatar.startsWith("http")
                                ? user.avatar
                                : `${socketUrl}${user.avatar}`
                            }
                            alt={user.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <User size={18} className="text-zinc-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                          {user.name}
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate max-w-[200px]">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <Link
                      href="/chat"
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-center gap-2 w-full rounded-xl bg-orange-500 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 transition"
                    >
                      <MessageSquare size={16} />
                      Launch Chat
                    </Link>
                    <button
                      onClick={() => {
                        setOpen(false);
                        setShowSettings(true);
                      }}
                      className="flex items-center justify-center gap-2 w-full rounded-xl border border-zinc-200 dark:border-white/10 py-2.5 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/5 transition cursor-pointer"
                    >
                      <Settings size={16} className="text-orange-500" />
                      Profile Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex items-center justify-center gap-2 w-full rounded-xl border border-red-200 dark:border-red-950/30 py-2.5 text-sm font-semibold text-red-650 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition cursor-pointer"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-white/5 flex flex-col gap-3">
                    <Link
                      href="/login"
                      onClick={() => setOpen(false)}
                      className="w-full text-center py-2.5 text-sm font-semibold text-zinc-600 dark:text-zinc-300 hover:text-orange-500 transition"
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setOpen(false)}
                      className="w-full text-center py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700 transition"
                    >
                      Get Started
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <ProfileSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </>
  );
}
