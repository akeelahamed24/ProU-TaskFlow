import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { teamService } from "@/services/teamService";
import { taskService } from "@/services/taskService";
import { useAuth } from "@/contexts/AuthContext";
import { TeamMember } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Mail, FolderKanban, CheckCircle2, Clock, Loader2 } from "lucide-react";

interface UserWithStats extends TeamMember {
  taskStats: {
    total: number;
    completed: number;
    inProgress: number;
  };
}

export default function Team() {
  const { user: currentUser } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeamData = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        
        // Fetch all team members to get users who exist in the system
        const teamMembers = await teamService.getTeamMembers([]);
        
        // Calculate task stats for each team member
        const usersWithStats = await Promise.all(
          teamMembers.map(async (member) => {
            let totalTasks = 0;
            let completedTasks = 0;
            let inProgressTasks = 0;
            
            // Get tasks for each project the user is part of
            for (const projectId of member.projectIds) {
              try {
                const tasks = await taskService.getTasks(projectId);
                const userTasks = tasks.filter(task => task.assigneeId === member.id);
                
                totalTasks += userTasks.length;
                completedTasks += userTasks.filter(t => t.status === "done").length;
                inProgressTasks += userTasks.filter(t => t.status === "in-progress").length;
              } catch (error) {
                console.warn(`Failed to fetch tasks for project ${projectId}:`, error);
              }
            }
            
            return {
              ...member,
              taskStats: {
                total: totalTasks,
                completed: completedTasks,
                inProgress: inProgressTasks
              }
            };
          })
        );
        
        setUsers(usersWithStats);
      } catch (err) {
        console.error('Error fetching team data:', err);
        setError('Failed to load team data');
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, [currentUser]);

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const roleColors: Record<string, string> = {
    "admin": "bg-red-500/10 text-red-700 dark:text-red-400",
    "manager": "bg-purple-500/10 text-purple-700 dark:text-purple-400",
    "member": "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <div className="flex w-full">
          <DashboardSidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
          <main className="flex-1 p-6 lg:p-8 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading team data...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <div className="flex w-full">
          <DashboardSidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
          <main className="flex-1 p-6 lg:p-8 flex items-center justify-center">
            <div className="text-center">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Calculate overall stats
  const totalProjects = [...new Set(users.flatMap(u => u.projectIds))].length;
  const totalCompletedTasks = users.reduce((sum, user) => sum + user.taskStats.completed, 0);
  const totalInProgressTasks = users.reduce((sum, user) => sum + user.taskStats.inProgress, 0);

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
                <h1 className="text-3xl font-bold tracking-tight">Team</h1>
                <p className="text-muted-foreground mt-1">
                  Manage your team members and their assignments
                </p>
              </div>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Member
              </Button>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Members
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{users.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Active Projects
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalProjects}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Tasks Completed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalCompletedTasks}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    In Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalInProgressTasks}</div>
                </CardContent>
              </Card>
            </div>

            {/* Search */}
            <div className="flex items-center gap-4">
              <Input
                placeholder="Search team members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>

            {/* Team Members Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => {
                  return (
                    <Card key={user.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start gap-4">
                          <Avatar className="h-16 w-16">
                            <AvatarFallback className="text-lg">
                              {getInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h3 className="font-semibold text-lg">{user.name}</h3>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                  <Mail className="h-3.5 w-3.5" />
                                  {user.email}
                                </div>
                              </div>
                              <Badge
                                variant="outline"
                                className={roleColors[user.role] || ""}
                              >
                                {user.role}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {/* Task Statistics */}
                        <div className="grid grid-cols-3 gap-3 p-3 rounded-lg bg-muted/50">
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground">Total</p>
                            <p className="text-lg font-semibold">{user.taskStats.total}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground">Completed</p>
                            <p className="text-lg font-semibold text-green-600">
                              {user.taskStats.completed}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground">Active</p>
                            <p className="text-lg font-semibold text-blue-600">
                              {user.taskStats.inProgress}
                            </p>
                          </div>
                        </div>

                        {/* Projects */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <FolderKanban className="h-4 w-4" />
                            <span>Projects ({user.projectIds.length})</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {user.projectIds.length > 0 ? (
                              user.projectIds.map((projectId) => (
                                <div
                                  key={projectId}
                                  className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-border bg-card hover:bg-accent/50 transition-colors"
                                >
                                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                                  <span className="text-sm">Project {projectId.slice(0, 8)}...</span>
                                </div>
                              ))
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                No projects assigned
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Recent Activity Indicator */}
                        <div className="flex items-center justify-between pt-2 border-t">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {user.taskStats.inProgress > 0 ? (
                              <>
                                <Clock className="h-3.5 w-3.5 text-blue-600" />
                                <span>Working on {user.taskStats.inProgress} task(s)</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                                <span>All tasks completed</span>
                              </>
                            )}
                          </div>
                          <Button variant="ghost" size="sm">
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-muted-foreground">No team members found</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Try adjusting your search or add new members
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
