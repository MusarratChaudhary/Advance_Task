import KanbanBoard from "@/components/tasks/KanbanBoard";

export const metadata = {
  title: "Kanban Board - Task Management",
  description: "Manage your tasks effectively with our dynamic Kanban Board.",
};

export default function KanbanPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 h-[calc(100vh-4rem)] overflow-hidden flex flex-col">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Kanban Board</h2>
      </div>
      <div className="flex-1 min-h-0 overflow-hidden">
        <KanbanBoard />
      </div>
    </div>
  );
}
