import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Project } from "@/types";
import { Calendar, CheckCircle2, Circle, Timer } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const navigate = useNavigate();
  
  // Calculate progress from tasks
  const totalTasks = project.tasksCount.todo + project.tasksCount.inProgress + project.tasksCount.done;
  const progress = totalTasks > 0 
    ? Math.round((project.tasksCount.done / totalTasks) * 100) 
    : 0;

  return (
    <Card 
      className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50"
      onClick={() => navigate(`/project/${project.id}`)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-lg"
              style={{ backgroundColor: project.color }}
            />
            <div>
              <h3 className="font-semibold text-base">{project.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {project.description}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <Circle className="h-3.5 w-3.5 text-status-todo" />
            <span className="text-muted-foreground">
              {project.tasksCount.todo}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Timer className="h-3.5 w-3.5 text-status-in-progress" />
            <span className="text-muted-foreground">
              {project.tasksCount.inProgress}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-status-done" />
            <span className="text-muted-foreground">
              {project.tasksCount.done}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex -space-x-2">
            {project.members.slice(0, 3).map((memberId, idx) => (
              <Avatar key={idx} className="h-7 w-7 border-2 border-background">
                <AvatarFallback className="text-xs">
                  {memberId.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ))}
            {project.members.length > 3 && (
              <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-muted text-xs">
                +{project.members.length - 3}
              </div>
            )}
          </div>

          {project.nextDueDate && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>{new Date(project.nextDueDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
