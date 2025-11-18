import React, { useState } from "react";
import { Task } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Calendar, ChevronDown, GripVertical } from "lucide-react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

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

interface TaskListViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onTaskStatusChange?: (taskId: string, newStatus: Task["status"]) => void;
}

function SortableTaskItem({
  task,
  onClick,
  onStatusChange
}: {
  task: Task;
  onClick: () => void;
  onStatusChange?: (taskId: string, newStatus: Task["status"]) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const assigneeInfo = getAssigneeInfo(task.assignee);
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "done";

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
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      role="button"
      tabIndex={0}
      aria-label={`Task: ${task.title}. Drag to reorder.`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div
        onClick={onClick}
        className="group flex items-center gap-4 rounded-lg border border-border/50 bg-card p-4 hover:border-primary/40 hover:shadow-sm cursor-pointer"
      >
        <div className="cursor-grab active:cursor-grabbing">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium truncate group-hover:text-primary">{task.title}</h3>
            <Badge className={getPriorityColor(task.priority)} variant="secondary">
              {task.priority}
            </Badge>
            {onStatusChange ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Badge className={`${getStatusColor(task.status)} cursor-pointer`} variant="secondary">
                    {getStatusLabel(task.status)}
                    <ChevronDown className="ml-1 h-3 w-3" />
                  </Badge>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onStatusChange(task.id, "todo");
                    }}
                    disabled={task.status === "todo"}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-status-todo" />
                      To Do
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onStatusChange(task.id, "in-progress");
                    }}
                    disabled={task.status === "in-progress"}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-status-in-progress" />
                      In Progress
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onStatusChange(task.id, "done");
                    }}
                    disabled={task.status === "done"}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-status-done" />
                      Done
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Badge className={getStatusColor(task.status)} variant="secondary">
                {getStatusLabel(task.status)}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground truncate">{task.description}</p>
          <div className="flex items-center gap-4 mt-2">
            <div
              className={cn(
                "flex items-center gap-1 text-xs",
                isOverdue ? "text-red-600 dark:text-red-400" : "text-muted-foreground"
              )}
            >
              <Calendar className="h-3 w-3" />
              <span className="font-medium">{formatDueDate(task.dueDate)}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8 ring-1 ring-border/20">
            <AvatarImage src={assigneeInfo.avatar} alt={assigneeInfo.name} className="object-cover" />
            <AvatarFallback className="text-xs font-semibold bg-muted">
              {assigneeInfo.initials}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  );
}

export function TaskListView({ tasks, onTaskClick, onTaskStatusChange }: TaskListViewProps) {
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

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [optimisticTasks, setOptimisticTasks] = useState<Task[]>(tasks);
  const [pendingUpdates, setPendingUpdates] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  // Sync optimistic tasks with props
  React.useEffect(() => {
    setOptimisticTasks(tasks);
  }, [tasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Handle task status change with optimistic updates
  const handleTaskStatusChange = React.useCallback(async (taskId: string, newStatus: Task["status"]) => {
    const originalTask = optimisticTasks.find(t => t.id === taskId);
    if (!originalTask || originalTask.status === newStatus) return;

    // Optimistic update
    setOptimisticTasks(prev => prev.map(task =>
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
    setPendingUpdates(prev => new Set(prev).add(taskId));

    try {
      if (onTaskStatusChange) {
        await onTaskStatusChange(taskId, newStatus);
      }
      toast({
        title: "Task updated",
        description: `Task moved to ${newStatus.replace('_', ' ')}`,
      });
    } catch (error) {
      // Revert optimistic update on error
      setOptimisticTasks(prev => prev.map(task =>
        task.id === taskId ? { ...task, status: originalTask.status } : task
      ));
      toast({
        title: "Error",
        description: "Failed to update task status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setPendingUpdates(prev => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
    }
  }, [optimisticTasks, onTaskStatusChange, toast]);

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    // For now, drag-and-drop in list view is just for reordering within the same status
    // Could be extended to move between status groups in the future
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={optimisticTasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {optimisticTasks.map((task) => (
            <SortableTaskItem
              key={task.id}
              task={task}
              onClick={() => onTaskClick(task)}
              onStatusChange={handleTaskStatusChange}
            />
          ))}
          {optimisticTasks.length === 0 && (
            <div className="flex items-center justify-center py-12 text-center">
              <p className="text-muted-foreground">No tasks found</p>
            </div>
          )}
        </div>
      </SortableContext>

      <DragOverlay>
        {activeTask && (
          <div className="flex items-center gap-4 rounded-lg border bg-card p-4 shadow-lg">
            <div className="cursor-grabbing">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium truncate">{activeTask.title}</h3>
                <Badge className={getPriorityColor(activeTask.priority)} variant="secondary">
                  {activeTask.priority}
                </Badge>
                <Badge className={getStatusColor(activeTask.status)} variant="secondary">
                  {getStatusLabel(activeTask.status)}
                </Badge>
              </div>
            </div>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
