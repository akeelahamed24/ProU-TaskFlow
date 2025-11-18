import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Project } from "@/types";
import { Calendar, CheckCircle2, Circle, Timer, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const navigate = useNavigate();

  // Validate and calculate progress with fallbacks
  const tasksCount = project.tasksCount || { todo: 0, inProgress: 0, done: 0 };
  const totalTasks = (tasksCount.todo || 0) + (tasksCount.inProgress || 0) + (tasksCount.done || 0);
  const progress = totalTasks > 0
    ? Math.round((tasksCount.done / totalTasks) * 100)
    : 0;

  // Validate members array
  const members = Array.isArray(project.members) ? project.members : [];

  // Validate project properties with fallbacks
  const projectName = project.name || "Unnamed Project";
  const projectDescription = project.description || "No description available";
  const projectColor = project.color || "#6b7280"; // Default gray color

  return (
    <Card 
      className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50 group"
      onClick={() => navigate(`/project/${project.id}`)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform"
              style={{ backgroundColor: projectColor }}
            >
              {!project.color && (
                <AlertCircle className="h-5 w-5 text-white opacity-80" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base truncate">{projectName}</h3>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {projectDescription}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Progress Section */}
        <div>
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="text-xs text-muted-foreground mt-1">
            {tasksCount.done} of {totalTasks} tasks completed
          </div>
        </div>

        {/* Task Status Breakdown */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-muted/50">
            <Circle className="h-4 w-4 text-status-todo" />
            <span className="font-medium">{tasksCount.todo || 0}</span>
            <span className="text-muted-foreground text-xs">Todo</span>
          </div>
          <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-muted/50">
            <Timer className="h-4 w-4 text-status-in-progress" />
            <span className="font-medium">{tasksCount.inProgress || 0}</span>
            <span className="text-muted-foreground text-xs">In Progress</span>
          </div>
          <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-muted/50">
            <CheckCircle2 className="h-4 w-4 text-status-done" />
            <span className="font-medium">{tasksCount.done || 0}</span>
            <span className="text-muted-foreground text-xs">Done</span>
          </div>
        </div>

        {/* Footer with Members and Due Date */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {members.slice(0, 3).map((memberId, idx) => (
                <Avatar key={`${memberId}-${idx}`} className="h-6 w-6 border-2 border-background">
                  <AvatarFallback className="text-[10px] bg-primary text-primary-foreground">
                    {typeof memberId === 'string' ? memberId.substring(0, 2).toUpperCase() : 'U'}
                  </AvatarFallback>
                </Avatar>
              ))}
              {members.length > 3 && (
                <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-muted text-xs">
                  +{members.length - 3}
                </div>
              )}
            </div>
            {members.length === 0 && (
              <span className="text-xs text-muted-foreground">No members</span>
            )}
          </div>

          {project.nextDueDate && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>
                {new Date(project.nextDueDate).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </div>
          )}
        </div>

        {/* Created Date */}
        {project.createdAt && (
          <div className="text-xs text-muted-foreground text-center">
            Created {new Date(project.createdAt).toLocaleDateString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}