import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Target, Clock } from "lucide-react";
import { useState, useEffect } from "react";

export function PredictiveAnalytics() {
  const [predictions, setPredictions] = useState({
    completionRate: 0,
    estimatedTime: 0,
    riskLevel: 'Low',
  });

  useEffect(() => {
    // Mock predictive analytics - in real app, use ML models
    const completionRate = Math.random() * 20 + 80; // 80-100%
    const estimatedTime = Math.random() * 10 + 5; // 5-15 days
    const riskLevel = Math.random() > 0.7 ? 'High' : Math.random() > 0.4 ? 'Medium' : 'Low';

    setPredictions({ completionRate, estimatedTime, riskLevel });
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Predictive Analytics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Predicted Completion Rate</span>
          </div>
          <span className="font-medium">{predictions.completionRate.toFixed(1)}%</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Estimated Time to Complete</span>
          </div>
          <span className="font-medium">{predictions.estimatedTime.toFixed(1)} days</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Risk Level</span>
          </div>
          <span className={`font-medium ${
            predictions.riskLevel === 'Low' ? 'text-green-600' :
            predictions.riskLevel === 'Medium' ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {predictions.riskLevel}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}