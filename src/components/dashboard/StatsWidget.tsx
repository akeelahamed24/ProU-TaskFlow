import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, AlertCircle, TrendingUp, Clock, Loader2, ArrowUp, ArrowDown, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { taskService } from "@/services/taskService";
import { Task } from "@/types";
import { Button } from "@/components/ui/button";

export interface StatsWidgetRef {
  refresh: () => void;
}

export const StatsWidget = forwardRef<StatsWidgetRef>((props, ref) => {
  console.log("StatsWidget rendered");
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    if (user) {
      loadUserTasks();
    }
  }, [user]);

  // Auto-refresh every 30 seconds for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (user && !loading) {
        loadUserTasks(false);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [user, loading]);

  const loadUserTasks = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      else setRefreshing(true);
      
      const allTasks = await taskService.getAllTasks();
      setTasks(allTasks);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to load user tasks:", error);
    } finally {
      if (showLoading) setLoading(false);
      else setRefreshing(false);
    }
  };

  useImperativeHandle(ref, () => ({
    refresh: () => loadUserTasks(false)
  }), []);

  const totalTasks = tasks.length;
  const overdueTasks = tasks.filter(
    (task) => new Date(task.dueDate) < new Date() && task.status !== "done"
  ).length;
  const completedTasks = tasks.filter((task) => task.status === "done").length;
  const inProgressTasks = tasks.filter((task) => task.status === "in-progress").length;
  const todoTasks = tasks.filter((task) => task.status === "todo").length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const overdueRate = totalTasks > 0 ? Math.round((overdueTasks / totalTasks) * 100) : 0;

  const stats = [
    {
      title: "Total Tasks",
      value: totalTasks,
      icon: CheckCircle2,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-l-blue-500",
      description: totalTasks === 0 ? "No tasks yet" : `${todoTasks} pending`,
      trend: null,
    },
    {
      title: "In Progress",
      value: inProgressTasks,
      icon: Clock,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      borderColor: "border-l-amber-500",
      description: `${inProgressTasks} active tasks`,
      trend: inProgressTasks > 0 ? { value: inProgressTasks, isPositive: true } : null,
    },
    {
      title: "Completed",
      value: completedTasks,
      icon: TrendingUp,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-l-emerald-500",
      description: `${completionRate}% completion rate`,
      trend: completionRate > 50 ? { value: completionRate, isPositive: true } : completionRate < 20 ? { value: completionRate, isPositive: false } : null,
    },
    {
      title: "Overdue",
      value: overdueTasks,
      icon: AlertCircle,
      color: "text-rose-600",
      bgColor: "bg-rose-50",
      borderColor: "border-l-rose-500",
      description: overdueTasks > 0 ? `${overdueRate}% need attention` : "All on track",
      trend: overdueTasks > 0 ? { value: overdueRate, isPositive: false } : { value: 0, isPositive: true },
    },
  ];

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Task Statistics</h3>
          <div className="h-8 w-8 bg-muted rounded-lg animate-pulse" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-20 bg-muted rounded" />
                <div className="h-8 w-8 bg-muted rounded-full" />
              </CardHeader>
              <CardContent>
                <div className="h-7 w-12 bg-muted rounded mb-2" />
                <div className="h-3 w-24 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Task Statistics</h3>
          <p className="text-sm text-muted-foreground">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => loadUserTasks(false)}
          disabled={refreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card 
            key={stat.title} 
            className={`group relative overflow-hidden border-l-4 ${stat.borderColor} transition-all duration-300 hover:shadow-md hover:scale-[1.02]`}
          >
            <div className={`absolute inset-0 ${stat.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
            
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className="flex items-center gap-2">
                {stat.trend && (
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${
                    stat.trend.isPositive 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}>
                    {stat.trend.isPositive ? 
                      <ArrowUp className="h-3 w-3" /> : 
                      <ArrowDown className="h-3 w-3" />
                    }
                    {stat.trend.value > 0 && (stat.title === "In Progress" ? stat.trend.value : `${stat.trend.value}%`)}
                  </div>
                )}
                <div className={`p-2 rounded-full ${stat.bgColor} ${stat.color} border transition-colors duration-300`}>
                  <stat.icon className="h-4 w-4" />
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold mb-1 transition-colors duration-300">
                {stat.value}
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                {stat.description}
              </p>
              
              {stat.title === "Completed" && completionRate > 0 && (
                <div className="mt-3 space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Progress</span>
                    <span>{completionRate}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-2 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${completionRate}%` }}
                    />
                  </div>
                </div>
              )}

              {stat.title === "Overdue" && overdueTasks > 0 && (
                <div className="mt-3 space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Attention needed</span>
                    <span>{overdueRate}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-rose-500 h-2 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${overdueRate}%` }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
});

StatsWidget.displayName = "StatsWidget";