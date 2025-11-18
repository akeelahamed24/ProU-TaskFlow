import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { taskService } from "@/services/taskService";
import { projectService } from "@/services/projectService";
import { Task, Project } from "@/types";
import { formatDistanceToNow } from "date-fns";

interface ActivityItem {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  action: string;
  taskTitle?: string;
  projectName?: string;
  timestamp: string;
}

export function ActivityFeed() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      generateActivities();
    }
  }, [user]);

  const generateActivities = async () => {
    try {
      setLoading(true);
      const [tasks, projects] = await Promise.all([
        taskService.getAllTasks(),
        projectService.getAllProjects()
      ]);

      // Generate activities from recent tasks and projects
      const activityItems: ActivityItem[] = [];

      // Activities from tasks
      tasks.slice(0, 5).forEach((task: Task) => {
        const project = projects.find((p: Project) => p.id === task.projectId);
        activityItems.push({
          id: `task-${task.id}`,
          userId: user!.uid,
          userName: user!.displayName || user!.email || "User",
          userAvatar: user!.photoURL,
          action: task.status === "done" ? "completed task" : task.status === "in-progress" ? "started working on" : "created task",
          taskTitle: task.title,
          projectName: project?.name,
          timestamp: task.createdAt || new Date().toISOString()
        });
      });

      // Activities from projects
      projects.slice(0, 3).forEach((project: Project) => {
        activityItems.push({
          id: `project-${project.id}`,
          userId: user!.uid,
          userName: user!.displayName || user!.email || "User",
          userAvatar: user!.photoURL,
          action: "created project",
          projectName: project.name,
          timestamp: project.createdAt
        });
      });

      // Sort by timestamp descending
      activityItems.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setActivities(activityItems.slice(0, 8)); // Show latest 8 activities
    } catch (error) {
      console.error("Failed to generate activities:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex gap-3">
              <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
              <div className="flex-1 space-y-1">
                <div className="h-4 bg-muted rounded animate-pulse" />
                <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.length > 0 ? activities.map((activity) => (
          <div key={activity.id} className="flex gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={activity.userAvatar} alt={activity.userName} />
              <AvatarFallback className="text-xs">
                {activity.userName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <p className="text-sm">
                <span className="font-medium">{activity.userName}</span>{" "}
                <span className="text-muted-foreground">{activity.action}</span>{" "}
                {activity.taskTitle && (
                  <span className="font-medium">"{activity.taskTitle}"</span>
                )}
              </p>
              {activity.projectName && (
                <p className="text-xs text-muted-foreground">
                  in {activity.projectName}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(activity.timestamp), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>
        )) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No recent activities
          </p>
        )}
      </CardContent>
    </Card>
  );
}
