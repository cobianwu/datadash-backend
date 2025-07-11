import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, TrendingUp, AlertTriangle } from "lucide-react";

export function AIInsights() {
  const insights = [
    {
      type: "opportunity",
      icon: TrendingUp,
      title: "Revenue Acceleration",
      description: "TechCorp's new product line showing 45% MoM growth. Consider scaling marketing spend.",
      iconColor: "text-green-300",
    },
    {
      type: "alert",
      icon: AlertTriangle,
      title: "Operational Alert",
      description: "RetailBrand's CAC increased 23% this quarter. Review customer acquisition strategy.",
      iconColor: "text-yellow-300",
    },
  ];

  return (
    <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white animate-slide-up">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">AI Business Insights</CardTitle>
            <p className="text-blue-100 text-sm mt-1">Operational recommendations</p>
          </div>
          <Brain className="w-6 h-6 text-blue-200" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight, index) => {
            const Icon = insight.icon;
            return (
              <div key={index} className="bg-white/10 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Icon className={`w-4 h-4 ${insight.iconColor}`} />
                  <span className="text-sm font-medium">{insight.title}</span>
                </div>
                <p className="text-sm text-blue-100">{insight.description}</p>
              </div>
            );
          })}
        </div>
        <Button 
          variant="secondary" 
          className="w-full mt-4 bg-white/20 hover:bg-white/30 text-white border-0"
        >
          View All Insights
        </Button>
      </CardContent>
    </Card>
  );
}
