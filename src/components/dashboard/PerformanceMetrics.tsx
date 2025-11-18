import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Clock, AlertTriangle, Zap } from "lucide-react";
import { useState, useEffect } from "react";

export function PerformanceMetrics() {
  const [metrics, setMetrics] = useState({
    loadTime: 0,
    errorRate: 0,
    uptime: 99.9,
  });

  useEffect(() => {
    // Mock performance data - in real app, collect from actual metrics
    const loadTime = Math.random() * 2000 + 500; // 500-2500ms
    const errorRate = Math.random() * 5; // 0-5%
    const uptime = 99.9 + Math.random() * 0.1; // 99.9-100%

    setMetrics({ loadTime, errorRate, uptime });
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Performance Metrics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Average Load Time</span>
          </div>
          <span className="font-medium">{metrics.loadTime.toFixed(0)}ms</span>
        </div>
        <Progress value={Math.min((metrics.loadTime / 3000) * 100, 100)} className="h-2" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Error Rate</span>
          </div>
          <span className="font-medium">{metrics.errorRate.toFixed(2)}%</span>
        </div>
        <Progress value={metrics.errorRate * 20} className="h-2" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Uptime</span>
          </div>
          <span className="font-medium">{metrics.uptime.toFixed(2)}%</span>
        </div>
        <Progress value={metrics.uptime} className="h-2" />
      </CardContent>
    </Card>
  );
}