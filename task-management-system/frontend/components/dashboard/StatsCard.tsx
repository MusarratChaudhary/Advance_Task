"use client";

import { ReactNode } from "react";

import { motion } from "framer-motion";

interface Props {
  title: string;

  value: number;

  icon: ReactNode;

  gradient: string;
}

export default function StatsCard({
  title,

  value,

  icon,

  gradient,
}: Props) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      whileHover={{
        y: -8,
      }}
      transition={{
        duration: 0.4,
      }}
      className="
relative
overflow-hidden
rounded-3xl
border
border-border
bg-card
p-6
shadow-sm
hover:shadow-xl
transition
"
    >
      <div
        className={`

absolute

top-0

right-0

h-24

w-24

rounded-full

blur-3xl

opacity-40

${gradient}

`}
      />

      <div className="flex justify-between items-start">
        <div>
          <p
            className="

text-sm

text-zinc-500

dark:text-zinc-400

"
          >
            {title}
          </p>

          <h2
            className="

mt-3

text-4xl

font-bold

"
          >
            {value}
          </h2>
        </div>

        <div
          className="

h-12

w-12

rounded-2xl

bg-purple-100

dark:bg-purple-950

text-purple-600

flex

items-center

justify-center

"
        >
          {icon}
        </div>
      </div>
    </motion.div>
  );
}
