import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Task, User, Comment } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Paperclip, MessageSquare, CheckSquare, Edit, Check, X, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { roleService } from "@/services/roleService";
import { taskService } from "@/services/taskService";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";

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
  const [isEditingAssignee, setIsEditingAssignee] = useState(false);
  const [assigneeId, setAssigneeId] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const allUsers = await roleService.getAllUsers();
        setUsers(allUsers);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };

    if (open) {
      fetchUsers();
    }
  }, [open]);

  useEffect(() => {
    if (task) {
      setAssigneeId(task.assigneeId || "none");
      fetchComments();
    }
  }, [task]);

  const fetchComments = async () => {
    if (!task) return;
    try {
      const taskComments = await taskService.getComments(task.id);
      setComments(taskComments);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    }
  };

  if (!task) return null;

  const assignee = task.assignee;

  const handleSaveAssignee = async () => {
    try {
      setLoading(true);
      await taskService.updateTask(task.id, {
        assigneeId: assigneeId === "none" ? null : assigneeId || null,
      });
      setIsEditingAssignee(false);
      toast({
        title: "Assignee updated",
        description: "Task assignee has been updated successfully.",
      });
      // Refresh the task data - this might need to be handled by parent component
      window.location.reload(); // Temporary solution
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update assignee",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setAssigneeId(task.assigneeId || "none");
    setIsEditingAssignee(false);
  };

  const handleAddComment = async () => {
    if (!user || !task || !newComment.trim()) return;

    try {
      setCommentLoading(true);
      await taskService.addComment(task.id, user.uid, newComment.trim());
      setNewComment("");
      await fetchComments(); // Refresh comments
      toast({
        title: "Comment added",
        description: "Your comment has been added successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add comment",
        variant: "destructive",
      });
    } finally {
      setCommentLoading(false);
    }
  };

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
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold">Assignee</h3>
                {!isEditingAssignee && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingAssignee(true)}
                    className="h-6 w-6 p-0"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                )}
              </div>
              {isEditingAssignee ? (
                <div className="space-y-2">
                  <Select value={assigneeId} onValueChange={setAssigneeId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select assignee" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Unassigned</SelectItem>
                      {users.map((user) => (
                        <SelectItem key={user.uid} value={user.uid}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleSaveAssignee}
                      disabled={loading}
                      className="h-7"
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancelEdit}
                      disabled={loading}
                      className="h-7"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={assignee?.avatar} alt={assignee?.name} />
                    <AvatarFallback className="text-xs">
                      {assignee?.name?.substring(0, 2) || "??"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">
                      {assignee?.name || "Unassigned"}
                    </p>
                  </div>
                </div>
              )}
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
              Comments ({comments.length})
            </h3>
            <div className="space-y-4">
              {comments.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-4">
                  No comments yet
                </div>
              ) : (
                <div className="h-64 overflow-y-auto border rounded-md p-3 bg-muted/20">
                  <div className="space-y-3">
                    {comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarImage src={comment.user.avatar} alt={comment.user.name} />
                          <AvatarFallback className="text-xs">
                            {comment.user.name.substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">{comment.user.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground break-words">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-2">
                <Textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={2}
                  className="flex-1"
                />
                <Button
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || commentLoading}
                  size="sm"
                  className="self-end"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
