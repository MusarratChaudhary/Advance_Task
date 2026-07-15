"use client";

import { motion, AnimatePresence } from "framer-motion";

import { X } from "lucide-react";

import TaskForm from "./TaskForm";

import { useTasks } from "@/hooks/useTasks";

import { useState } from "react";

interface Props {
  open: boolean;

  onClose: () => void;

  onSuccess?: () => void;
}

export default function CreateTaskModal({
  open,

  onClose,

  onSuccess,
}: Props) {
  const {
    createTask,

    loading,
  } = useTasks();

  const [error, setError] = useState("");

  const handleCreate = async (data: any) => {
    try {
      setError("");

      await createTask(data);

      onSuccess?.();

      onClose();
    } catch (error: any) {
      setError(error?.response?.data?.message || "Failed to create task");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          exit={{
            opacity: 0,
          }}
          className="
fixed
inset-0
z-50
flex
items-center
justify-center
bg-black/50
backdrop-blur-md
px-4
"
        >
          <motion.div
            initial={{
              scale: 0.95,
              opacity: 0,
              y: 30,
            }}
            animate={{
              scale: 1,
              opacity: 1,
              y: 0,
            }}
            exit={{
              scale: 0.95,
              opacity: 0,
              y: 30,
            }}
            transition={{
              duration: 0.25,
            }}
            className="
relative
w-full
max-w-xl
max-h-[90vh]
overflow-y-auto
rounded-3xl
border
border-purple-100
dark:border-zinc-800
bg-white
dark:bg-zinc-950
p-6
shadow-2xl
"
          >
            <div
              className="
flex
items-center
justify-between
mb-6
"
            >
              <div>
                <h2
                  className="
text-2xl
font-bold
"
                >
                  Create New Task
                </h2>

                <p
                  className="
text-sm
text-zinc-500
mt-1
"
                >
                  Add a new task to your workspace
                </p>
              </div>

              <button
                onClick={onClose}
                className="
h-10
w-10
rounded-xl
hover:bg-zinc-100
dark:hover:bg-zinc-800
flex
items-center
justify-center
transition
"
              >
                <X size={20} />
              </button>
            </div>

            {error && (
              <div
                className="
mb-4
rounded-xl
bg-red-100
text-red-600
px-4
py-3
text-sm
"
              >
                {error}
              </div>
            )}

            <TaskForm onSubmit={handleCreate} loading={loading} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
