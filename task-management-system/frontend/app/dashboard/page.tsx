"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsGrid from "@/components/dashboard/StatsGrid";
import RecentTasks from "@/components/dashboard/RecentTasks";
import TeamOverview from "@/components/dashboard/TeamOverview";
import useDashboard from "@/hooks/useDashboard";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { stats, tasks, teams, loading } = useDashboard();

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-6">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[1,2,3,4].map((i) => (
              <Skeleton key={i} className="h-32 w-full rounded-2xl" />
            ))}
          </div>
          
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 mt-6">
            <div className="xl:col-span-2 space-y-4">
              <Skeleton className="h-8 w-40 mb-6" />
              {[1,2,3].map((i) => (
                <Skeleton key={i} className="h-24 w-full rounded-xl" />
              ))}
            </div>
            <div className="space-y-4">
              <Skeleton className="h-8 w-32 mb-6" />
              {[1,2].map((i) => (
                <Skeleton key={i} className="h-24 w-full rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <DashboardHeader />
      <StatsGrid stats={stats} />
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        <div className="xl:col-span-2">
          <RecentTasks tasks={tasks} />
        </div>
        
        <TeamOverview teams={teams} />
      </div>
    </DashboardLayout>
  );
}
