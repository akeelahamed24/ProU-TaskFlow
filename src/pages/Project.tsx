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
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Plus, List, Calendar, LayoutGrid, CheckCircle, Clock, Circle } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { taskService } from "@/services/taskService";
import { projectService } from "@/services/projectService";
import { Task } from "@/types";
import type { Project } from "@/types";
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
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id && user) {
      loadProjectData();
    }
  }, [id, user]);

  const loadProjectData = async () => {
    try {
      setLoading(true);
      // Load both project info and tasks in parallel
      const [tasks, projects] = await Promise.all([
        taskService.getTasks(id!),
        projectService.getAllProjects()
      ]);

      setProjectTasks(tasks);

      // Find the current project
      const project = projects.find(p => p.id === id);
      setCurrentProject(project || null);

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load project data",
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

  // Calculate task counts and progress
  const taskCounts = {
    todo: projectTasks.filter(task => task.status === "todo").length,
    inProgress: projectTasks.filter(task => task.status === "in-progress").length,
    done: projectTasks.filter(task => task.status === "done").length,
  };

  const totalTasks = projectTasks.length;
  const completedTasks = taskCounts.done;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  console.log('Project Progress Debug:', {
    totalTasks,
    completedTasks,
    progressPercentage,
    taskCounts
  });

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
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary" />
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                      {currentProject?.name || "Project"}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                      {currentProject?.description || "Manage your tasks"}
                    </p>
                  </div>
                </div>
                <Button onClick={() => setNewTaskDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Task
                </Button>
              </div>

              {/* Progress and Task Counts */}
              <div className="bg-card rounded-lg border p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div>
                      <h3 className="font-semibold">Project Progress</h3>
                      <p className="text-sm text-muted-foreground">
                        {completedTasks} of {totalTasks} tasks completed
                      </p>
                    </div>
                    <div className="text-2xl font-bold text-primary">
                      {progressPercentage}% <span className="text-xs text-muted-foreground">(Debug: {totalTasks} total, {completedTasks} done)</span>
                    </div>
                  </div>
                </div>

                <Progress value={progressPercentage} className="w-full h-4 border border-primary/20 rounded-full" />

                <div className="flex items-center gap-4">
                  <Badge variant="outline" className="flex items-center gap-2">
                    <Circle className="h-3 w-3 text-blue-500" />
                    <span className="text-xs">To Do: {taskCounts.todo}</span>
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-2">
                    <Clock className="h-3 w-3 text-yellow-500" />
                    <span className="text-xs">In Progress: {taskCounts.inProgress}</span>
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span className="text-xs">Done: {taskCounts.done}</span>
                  </Badge>
                </div>
              </div>
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
                onTaskStatusChange={handleTaskStatusChange}
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
        onTaskCreated={loadProjectData}
      />
    </div>
  );
}
