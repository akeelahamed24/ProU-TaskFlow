import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { StatsWidget } from "@/components/dashboard/StatsWidget";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { projectService } from "@/services/projectService";
import { Project } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { NewProjectDialog } from "@/components/projects/NewProjectDialog";

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [newProjectDialogOpen, setNewProjectDialogOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const userProjects = await projectService.getProjects(user!.uid);
      setProjects(userProjects);
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
            <StatsWidget />

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

            {/* Activity Feed */}
            {projects.length > 0 && (
              <div className="max-w-2xl">
                <ActivityFeed />
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
