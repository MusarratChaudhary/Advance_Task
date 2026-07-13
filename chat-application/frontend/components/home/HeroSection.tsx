"use client";

import Link from "next/link";
import { MessageCircle, ShieldCheck, Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-20 h-72 w-72 -translate-x-1/2 rounded-full bg-orange-500/20 blur-3xl" />
      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 md:grid-cols-2 md:py-32">
        {/* Left Content */}
        <motion.div
          initial={{
            opacity: 0,
            x: -40,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            duration: 0.7,
          }}
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-2 text-sm text-orange-500">
            <Zap size={16} />
            Real-Time Messaging Platform
          </div>

          <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Connect.
            <span className="text-orange-500"> Chat.</span> Create Moments.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
            ChatSphere brings secure and seamless conversations with real-time
            messaging, online presence and a modern communication experience.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/register"
              className="rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:bg-orange-600"
            >
              Start Chatting
            </Link>

            <Link
              href="/login"
              className="rounded-xl border border-white/10 px-6 py-3 font-semibold transition hover:border-orange-500 hover:text-orange-500"
            >
              Login
            </Link>
          </div>

          {/* Mini Features */}

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-3">
              <MessageCircle className="text-orange-500" size={22} />

              <span className="text-sm">Instant Chat</span>
            </div>

            <div className="flex items-center gap-3">
              <ShieldCheck className="text-orange-500" size={22} />

              <span className="text-sm">Secure</span>
            </div>

            <div className="flex items-center gap-3">
              <Zap className="text-orange-500" size={22} />

              <span className="text-sm">Fast</span>
            </div>
          </div>
        </motion.div>

        {/* Right Chat Preview */}

        <motion.div
          initial={{
            opacity: 0,
            scale: 0.9,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            duration: 0.7,
          }}
          className="relative"
        >
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
            {/* Fake Chat Header */}

            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="h-12 w-12 rounded-full bg-orange-500" />

              <div>
                <h3 className="font-semibold">Alex</h3>

                <p className="text-sm text-green-500">Online</p>
              </div>
            </div>

            {/* Messages */}

            <div className="space-y-4 py-6">
              <div className="ml-auto w-fit rounded-2xl bg-orange-500 px-4 py-3 text-white">
                Hey! 👋
              </div>

              <div className="w-fit rounded-2xl bg-white/10 px-4 py-3">
                Welcome to ChatSphere 🚀
              </div>

              <div className="ml-auto w-fit rounded-2xl bg-orange-500 px-4 py-3 text-white">
                Let's chat!
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
