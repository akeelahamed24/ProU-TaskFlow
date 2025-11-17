import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { KanbanBoard } from "@/components/tasks/KanbanBoard";
import { TaskModal } from "@/components/tasks/TaskModal";
import { NewTaskDialog } from "@/components/tasks/NewTaskDialog";
import { TaskListView } from "@/components/tasks/TaskListView";
import { TaskCalendarView } from "@/components/tasks/TaskCalendarView";
import { Button } from "@/components/ui/button";
import { Plus, List, Calendar, LayoutGrid } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { taskService } from "@/services/taskService";
import { Task } from "@/types";
import { useToast } from "@/hooks/use-toast";

export default function Project() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [newTaskDialogOpen, setNewTaskDialogOpen] = useState(false);
  const [view, setView] = useState<"kanban" | "list" | "calendar">("kanban");
  const [projectTasks, setProjectTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id && user) {
      loadTasks();
    }
  }, [id, user]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const tasks = await taskService.getTasks(id!);
      setProjectTasks(tasks);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load tasks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTaskStatusChange = async (taskId: string, newStatus: Task["status"]) => {
    try {
      await taskService.updateTaskStatus(taskId, newStatus);
      setProjectTasks((prev) =>
        prev.map((task) =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );
      toast({
        title: "Task updated",
        description: "Task status has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading project...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex w-full">
        <DashboardSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="flex-1 p-6 lg:p-8">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary" />
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">
                    Project
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Manage your tasks
                  </p>
                </div>
              </div>
              <Button onClick={() => setNewTaskDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New Task
              </Button>
            </div>

            {/* View Selector */}
            <div className="flex items-center justify-between">
              <Tabs value={view} onValueChange={(v) => setView(v as any)}>
                <TabsList>
                  <TabsTrigger value="kanban" className="gap-2">
                    <LayoutGrid className="h-4 w-4" />
                    Kanban
                  </TabsTrigger>
                  <TabsTrigger value="list" className="gap-2">
                    <List className="h-4 w-4" />
                    List
                  </TabsTrigger>
                  <TabsTrigger value="calendar" className="gap-2">
                    <Calendar className="h-4 w-4" />
                    Calendar
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Content */}
            {view === "kanban" && (
              <KanbanBoard
                tasks={projectTasks}
                onTaskClick={setSelectedTask}
                onTaskStatusChange={handleTaskStatusChange}
              />
            )}

            {view === "list" && (
              <TaskListView
                tasks={projectTasks}
                onTaskClick={setSelectedTask}
              />
            )}

            {view === "calendar" && (
              <TaskCalendarView
                tasks={projectTasks}
                onTaskClick={setSelectedTask}
              />
            )}
          </div>
        </main>
      </div>

      <TaskModal
        task={selectedTask}
        open={!!selectedTask}
        onOpenChange={(open) => !open && setSelectedTask(null)}
      />

      <NewTaskDialog
        open={newTaskDialogOpen}
        onOpenChange={setNewTaskDialogOpen}
        projectId={id}
        onTaskCreated={loadTasks}
      />
    </div>
  );
}
