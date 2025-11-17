import { Task } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Calendar } from "lucide-react";

interface TaskListViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

export function TaskListView({ tasks, onTaskClick }: TaskListViewProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-priority-high text-priority-high-foreground";
      case "medium":
        return "bg-priority-medium text-priority-medium-foreground";
      case "low":
        return "bg-priority-low text-priority-low-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "done":
        return "bg-status-done text-status-done-foreground";
      case "in-progress":
        return "bg-status-in-progress text-status-in-progress-foreground";
      case "todo":
        return "bg-status-todo text-status-todo-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "in-progress":
        return "In Progress";
      case "todo":
        return "To Do";
      case "done":
        return "Done";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-2">
      {tasks.map((task) => {
        const assignee = task.assignee;

        return (
          <div
            key={task.id}
            onClick={() => onTaskClick(task)}
            className="flex items-center gap-4 rounded-lg border bg-card p-4 transition-colors hover:bg-accent cursor-pointer"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium truncate">{task.title}</h3>
                <Badge className={getPriorityColor(task.priority)} variant="secondary">
                  {task.priority}
                </Badge>
                <Badge className={getStatusColor(task.status)} variant="secondary">
                  {getStatusLabel(task.status)}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground truncate">{task.description}</p>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(task.dueDate), "MMM d, yyyy")}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {assignee && (
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={assignee.avatar} alt={assignee.name} />
                    <AvatarFallback>
                      {assignee.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
              )}
            </div>
          </div>
        );
      })}
      {tasks.length === 0 && (
        <div className="flex items-center justify-center py-12 text-center">
          <p className="text-muted-foreground">No tasks found</p>
        </div>
      )}
    </div>
  );
}
