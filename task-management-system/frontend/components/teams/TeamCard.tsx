import { Team } from "@/types";
import { motion } from "framer-motion";
import { Users, MoreVertical } from "lucide-react";
import Link from "next/link";

interface TeamCardProps {
  team: Team;
}

export default function TeamCard({ team }: TeamCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500/10 to-transparent dark:from-purple-500/5 rounded-bl-full -z-10" />

      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
          <Users className="w-6 h-6" />
        </div>
        <button className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition opacity-0 group-hover:opacity-100">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
        {team.name}
      </h3>

      <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 min-h-[40px]">
        {team.description || "No description provided."}
      </p>

      <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
        <div className="flex -space-x-2">
          {team.members?.slice(0, 4).map((member: any, i) => (
            <div
              key={member._id || i}
              title={`${member.name || "Unknown"} - ${member.role || "Member"}`}
              className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 border-2 border-white dark:border-zinc-900 flex items-center justify-center text-xs font-semibold text-zinc-600 dark:text-zinc-300 cursor-help"
            >
              {member.name ? member.name.charAt(0).toUpperCase() : "U"}
            </div>
          ))}
          {(team.members?.length || 0) > 4 && (
            <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 border-2 border-white dark:border-zinc-900 flex items-center justify-center text-xs font-medium text-zinc-600 dark:text-zinc-400">
              +{(team.members?.length || 0) - 4}
            </div>
          )}
          {(!team.members || team.members.length === 0) && (
            <span className="text-xs text-zinc-400">No members</span>
          )}
        </div>
        <Link
          href={`/dashboard/teams/${team._id}`}
          className="text-xs font-medium text-purple-600 dark:text-purple-400 hover:underline"
        >
          View details
        </Link>
      </div>
    </motion.div>
  );
}
