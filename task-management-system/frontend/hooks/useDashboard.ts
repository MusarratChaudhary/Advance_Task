"use client";

import { useEffect, useState } from "react";

import api from "@/lib/axios";

import { Task, Team } from "@/types";

export default function useDashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);

  const [teams, setTeams] = useState<Team[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const [tasksResponse, teamsResponse] = await Promise.all([
          api.get("/tasks"),

          api.get("/teams"),
        ]);

        setTasks(tasksResponse.data.tasks || []);

        setTeams(teamsResponse.data.teams || []);
      } catch (error) {
        console.log("Dashboard error", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  const stats = {
    total: tasks.length,

    pending: tasks.filter((task) => task.status === "TODO").length,

    completed: tasks.filter((task) => task.status === "COMPLETED").length,

    highPriority: tasks.filter((task) => task.priority === "HIGH").length,
  };

  return {
    tasks,

    teams,

    loading,

    stats,
  };
}
