"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CheckSquare,
  Kanban,
  Users,
  MessageCircle,
  Settings,
  Rocket,
  X,
} from "lucide-react";
import { motion } from "framer-motion";

const menu = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    disabled: false,
  },
  {
    name: "Tasks",
    icon: CheckSquare,
    href: "/dashboard/tasks",
    disabled: false,
  },
  {
    name: "Kanban",
    icon: Kanban,
    href: "/dashboard/kanban",
    disabled: false,
  },
  {
    name: "Teams",
    icon: Users,
    href: "/dashboard/teams",
    disabled: false,
  },
  {
    name: "Messages",
    icon: MessageCircle,
    href: "/dashboard/messages",
    disabled: true,
  },
  {
    name: "Settings",
    icon: Settings,
    href: "/dashboard/settings",
    disabled: true,
  },
];

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar - Fixed */}
      <motion.aside
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="hidden lg:flex w-72 h-screen flex-col border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-6 py-8"
      >
        <SidebarContent pathname={pathname} onClose={() => {}} />
      </motion.aside>

      {/* Mobile Sidebar - Drawer */}
      <motion.aside
        initial={{ x: -288 }}
        animate={{ x: sidebarOpen ? 0 : -288 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed top-0 left-0 z-50 w-72 h-screen flex-col border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-6 py-8 lg:hidden"
        style={{ display: "flex" }}
      >
        <SidebarContent
          pathname={pathname}
          onClose={() => setSidebarOpen(false)}
          isMobile
        />
      </motion.aside>
    </>
  );
}

function SidebarContent({
  pathname,
  onClose,
  isMobile = false,
}: {
  pathname: string;
  onClose: () => void;
  isMobile?: boolean;
}) {
  return (
    <>
      <div className="mb-10">
        <div className="flex items-center justify-between mb-2">
          <Link href="/dashboard" className="block" onClick={onClose}>
            <h1 className="text-2xl font-bold flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="flex items-center gap-2">
                <span className="text-purple-600">Task</span>
                <span className="text-zinc-900 dark:text-zinc-100">Pilot</span>
                <Rocket className="text-purple-600" size={20} />
              </div>
            </h1>
          </Link>
          {isMobile && (
            <button
              onClick={onClose}
              className="lg:hidden p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Smart Team Management
        </p>
      </div>

      <nav className="space-y-1 flex-1">
        {menu.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          const isDisabled = item.disabled;

          if (isDisabled) {
            return (
              <div
                key={item.name}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-400 dark:text-zinc-600 cursor-not-allowed opacity-60 select-none group"
              >
                <Icon size={18} />
                <span className="text-sm font-medium">{item.name}</span>
                <span className="ml-auto text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 px-2 py-1 rounded-full">
                  Soon
                </span>
              </div>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group
                ${
                  isActive
                    ? "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 shadow-sm border border-purple-200/50 dark:border-purple-800/50"
                    : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 hover:text-purple-600 dark:hover:text-purple-400"
                }
              `}
            >
              <Icon
                size={18}
                className={`${isActive ? "text-purple-600 dark:text-purple-400" : "group-hover:text-purple-600 dark:group-hover:text-purple-400"} transition-colors`}
              />
              <span>{item.name}</span>
              {isActive && (
                <div className="w-1.5 h-1.5 bg-purple-600 dark:bg-purple-400 rounded-full ml-auto"></div>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800">
        <div className="text-xs text-zinc-400 dark:text-zinc-500 mb-2">
          Version 1.0.0
        </div>
      </div>
    </>
  );
}
