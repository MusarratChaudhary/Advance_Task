import { Task } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import TaskCard from "./TaskCard";

interface KanbanBoardProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
}

const COLUMNS = [
  {
    id: "TODO",
    title: "To Do",
    color: "bg-zinc-100 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400",
  },
  {
    id: "IN_PROGRESS",
    title: "In Progress",
    color: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
  },
  {
    id: "COMPLETED",
    title: "Completed",
    color:
      "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400",
  },
] as const;

export default function KanbanBoard({ tasks, onTaskClick }: KanbanBoardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full min-h-[600px]">
      {COLUMNS.map((col) => {
        const columnTasks = tasks.filter((t) => t.status === col.id);

        return (
          <div
            key={col.id}
            className="flex flex-col h-full bg-zinc-50/50 dark:bg-zinc-900/20 rounded-3xl p-4 border border-zinc-100 dark:border-zinc-800/50"
          >
            <div className="flex items-center justify-between mb-4 px-2">
              <h2 className="font-semibold text-zinc-700 dark:text-zinc-200">
                {col.title}
              </h2>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${col.color}`}
              >
                {columnTasks.length}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 px-2 pb-2 custom-scrollbar">
              <AnimatePresence>
                {columnTasks.map((task) => (
                  <motion.div
                    key={task._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <TaskCard task={task} onClick={onTaskClick} />
                  </motion.div>
                ))}
                {columnTasks.length === 0 && (
                  <div className="h-24 flex items-center justify-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                    <p className="text-sm text-zinc-400">No tasks</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        );
      })}
    </div>
  );
}
