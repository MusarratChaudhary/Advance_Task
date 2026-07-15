"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Team } from "@/types";
import api from "@/lib/axios";
import { Plus, Search, Users } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import TeamCard from "@/components/teams/TeamCard";
import CreateTeamModal from "@/components/teams/CreateTeamModal";

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTeams = async () => {
    try {
      const res = await api.get("/teams");
      setTeams(res.data.teams || []);
    } catch (error) {
      toast.error("Failed to load teams");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full space-y-6 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Teams</h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">Manage departments and collaboration groups</p>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input 
                type="text" 
                placeholder="Search teams..." 
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-medium transition shadow-sm hover:shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Create Team</span>
            </motion.button>
          </div>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-600 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {teams.map((team, idx) => (
              <motion.div 
                key={team._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <TeamCard team={team} />
              </motion.div>
            ))}
            {teams.length === 0 && (
              <div className="col-span-full h-48 flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50 dark:bg-zinc-900/20">
                <Users className="w-10 h-10 text-zinc-300 dark:text-zinc-700 mb-3" />
                <p className="text-zinc-500 font-medium">No teams found</p>
                <p className="text-sm text-zinc-400 mt-1">Create a team to start collaborating</p>
              </div>
            )}
          </div>
        )}
      </div>

      <CreateTeamModal 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchTeams} 
      />
    </DashboardLayout>
  );
}
