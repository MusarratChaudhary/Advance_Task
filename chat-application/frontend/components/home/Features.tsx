"use client";

import {
  MessageSquare,
  ShieldCheck,
  Users,
  Zap,
  Smartphone,
  Lock,
} from "lucide-react";

import { motion } from "framer-motion";

const features = [
  {
    icon: MessageSquare,

    title: "Real-Time Messaging",

    description:
      "Enjoy instant conversations with lightning-fast message delivery using modern real-time technology.",
  },

  {
    icon: ShieldCheck,

    title: "Secure Authentication",

    description:
      "Your conversations stay protected with secure login and authentication systems.",
  },

  {
    icon: Users,

    title: "Online Presence",

    description: "See who's online and connect with your friends instantly.",
  },

  {
    icon: Zap,

    title: "Fast Experience",

    description:
      "Optimized performance ensures smooth and quick communication.",
  },

  {
    icon: Smartphone,

    title: "Fully Responsive",

    description:
      "Chat anywhere with a beautiful experience across all devices.",
  },

  {
    icon: Lock,

    title: "Privacy Focused",

    description: "Built with security and privacy as a priority.",
  },
];

export default function Features() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      {/* Heading */}

      <div className="mx-auto mb-14 max-w-2xl text-center">
        <h2 className="text-3xl font-bold sm:text-4xl">
          Everything You Need For
          <span className="text-orange-500"> Modern Conversations</span>
        </h2>

        <p className="mt-4 text-muted-foreground">
          Powerful features designed to make communication simple, fast and
          secure.
        </p>
      </div>

      {/* Cards */}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => {
          const Icon = feature.icon;

          return (
            <motion.div
              key={feature.title}
              initial={{
                opacity: 0,
                y: 30,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
              }}
              className="group rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition hover:-translate-y-2 hover:border-orange-500/40"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500 transition group-hover:bg-orange-500 group-hover:text-white">
                <Icon size={24} />
              </div>

              <h3 className="mb-3 text-xl font-semibold">{feature.title}</h3>

              <p className="text-sm leading-6 text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
