"use client";

import { motion } from "framer-motion";

import { CalendarDays, ArrowRight } from "lucide-react";

import Link from "next/link";

import { Task } from "@/types";

interface Props {
  tasks: Task[];
}

export default function RecentTasks({ tasks }: Props) {
  return (
    <div
      className="
rounded-3xl
border
border-border
bg-card
p-6
shadow-sm
"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold">Recent Tasks</h2>

          <p className="text-sm text-zinc-500">Your latest work activity</p>
        </div>

        <Link
          href="/dashboard/tasks"
          className="

flex

items-center

gap-1

text-sm

text-purple-600

font-medium

hover:gap-2

transition

"
        >
          View All
          <ArrowRight size={16} />
        </Link>
      </div>

      <div className="space-y-4">
        {tasks.length === 0 ? (
          <div
            className="

text-center

py-10

text-zinc-500

"
          >
            No tasks available 🚀
          </div>
        ) : (
          tasks.slice(0, 5).map((task) => (
            <motion.div
              key={task._id}
              whileHover={{
                scale: 1.02,
              }}
              className="

rounded-2xl

border

border-zinc-100

dark:border-zinc-800

p-4

flex

flex-col

md:flex-row

md:items-center

justify-between

gap-4

transition

"
            >
              <div>
                <h3 className="font-semibold">{task.title}</h3>

                <p className="text-sm text-zinc-500 mt-1">{task.description}</p>

                <div className="flex flex-wrap gap-2 mt-3">
                  <span
                    className="

px-3

py-1

rounded-full

text-xs

bg-purple-100

text-purple-700

dark:bg-purple-950

dark:text-purple-300

"
                  >
                    {task.status}
                  </span>

                  <span
                    className="

px-3

py-1

rounded-full

text-xs

bg-red-100

text-red-700

dark:bg-red-950

dark:text-red-300

"
                  >
                    {task.priority}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-zinc-500">
                <CalendarDays size={16} />

                {task.dueDate
                  ? new Date(task.dueDate).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "No due date"}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
