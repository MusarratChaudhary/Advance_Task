"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import KanbanBoard from "@/components/dashboard/KanbanBoard";
import { Task } from "@/types";
import api from "@/lib/axios";
import { Plus, Search, Filter } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import CreateTaskModal from "@/components/tasks/CreateTaskModal";
import TaskDetailsModal from "@/components/tasks/TaskDetailsModal";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
  };

  const fetchTasks = async () => {
    try {
      const res = await api.get("/tasks");
      setTasks(res.data.tasks || []);
    } catch (error) {
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100">Tasks</h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-sm sm:text-base">Manage and track your team's tasks</p>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input 
                type="text" 
                placeholder="Search tasks..." 
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>
            <button className="p-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition shrink-0">
              <Filter className="w-4 h-4" />
            </button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-3 sm:px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-medium transition shadow-sm hover:shadow-md shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Task</span>
            </motion.button>
          </div>
        </div>

        <div className="flex-1 min-h-0">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-600 rounded-full animate-spin" />
            </div>
          ) : (
            <KanbanBoard tasks={tasks} onTaskClick={handleTaskClick} />
          )}
        </div>
      </div>

      <CreateTaskModal 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchTasks} 
      />

      <TaskDetailsModal
        task={selectedTask}
        open={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        onSuccess={fetchTasks}
      />
    </DashboardLayout>
  );
}
