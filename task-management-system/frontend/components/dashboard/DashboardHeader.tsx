"use client";

import { motion } from "framer-motion";

import { Plus } from "lucide-react";

import { useState } from "react";

import { useAuth } from "@/context/AuthContext";

import CreateTaskModal from "@/components/tasks/CreateTaskModal";

export default function DashboardHeader() {
  const [open, setOpen] = useState(false);

  const { user } = useAuth();

  return (
    <>
      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.5,
        }}
        className="
flex
flex-col
md:flex-row
md:items-center
justify-between
gap-6
mb-8
"
      >
        <div>
          <h1
            className="
text-3xl
md:text-4xl
font-bold
tracking-tight
"
          >
            Good Evening, {user?.name || "User"} 👋
          </h1>

          <p
            className="
mt-2
text-zinc-500
dark:text-zinc-400
"
          >
            Welcome back! Here is your productivity overview.
          </p>

          <div
            className="
mt-4
inline-flex
items-center
gap-2
rounded-full
bg-purple-100
dark:bg-purple-950
px-4
py-2
text-sm
font-medium
text-purple-700
dark:text-purple-300
"
          >
            <span
              className="
h-2
w-2
rounded-full
bg-purple-500
"
            />

            {user?.role || "MEMBER"}
          </div>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="

flex

items-center

gap-2

rounded-2xl

bg-gradient-to-r

from-purple-600

to-purple-500

px-5

py-3

text-white

font-semibold

shadow-lg

shadow-purple-500/20

transition

hover:scale-105

active:scale-95

"
        >
          <Plus size={20} />
          Create Task
        </button>
      </motion.div>

      <CreateTaskModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
