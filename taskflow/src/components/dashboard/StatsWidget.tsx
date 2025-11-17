import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, AlertCircle, TrendingUp, Clock } from "lucide-react";
import { tasks } from "@/data/mockData";

export function StatsWidget() {
  const totalTasks = tasks.length;
  const overdueTasks = tasks.filter(
    (task) => new Date(task.dueDate) < new Date() && task.status !== "done"
  ).length;
  const completedThisWeek = tasks.filter((task) => task.status === "done").length;
  const inProgressTasks = tasks.filter((task) => task.status === "in_progress").length;

  const stats = [
    {
      title: "Total Tasks",
      value: totalTasks,
      icon: CheckCircle2,
      color: "text-primary",
    },
    {
      title: "In Progress",
      value: inProgressTasks,
      icon: Clock,
      color: "text-status-in-progress",
    },
    {
      title: "Completed",
      value: completedThisWeek,
      icon: TrendingUp,
      color: "text-status-done",
    },
    {
      title: "Overdue",
      value: overdueTasks,
      icon: AlertCircle,
      color: "text-priority-high",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
