"use client";

import { ClipboardList, Clock3, CheckCircle2, Flame } from "lucide-react";
import StatsCard from "./StatsCard";

interface Props {
  stats: {
    total: number;
    pending: number;
    completed: number;
    highPriority: number;
  };
}

export default function StatsGrid({ stats }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-10">
      <StatsCard
        title="Total Tasks"
        value={stats.total}
        icon={<ClipboardList />}
        gradient="bg-purple-500"
      />

      <StatsCard
        title="Pending"
        value={stats.pending}
        icon={<Clock3 />}
        gradient="bg-orange-400"
      />

      <StatsCard
        title="Completed"
        value={stats.completed}
        icon={<CheckCircle2 />}
        gradient="bg-green-400"
      />

      <StatsCard
        title="High Priority"
        value={stats.highPriority}
        icon={<Flame />}
        gradient="bg-red-400"
      />
    </div>
  );
}
