import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Task } from "@/types";
import { Calendar, MessageSquare, Paperclip, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
  onStatusChange?: (taskId: string, newStatus: Task["status"]) => void;
  showStatusDropdown?: boolean;
}

const priorityColors = {
  low: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
  medium: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800",
  high: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
};

const statusColors = {
  todo: "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-300 dark:border-gray-800",
  "in-progress": "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
  done: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800",
};

const statusLabels = {
  todo: "To Do",
  "in-progress": "In Progress",
  done: "Done",
};

// Enhanced helper function to safely get assignee display info
const getAssigneeInfo = (assignee?: Task["assignee"]) => {
  if (!assignee || !assignee.id) {
    return {
      name: "Unassigned",
      avatar: "",
      initials: "UN",
    };
  }

  const name = assignee.name?.trim() || "Unknown";
  const avatar = assignee.avatar || "";
  const initials = name !== "Unknown" ? name.substring(0, 2).toUpperCase() : "UK";

  return {
    name,
    avatar,
    initials,
  };
};

// Helper function to format date safely
const formatDueDate = (dueDate?: string) => {
  if (!dueDate) return "No due date";
  try {
    const date = new Date(dueDate);
    if (isNaN(date.getTime())) return "Invalid date";
    return date.toLocaleDateString();
  } catch {
    return "Invalid date";
  }
};

export const TaskCard = React.memo(function TaskCard({
  task,
  onClick,
  onStatusChange,
  showStatusDropdown = true
}: TaskCardProps) {
  const assigneeInfo = getAssigneeInfo(task.assignee);
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "done";

  const completedSubtasks = task.subtasks?.filter((st) => st.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;
  const progressPercentage = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  const handleStatusChange = (newStatus: Task["status"]) => {
    if (onStatusChange) {
      onStatusChange(task.id, newStatus);
    }
  };

  return (
    <Card
      className="group cursor-pointer border border-border/50 bg-card hover:border-primary/40 hover:shadow-sm"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header with title and priority */}
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-semibold text-sm leading-tight flex-1 min-w-0 break-words group-hover:text-primary">
              {task.title}
            </h3>
            <Badge
              variant="outline"
              className={cn(
                "text-xs font-medium shrink-0",
                priorityColors[task.priority]
              )}
            >
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </Badge>
          </div>

          {/* Description */}
          {task.description && (
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Subtasks progress */}
          {totalSubtasks > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-muted/50 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground font-medium">
                {completedSubtasks}/{totalSubtasks}
              </span>
            </div>
          )}

          {/* Footer with metadata and assignee */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {/* Due date */}
              <div
                className={cn(
                  "flex items-center gap-1.5",
                  isOverdue && "text-red-600 dark:text-red-400"
                )}
              >
                <Calendar className="h-3.5 w-3.5" />
                <span className="font-medium">{formatDueDate(task.dueDate)}</span>
              </div>

              {/* Comments count */}
              {task.comments && task.comments.length > 0 && (
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span className="font-medium">{task.comments.length}</span>
                </div>
              )}

              {/* Attachments count */}
              {task.attachments && task.attachments > 0 && (
                <div className="flex items-center gap-1">
                  <Paperclip className="h-3.5 w-3.5" />
                  <span className="font-medium">{task.attachments}</span>
                </div>
              )}
            </div>

            {/* Assignee avatar */}
            <Avatar className="h-7 w-7 ring-1 ring-border/20 group-hover:ring-primary/30">
              <AvatarImage
                src={assigneeInfo.avatar}
                alt={assigneeInfo.name}
                className="object-cover"
              />
              <AvatarFallback className="text-xs font-semibold bg-muted">
                {assigneeInfo.initials}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Status dropdown or badge */}
          <div className="pt-2 border-t border-border/30">
            {showStatusDropdown && onStatusChange ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs cursor-pointer hover:bg-accent/50",
                      statusColors[task.status]
                    )}
                  >
                    {statusLabels[task.status]}
                    <ChevronDown className="ml-1 h-3 w-3 opacity-60" />
                  </Badge>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange("todo");
                    }}
                    disabled={task.status === "todo"}
                    className="flex items-center gap-2"
                  >
                    <div className="w-2 h-2 rounded-full bg-gray-400" />
                    <span>To Do</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange("in-progress");
                    }}
                    disabled={task.status === "in-progress"}
                    className="flex items-center gap-2"
                  >
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span>In Progress</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange("done");
                    }}
                    disabled={task.status === "done"}
                    className="flex items-center gap-2"
                  >
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span>Done</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Badge
                variant="outline"
                className={cn("text-xs", statusColors[task.status])}
              >
                {statusLabels[task.status]}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
