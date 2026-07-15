"use client";

import React, { useState, useEffect } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import api from "@/lib/axios";
import { Task } from "@/types";
import { toast } from "sonner";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Clock } from "lucide-react";

type ColumnStatus = "TODO" | "IN_PROGRESS" | "COMPLETED";

const COLUMNS: { id: ColumnStatus; title: string; color: string }[] = [
  { id: "TODO", title: "To Do", color: "bg-slate-100 dark:bg-slate-800" },
  {
    id: "IN_PROGRESS",
    title: "In Progress",
    color: "bg-blue-50 dark:bg-blue-900/20",
  },
  {
    id: "COMPLETED",
    title: "Completed",
    color: "bg-green-50 dark:bg-green-900/20",
  },
];

export default function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBrowser, setIsBrowser] = useState(false);

  useEffect(() => {
    setIsBrowser(true);
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await api.get("/tasks");
      setTasks(res.data.tasks || []);
    } catch (error) {
      toast.error("Failed to load tasks");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId: string, status: ColumnStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status });
      toast.success("Task updated");
    } catch (error) {
      toast.error("Failed to update task");
      // Revert on error
      fetchTasks();
    }
  };

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    const sourceStatus = source.droppableId as ColumnStatus;
    const destStatus = destination.droppableId as ColumnStatus;

    // Optimistically update UI
    const newTasks = Array.from(tasks);
    const taskIndex = newTasks.findIndex((t) => t._id === draggableId);
    if (taskIndex > -1) {
      newTasks[taskIndex].status = destStatus;
      setTasks(newTasks);
    }

    // Call API if column changed
    if (sourceStatus !== destStatus) {
      updateTaskStatus(draggableId, destStatus);
    }
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "destructive";
      case "MEDIUM":
        return "default";
      case "LOW":
        return "secondary";
      default:
        return "outline";
    }
  };

  if (!isBrowser) return null; // Avoid SSR hydration mismatch with dnd

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-full pb-10 overflow-x-auto">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex flex-col md:flex-row gap-6 h-full min-w-[768px]">
          {COLUMNS.map((column) => (
            <div key={column.id} className="flex flex-col flex-1 min-w-[280px]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">{column.title}</h3>
                <Badge variant="outline" className="bg-background">
                  {tasks.filter((t) => t.status === column.id).length}
                </Badge>
              </div>

              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`flex-1 rounded-xl p-4 min-h-[500px] transition-colors duration-200 ${column.color} ${snapshot.isDraggingOver ? "ring-2 ring-primary/50 bg-primary/5" : ""}`}
                  >
                    {tasks
                      .filter((t) => t.status === column.id)
                      .map((task, index) => (
                        <Draggable
                          key={task._id}
                          draggableId={task._id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`mb-4 focus:outline-none`}
                              style={{
                                ...provided.draggableProps.style,
                                // Apply smooth transform during drag
                                ...(snapshot.isDragging && {
                                  transform: `${provided.draggableProps.style?.transform} scale(1.05)`,
                                  boxShadow:
                                    "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
                                  opacity: 0.9,
                                  zIndex: 50,
                                }),
                              }}
                            >
                              <Card
                                className={`shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing border-slate-200 dark:border-slate-700 bg-card ${snapshot.isDragging ? "ring-2 ring-primary" : ""}`}
                              >
                                <CardHeader className="p-4 pb-2">
                                  <div className="flex justify-between items-start mb-2">
                                    <Badge
                                      variant={
                                        getPriorityVariant(task.priority) as any
                                      }
                                      className="text-[10px] py-0 h-5"
                                    >
                                      {task.priority}
                                    </Badge>
                                    {task.dueDate && (
                                      <div className="flex items-center text-xs text-muted-foreground">
                                        <Clock className="w-3 h-3 mr-1" />
                                        {new Date(
                                          task.dueDate,
                                        ).toLocaleDateString()}
                                      </div>
                                    )}
                                  </div>
                                  <CardTitle className="text-sm font-semibold leading-tight">
                                    {task.title}
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 pt-0 pb-2">
                                  <p className="text-xs text-muted-foreground line-clamp-2">
                                    {task.description || "No description"}
                                  </p>
                                </CardContent>
                                <CardFooter className="p-4 pt-2 flex items-center justify-between text-xs text-muted-foreground border-t bg-muted/20">
                                  {task.assignedTo ? (
                                    <div className="flex items-center">
                                      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center mr-2">
                                        <User className="w-3 h-3 text-primary" />
                                      </div>
                                      <span className="truncate max-w-[100px] font-medium">
                                        {task.assignedTo.name}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="italic">Unassigned</span>
                                  )}
                                </CardFooter>
                              </Card>
                            </div>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
