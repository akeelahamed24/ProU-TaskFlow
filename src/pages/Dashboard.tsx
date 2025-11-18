import { useState, useEffect, useRef } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { StatsWidget } from "@/components/dashboard/StatsWidget";
import { TaskChart } from "@/components/dashboard/TaskChart";
import { PerformanceMetrics } from "@/components/dashboard/PerformanceMetrics";
import { PredictiveAnalytics } from "@/components/dashboard/PredictiveAnalytics";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { projectService } from "@/services/projectService";
import { taskService } from "@/services/taskService";
import { Project, Task } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { NewProjectDialog } from "@/components/projects/NewProjectDialog";

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [newProjectDialogOpen, setNewProjectDialogOpen] = useState(false);
  const { user, appUser } = useAuth();
  const { toast } = useToast();
  const statsWidgetRef = useRef<any>(null);

  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const allProjects = await projectService.getAllProjects();
      setProjects(allProjects);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load projects",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTaskStatusChange = async (taskId: string, newStatus: Task["status"]) => {
    try {
      await taskService.updateTaskStatus(taskId, newStatus);

      // Update project task counts
      setProjects(prevProjects =>
        prevProjects.map(project => {
          // Find if this task belongs to this project
          // For now, we'll update all projects since we don't know which project the task belongs to
          // In a real implementation, you'd need to track which project the task belongs to
          return {
            ...project,
            tasksCount: {
              ...project.tasksCount,
              // This is a simplified update - in reality you'd need to know the old status
              // For now, we'll trigger a refresh of the stats widget
            }
          };
        })
      );

      // Trigger StatsWidget refresh
      if (statsWidgetRef.current?.refresh) {
        statsWidgetRef.current.refresh();
      }

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

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex w-full">
        <DashboardSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="flex-1 p-6 lg:p-8">
          <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground mt-1">
                  Welcome back! Here's an overview of your projects and tasks.
                </p>
              </div>
              <Button onClick={() => setNewProjectDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Button>
            </div>


            {/* Stats */}
            <StatsWidget ref={statsWidgetRef} />

            {/* Charts */}
            <TaskChart />

            {/* Projects Grid */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Your Projects</h2>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <p className="text-muted-foreground">Loading projects...</p>
                </div>
              ) : projects.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {projects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg bg-muted/10">
                  <p className="text-muted-foreground">No projects yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Create your first project to get started
                  </p>
                  <Button onClick={() => setNewProjectDialogOpen(true)} className="mt-4">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Project
                  </Button>
                </div>
              )}
            </div>

            {/* Activity Feed, Performance, and Analytics */}
            {projects.length > 0 && (
              <div className="grid gap-4 md:grid-cols-3">
                <div className="max-w-2xl">
                  <ActivityFeed />
                </div>
                <PerformanceMetrics />
                <PredictiveAnalytics />
              </div>
            )}
          </div>
        </main>
      </div>

      <NewProjectDialog
        open={newProjectDialogOpen}
        onOpenChange={setNewProjectDialogOpen}
        onProjectCreated={loadProjects}
      />
    </div>
  );
}
