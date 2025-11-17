import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { NewProjectDialog } from "@/components/projects/NewProjectDialog";
import { Button } from "@/components/ui/button";
import { Plus, Grid, List } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { projectService } from "@/services/projectService";
import { Project } from "@/types";
import { useToast } from "@/hooks/use-toast";

export default function Projects() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [newProjectDialogOpen, setNewProjectDialogOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
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

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
                <p className="text-muted-foreground mt-1">
                  Manage and track all your projects in one place
                </p>
              </div>
              <Button onClick={() => setNewProjectDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Button>
            </div>

            {/* Search and View Controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
              <div className="flex gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Projects Display */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">Loading projects...</p>
              </div>
            ) : (
              <div className={viewMode === "grid" 
                ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3" 
                : "flex flex-col gap-4"
              }>
                {filteredProjects.length > 0 ? (
                  filteredProjects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))
                ) : (
                  <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-muted-foreground">
                      {projects.length === 0 ? "No projects yet" : "No projects found"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {projects.length === 0 
                        ? "Create your first project to get started" 
                        : "Try adjusting your search or create a new project"}
                    </p>
                    {projects.length === 0 && (
                      <Button onClick={() => setNewProjectDialogOpen(true)} className="mt-4">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Project
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Stats Summary */}
            {projects.length > 0 && (
              <div className="border-t pt-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-lg border bg-card p-4">
                    <p className="text-sm text-muted-foreground">Total Projects</p>
                    <p className="text-2xl font-bold">{projects.length}</p>
                  </div>
                  <div className="rounded-lg border bg-card p-4">
                    <p className="text-sm text-muted-foreground">Active Projects</p>
                    <p className="text-2xl font-bold">{projects.length}</p>
                  </div>
                  <div className="rounded-lg border bg-card p-4">
                    <p className="text-sm text-muted-foreground">Team Members</p>
                    <p className="text-2xl font-bold">
                      {new Set(projects.flatMap(p => p.members)).size}
                    </p>
                  </div>
                </div>
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
