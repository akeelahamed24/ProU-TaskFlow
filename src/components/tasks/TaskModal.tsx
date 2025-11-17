import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Task } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calendar, Paperclip, MessageSquare, CheckSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskModalProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

export function TaskModal({ task, open, onOpenChange }: TaskModalProps) {
  if (!task) return null;

  const assignee = task.assignee;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <DialogTitle className="text-xl">{task.title}</DialogTitle>
            <div className="flex gap-2">
              <Badge
                variant="outline"
                className={cn("text-xs", priorityColors[task.priority])}
              >
                {task.priority}
              </Badge>
              <Badge
                variant="outline"
                className={cn("text-xs", statusColors[task.status])}
              >
                {task.status.replace("_", " ")}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Description */}
          <div>
            <h3 className="text-sm font-semibold mb-2">Description</h3>
            <p className="text-sm text-muted-foreground">{task.description}</p>
          </div>

          <Separator />

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Due Date
              </h3>
              <p className="text-sm text-muted-foreground">
                {new Date(task.dueDate).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2">Assignee</h3>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={assignee?.avatar} alt={assignee?.name} />
                  <AvatarFallback className="text-xs">
                    {assignee?.name.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{assignee?.name}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Subtasks */}
          {task.subtasks && task.subtasks.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <CheckSquare className="h-4 w-4" />
                  Subtasks
                  <span className="text-muted-foreground font-normal">
                    ({task.subtasks.filter((st) => st.completed).length}/
                    {task.subtasks.length})
                  </span>
                </h3>
                <div className="space-y-2">
                  {task.subtasks.map((subtask) => (
                    <div key={subtask.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={subtask.completed}
                        readOnly
                        className="h-4 w-4 rounded border-border"
                      />
                      <span
                        className={cn(
                          "text-sm",
                          subtask.completed && "line-through text-muted-foreground"
                        )}
                      >
                        {subtask.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Attachments */}
          {task.attachments && task.attachments > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Paperclip className="h-4 w-4" />
                  Attachments ({task.attachments})
                </h3>
                <Button variant="outline" size="sm">
                  View Attachments
                </Button>
              </div>
            </>
          )}

          {/* Comments */}
          <Separator />
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Comments
            </h3>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground text-center py-4">
                No comments yet
              </div>
              <Button variant="outline" className="w-full">
                Add Comment
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
