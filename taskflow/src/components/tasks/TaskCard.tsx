import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Task } from "@/types";
import { Calendar, MessageSquare, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
}

const priorityColors = {
  low: "bg-priority-low/10 text-priority-low border-priority-low/20",
  medium: "bg-priority-medium/10 text-priority-medium border-priority-medium/20",
  high: "bg-priority-high/10 text-priority-high border-priority-high/20",
};

const statusColors = {
  todo: "bg-status-todo/10 text-status-todo border-status-todo/20",
  "in-progress": "bg-status-in-progress/10 text-status-in-progress border-status-in-progress/20",
  done: "bg-status-done/10 text-status-done border-status-done/20",
};

export function TaskCard({ task, onClick }: TaskCardProps) {
  const assignee = task.assignee;
  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== "done";
  
  const completedSubtasks = task.subtasks?.filter((st) => st.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;

  return (
    <Card 
      className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50"
      onClick={onClick}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-sm flex-1 line-clamp-2">{task.title}</h3>
          <Badge
            variant="outline"
            className={cn("text-xs", priorityColors[task.priority])}
          >
            {task.priority}
          </Badge>
        </div>

        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        )}

        {totalSubtasks > 0 && (
          <div className="flex items-center gap-2 text-xs">
            <div className="flex-1 bg-muted rounded-full h-1.5">
              <div
                className="bg-primary h-full rounded-full transition-all"
                style={{ width: `${(completedSubtasks / totalSubtasks) * 100}%` }}
              />
            </div>
            <span className="text-muted-foreground">
              {completedSubtasks}/{totalSubtasks}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div
              className={cn(
                "flex items-center gap-1",
                isOverdue && "text-priority-high"
              )}
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>{new Date(task.dueDate).toLocaleDateString()}</span>
            </div>

            {task.comments && task.comments.length > 0 && (
              <div className="flex items-center gap-1">
                <MessageSquare className="h-3.5 w-3.5" />
                <span>{task.comments.length}</span>
              </div>
            )}

            {task.attachments && task.attachments > 0 && (
              <div className="flex items-center gap-1">
                <Paperclip className="h-3.5 w-3.5" />
                <span>{task.attachments}</span>
              </div>
            )}
          </div>

          <Avatar className="h-6 w-6">
            <AvatarImage src={assignee?.avatar} alt={assignee?.name} />
            <AvatarFallback className="text-xs">
              {assignee?.name.substring(0, 2)}
            </AvatarFallback>
          </Avatar>
        </div>

        <Badge variant="outline" className={cn("text-xs", statusColors[task.status])}>
          {task.status.replace("_", " ")}
        </Badge>
      </CardContent>
    </Card>
  );
}
