"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import api from "@/lib/axios";
import { Team, Task } from "@/types";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, MoreHorizontal, ShieldAlert, ShieldCheck, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function TeamDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  
  const [team, setTeam] = useState<Team | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [teamRes, tasksRes] = await Promise.all([
          api.get(`/teams/${id}`),
          api.get("/tasks")
        ]);
        setTeam(teamRes.data.team);
        setTasks(tasksRes.data.tasks || []);
      } catch (err) {
        toast.error("Failed to load team details");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-6 w-32 mb-6" />
          <Skeleton className="h-20 w-1/3 mb-8" />
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-36 w-full rounded-2xl" />)}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!team) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-full min-h-[60vh]">
          <p className="text-muted-foreground text-lg">Team not found</p>
          <Link href="/dashboard/teams" className="mt-4 text-primary font-medium hover:underline">
            Go back to Teams
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const getRoleIcon = (role: string) => {
    switch(role) {
      case "ADMIN": return <ShieldAlert className="w-4 h-4 text-red-500" />;
      case "MANAGER": return <ShieldCheck className="w-4 h-4 text-blue-500" />;
      default: return <UserIcon className="w-4 h-4 text-zinc-500" />;
    }
  };
  
  // Deterministic "online" status based on user id so it's consistent across renders
  const isOnline = (userId: string) => {
    if (!userId) return false;
    const code = userId.charCodeAt(userId.length - 1);
    return code % 2 === 0;
  };

  const getAssignedTasksCount = (userId: string) => {
    return tasks.filter(t => t.assignedTo?._id === userId && t.status !== "COMPLETED").length;
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full space-y-8 max-w-7xl mx-auto">
        <div>
          <Link href="/dashboard/teams" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Teams
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{team.name}</h1>
              <p className="text-muted-foreground mt-1 text-sm max-w-xl">{team.description || "No description provided."}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center -space-x-3 mr-2">
                {team.members.slice(0, 5).map((m: any) => (
                  <div key={m._id} className="w-10 h-10 rounded-full border-2 border-background bg-primary/10 text-primary flex items-center justify-center text-sm font-bold z-10 shadow-sm relative">
                    {m.name ? m.name.charAt(0).toUpperCase() : "U"}
                  </div>
                ))}
                {team.members.length > 5 && (
                  <div className="w-10 h-10 rounded-full border-2 border-background bg-muted text-muted-foreground flex items-center justify-center text-xs font-bold z-0 relative">
                    +{team.members.length - 5}
                  </div>
                )}
              </div>
              <button className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:opacity-90 transition shadow-sm hover:shadow-md hover:-translate-y-0.5 transform">
                Add Member
              </button>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            Team Members 
            <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs">{team.members.length}</span>
          </h2>
          
          {team.members.length === 0 ? (
            <div className="p-12 text-center bg-card border border-border rounded-2xl border-dashed">
              <UserIcon className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground">No members yet</h3>
              <p className="text-muted-foreground mt-1 max-w-md mx-auto">This team is currently empty. Add members to start assigning tasks and collaborating.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {team.members.map((member: any, idx: number) => (
                <motion.div
                  key={member._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-card border border-border rounded-2xl p-5 hover:shadow-lg transition-all duration-300 relative overflow-hidden group hover:-translate-y-1"
                >
                  <button className="absolute top-4 right-4 p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground rounded-md opacity-0 group-hover:opacity-100 transition-all">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                  
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-bold text-xl shadow-sm border border-primary/20 group-hover:border-primary/40 transition-colors">
                        {member.name ? member.name.charAt(0).toUpperCase() : "U"}
                      </div>
                      {isOnline(member._id) ? (
                        <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-card rounded-full" title="Online" />
                      ) : (
                        <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-zinc-300 dark:bg-zinc-600 border-2 border-card rounded-full" title="Offline" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 pt-1">
                      <h3 className="font-bold truncate text-card-foreground text-base group-hover:text-primary transition-colors">{member.name}</h3>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{member.email}</p>
                      
                      <div className="flex items-center gap-1.5 mt-2.5 text-[11px] font-semibold bg-muted/50 inline-flex px-2 py-1 rounded-md">
                        {getRoleIcon(member.role)}
                        <span className="capitalize text-muted-foreground">{member.role?.toLowerCase() || 'member'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-border/50 flex items-center justify-between">
                    <div className="text-xs text-muted-foreground bg-background px-2.5 py-1 rounded-full border border-border/50 shadow-sm">
                      <span className="font-bold text-foreground">{getAssignedTasksCount(member._id)}</span> active tasks
                    </div>
                    <button className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors">
                      View Profile
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
