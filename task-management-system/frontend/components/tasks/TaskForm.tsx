"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

const taskSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  status: z.enum(["TODO", "IN_PROGRESS", "COMPLETED"]),
  dueDate: z.string().min(1, "Due date is required"),
  assignedTo: z.string().optional().nullable(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface Props {
  onSubmit: (data: TaskFormData) => Promise<void>;
  loading: boolean;
  initialData?: Partial<TaskFormData>;
  isEdit?: boolean;
}

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { User } from "@/types";

export default function TaskForm({
  onSubmit,
  loading,
  initialData,
  isEdit,
}: Props) {
  const [members, setMembers] = useState<User[]>([]);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await api.get("/teams");
        const teams = res.data.teams || [];
        const usersMap = new Map<string, User>();
        teams.forEach((team: any) => {
          team.members?.forEach((member: User) => {
            usersMap.set(member._id, member);
          });
        });
        setMembers(Array.from(usersMap.values()));
      } catch (err) {
        console.error("Failed to fetch members", err);
      }
    };
    fetchMembers();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      priority: (initialData?.priority as any) || "MEDIUM",
      status: (initialData?.status as any) || "TODO",
      dueDate: initialData?.dueDate
        ? new Date(initialData.dueDate).toISOString().split("T")[0]
        : "",
      assignedTo: initialData?.assignedTo || "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Title */}
      <div>
        <label className="text-sm font-medium">Task Title</label>
        <input
          {...register("title")}
          placeholder="Enter task title"
          className="mt-2 w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-transparent px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500"
        />
        {errors.title && (
          <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="text-sm font-medium">Description</label>
        <textarea
          {...register("description")}
          placeholder="Describe your task"
          rows={4}
          className="mt-2 w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-transparent px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500"
        />
        {errors.description && (
          <p className="text-sm text-red-500 mt-1">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Priority */}
        <div>
          <label className="text-sm font-medium">Priority</label>
          <select
            {...register("priority")}
            className="mt-2 w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-transparent px-4 py-3 outline-none"
          >
            <option value="LOW" className="dark:bg-zinc-900">
              Low
            </option>
            <option value="MEDIUM" className="dark:bg-zinc-900">
              Medium
            </option>
            <option value="HIGH" className="dark:bg-zinc-900">
              High
            </option>
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="text-sm font-medium">Status</label>
          <select
            {...register("status")}
            className="mt-2 w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-transparent px-4 py-3 outline-none"
          >
            <option value="TODO" className="dark:bg-zinc-900">
              Todo
            </option>
            <option value="IN_PROGRESS" className="dark:bg-zinc-900">
              In Progress
            </option>
            <option value="COMPLETED" className="dark:bg-zinc-900">
              Completed
            </option>
          </select>
        </div>
      </div>

      {/* Date and Assigned To */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Due Date</label>
          <input
            type="date"
            {...register("dueDate")}
            className="mt-2 w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-transparent px-4 py-3 outline-none"
          />
          {errors.dueDate && (
            <p className="text-sm text-red-500 mt-1">
              {errors.dueDate.message}
            </p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium">Assign To</label>
          <select
            {...register("assignedTo")}
            className="mt-2 w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-transparent px-4 py-3 outline-none"
          >
            <option value="" className="dark:bg-zinc-900">
              Unassigned
            </option>
            {members.map((member) => (
              <option
                key={member._id}
                value={member._id}
                className="dark:bg-zinc-900"
              >
                {member.name} ({member.role})
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        disabled={loading}
        className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 py-3 text-white font-semibold flex items-center justify-center gap-2 hover:scale-[1.02] transition disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" size={18} />
            {isEdit ? "Updating..." : "Creating..."}
          </>
        ) : isEdit ? (
          "Update Task"
        ) : (
          "Create Task"
        )}
      </button>
    </form>
  );
}
