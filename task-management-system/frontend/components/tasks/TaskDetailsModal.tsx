"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  Edit2,
  Trash2,
} from "lucide-react";
import { Task } from "@/types";
import { useTasks } from "@/hooks/useTasks";
import TaskForm from "./TaskForm";
import ConfirmationModal from "@/components/ui/ConfirmationModal";

interface Props {
  task: Task | null;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function TaskDetailsModal({
  task,
  open,
  onClose,
  onSuccess,
}: Props) {
  const { updateTask, deleteTask, loading } = useTasks();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!task) return null;

  const priorityColors = {
    LOW: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    MEDIUM:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    HIGH: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };

  const statusIcons = {
    TODO: <Clock className="w-5 h-5 text-zinc-500" />,
    IN_PROGRESS: <AlertCircle className="w-5 h-5 text-blue-500" />,
    COMPLETED: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
  };

  const statusLabels = {
    TODO: "To Do",
    IN_PROGRESS: "In Progress",
    COMPLETED: "Completed",
  };

  const handleUpdate = async (data: any) => {
    try {
      await updateTask(task._id, data);
      setIsEditing(false);
      onSuccess?.();
      onClose();
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteTask(task._id);
      setShowDeleteConfirm(false);
      onSuccess?.();
      onClose();
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleCloseModal = () => {
    setIsEditing(false);
    onClose();
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md px-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              transition={{ duration: 0.25 }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-purple-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-2xl custom-scrollbar"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
                    {isEditing ? "Edit Task" : "Task Details"}
                  </h2>
                  {!isEditing && (
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${priorityColors[task.priority]}`}
                    >
                      {task.priority} Priority
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {!isEditing && (
                    <>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="h-10 w-10 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center transition"
                        title="Edit Task"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={handleDelete}
                        disabled={loading}
                        className="h-10 w-10 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 flex items-center justify-center transition disabled:opacity-50"
                        title="Delete Task"
                      >
                        <Trash2 size={18} />
                      </button>
                    </>
                  )}
                  <button
                    onClick={handleCloseModal}
                    className="h-10 w-10 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center transition"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {isEditing ? (
                <TaskForm
                  initialData={{
                    title: task.title,
                    description: task.description,
                    priority: task.priority,
                    status: task.status,
                    dueDate: task.dueDate,
                    assignedTo: task.assignedTo?._id,
                  }}
                  onSubmit={handleUpdate}
                  loading={loading}
                  isEdit
                />
              ) : (
                <div className="space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200">
                      {task.title}
                    </h3>
                    <p className="text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap leading-relaxed">
                      {task.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-zinc-100 dark:border-zinc-800 pt-6">
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50">
                      <div className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center shadow-sm">
                        {statusIcons[task.status]}
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                          Status
                        </p>
                        <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {statusLabels[task.status]}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50">
                      <div className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center shadow-sm text-purple-500">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                          Due Date
                        </p>
                        <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {task.dueDate
                            ? new Date(task.dueDate).toLocaleDateString(
                                undefined,
                                {
                                  weekday: "short",
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                },
                              )
                            : "No due date"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-zinc-100 dark:border-zinc-800 pt-6">
                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-4">
                      Assigned To
                    </p>
                    {task.assignedTo ? (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold shadow-md">
                          {task.assignedTo.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-zinc-900 dark:text-zinc-100">
                            {task.assignedTo.name}
                          </p>
                          <p className="text-xs text-zinc-500">
                            {task.assignedTo.email}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm italic text-zinc-400">Unassigned</p>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Delete Task"
        description="Are you sure you want to delete this task? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={loading}
      />
    </>
  );
}
