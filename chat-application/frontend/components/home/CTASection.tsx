"use client";

import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function CTASection() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <motion.div
        initial={{
          opacity: 0,
          y: 40,
        }}
        whileInView={{
          opacity: 1,
          y: 0,
        }}
        viewport={{
          once: true,
        }}
        transition={{
          duration: 0.6,
        }}
        className="relative overflow-hidden rounded-3xl border border-orange-500/20 bg-orange-500/10 px-6 py-14 text-center backdrop-blur-xl sm:px-12"
      >
        {/* Background Glow */}

        <div className="absolute left-1/2 top-0 -z-10 h-40 w-40 -translate-x-1/2 rounded-full bg-orange-500/30 blur-3xl" />

        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-500/30">
          <MessageCircle size={28} />
        </div>

        <h2 className="mt-6 text-3xl font-bold sm:text-4xl">
          Ready to Start Your
          <span className="text-orange-500"> Conversation?</span>
        </h2>

        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Join ChatSphere today and experience fast, secure and seamless
          real-time communication.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/register"
            className="flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:bg-orange-600"
          >
            Create Account
            <ArrowRight size={18} />
          </Link>

          <Link
            href="/login"
            className="rounded-xl border border-white/10 px-6 py-3 font-semibold transition hover:border-orange-500 hover:text-orange-500"
          >
            Login
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
