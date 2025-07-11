import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  changeLabel: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  className?: string;
  style?: React.CSSProperties;
}

export function MetricCard({ 
  title, 
  value, 
  change, 
  changeLabel, 
  icon: Icon, 
  trend = "neutral",
  className,
  style
}: MetricCardProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case "down":
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-blue-600" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case "up":
        return "text-green-600";
      case "down":
        return "text-red-600";
      default:
        return "text-blue-600";
    }
  };

  const getIconBg = () => {
    switch (trend) {
      case "up":
        return "bg-gradient-to-br from-green-500/10 to-green-500/20";
      case "down":
        return "bg-gradient-to-br from-red-500/10 to-red-500/20";
      default:
        return "bg-gradient-to-br from-blue-500/10 to-blue-500/20";
    }
  };

  return (
    <Card className={cn("metric-card transition-colors duration-300", className)} style={style}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
            <div className="flex items-center mt-2">
              {getTrendIcon()}
              <span className={cn("text-sm font-medium ml-1", getTrendColor())}>{change}</span>
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">{changeLabel}</span>
            </div>
          </div>
          <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", getIconBg())}>
            <Icon className={cn("w-6 h-6", getTrendColor())} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
