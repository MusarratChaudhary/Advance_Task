"use client";

import { UserPlus, Search, MessageCircle } from "lucide-react";

import { motion } from "framer-motion";

const steps = [
  {
    number: "01",

    icon: UserPlus,

    title: "Create Account",

    description:
      "Sign up in seconds and create your personal ChatSphere account.",
  },

  {
    number: "02",

    icon: Search,

    title: "Find & Connect",

    description:
      "Discover users and connect with people you want to chat with.",
  },

  {
    number: "03",

    icon: MessageCircle,

    title: "Start Chatting",

    description:
      "Enjoy instant real-time conversations with a smooth experience.",
  },
];

export default function HowItWorks() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      {/* Heading */}

      <div className="mx-auto mb-14 max-w-2xl text-center">
        <h2 className="text-3xl font-bold sm:text-4xl">
          How
          <span className="text-orange-500"> ChatSphere</span> Works?
        </h2>

        <p className="mt-4 text-muted-foreground">
          Get started with simple steps and begin your conversations instantly.
        </p>
      </div>

      {/* Steps */}

      <div className="grid gap-8 md:grid-cols-3">
        {steps.map((step, index) => {
          const Icon = step.icon;

          return (
            <motion.div
              key={step.number}
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
                duration: 0.5,
                delay: index * 0.15,
              }}
              className="relative rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl"
            >
              {/* Number */}

              <div className="absolute right-6 top-5 text-5xl font-bold text-orange-500/20">
                {step.number}
              </div>

              {/* Icon */}

              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-500/30">
                <Icon size={28} />
              </div>

              <h3 className="mb-3 text-xl font-semibold">{step.title}</h3>

              <p className="leading-7 text-muted-foreground">
                {step.description}
              </p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
