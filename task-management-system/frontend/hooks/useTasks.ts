"use client";

import { useState } from "react";
import api from "@/lib/axios";
import { toast } from "sonner";

interface CreateTaskPayload {
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string;
  assignedTo?: string | null;
  teamId?: string | null;
}

export function useTasks() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTask = async (data: CreateTaskPayload) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.post("/tasks", data);
      toast.success("Task created successfully");
      return response.data;
    } catch (error: any) {
      const errMsg = error?.response?.data?.message || "Something went wrong";
      setError(errMsg);
      toast.error(errMsg);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateTask = async (taskId: string, data: Partial<CreateTaskPayload>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.put(`/tasks/${taskId}`, data);
      toast.success("Task updated successfully");
      return response.data;
    } catch (error: any) {
      const errMsg = error?.response?.data?.message || "Failed to update task";
      setError(errMsg);
      toast.error(errMsg);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.delete(`/tasks/${taskId}`);
      toast.success("Task deleted successfully");
      return response.data;
    } catch (error: any) {
      const errMsg = error?.response?.data?.message || "Failed to delete task";
      setError(errMsg);
      toast.error(errMsg);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    createTask,
    updateTask,
    deleteTask,
    loading,
    error,
  };
}