import { Task } from "@/types";
import { motion } from "framer-motion";
import { Calendar, AlertCircle, CheckCircle2, Clock } from "lucide-react";

interface TaskCardProps {
  task: Task;
  onClick?: (task: Task) => void;
}

export default function TaskCard({ task, onClick }: TaskCardProps) {
  const priorityColors = {
    LOW: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    MEDIUM:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    HIGH: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };

  const statusIcons = {
    TODO: <Clock className="w-4 h-4 text-zinc-500" />,
    IN_PROGRESS: <AlertCircle className="w-4 h-4 text-blue-500" />,
    COMPLETED: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
  };

  return (
    <motion.div
      layoutId={`task-${task._id}`}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick?.(task)}
      className="p-4 bg-white dark:bg-zinc-800/50 backdrop-blur-sm border border-zinc-200 dark:border-zinc-700/50 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer group"
    >
      <div className="flex justify-between items-start mb-3">
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${priorityColors[task.priority]}`}
        >
          {task.priority}
        </span>
        {statusIcons[task.status]}
      </div>

      <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2 line-clamp-2">
        {task.title}
      </h3>

      <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-4">
        {task.description}
      </p>

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-zinc-100 dark:border-zinc-700/50">
        <div className="flex items-center text-xs text-zinc-500 dark:text-zinc-400">
          <Calendar className="w-3.5 h-3.5 mr-1" />
          {task.dueDate
            ? new Date(task.dueDate).toLocaleDateString()
            : "No due date"}
        </div>

        {task.assignedTo && (
          <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 flex items-center justify-center text-xs font-bold ring-2 ring-white dark:ring-zinc-800">
            {task.assignedTo.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
    </motion.div>
  );
}
