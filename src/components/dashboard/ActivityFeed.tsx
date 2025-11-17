import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { activities, users, tasks, projects } from "@/data/mockData";
import { formatDistanceToNow } from "date-fns";

export function ActivityFeed() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity) => {
          const user = users.find((u) => u.id === activity.userId);
          const task = activity.taskId
            ? tasks.find((t) => t.id === activity.taskId)
            : null;
          const project = activity.projectId
            ? projects.find((p) => p.id === activity.projectId)
            : null;

          return (
            <div key={activity.id} className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback className="text-xs">
                  {user?.name.substring(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <p className="text-sm">
                  <span className="font-medium">{user?.name}</span>{" "}
                  <span className="text-muted-foreground">{activity.action}</span>{" "}
                  {task && (
                    <span className="font-medium">"{task.title}"</span>
                  )}
                </p>
                {project && (
                  <p className="text-xs text-muted-foreground">
                    in {project.name}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(activity.timestamp), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
