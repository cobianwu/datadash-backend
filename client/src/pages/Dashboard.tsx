import { AppLayout } from "@/components/Layout/AppLayout";
import { MetricCard } from "@/components/MetricCard";
import { PortfolioChart } from "@/components/Charts/PortfolioChart";
import { SectorChart } from "@/components/Charts/SectorChart";
import { WaterfallChart } from "@/components/Charts/WaterfallChart";
import { TopPerformers } from "@/components/TopPerformers";
import { AIInsights } from "@/components/AIInsights";
import { DataQualityPanel } from "@/components/DataQualityPanel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "wouter";
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Package, 
  Settings2, 
  Plus,
  Gauge,
  Target,
  Activity,
  Upload
} from "lucide-react";

interface DashboardWidget {
  id: string;
  type: string;
  title: string;
  size: "small" | "medium" | "large";
  config?: any;
}

export default function Dashboard() {
  const [selectedCompany, setSelectedCompany] = useState<string>("all");
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [widgets, setWidgets] = useState<DashboardWidget[]>([
    { id: "1", type: "metric", title: "Revenue Growth", size: "small", config: { metric: "revenue_growth" } },
    { id: "2", type: "metric", title: "EBITDA Margin", size: "small", config: { metric: "ebitda_margin" } },
    { id: "3", type: "metric", title: "Customer Retention", size: "small", config: { metric: "customer_retention" } },
    { id: "4", type: "metric", title: "Burn Rate", size: "small", config: { metric: "burn_rate" } },
    { id: "5", type: "chart", title: "Revenue Trend", size: "medium", config: { chart: "revenue_trend" } },
    { id: "6", type: "chart", title: "Customer Cohorts", size: "medium", config: { chart: "cohorts" } },
    { id: "7", type: "table", title: "KPI Summary", size: "large", config: { table: "kpi_summary" } },
    { id: "8", type: "ai", title: "AI Insights", size: "medium", config: {} },
  ]);

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["/api/dashboard/business-metrics", selectedCompany],
  });

  const { data: companies } = useQuery({
    queryKey: ["/api/companies"],
  });

  const operationalMetrics = {
    revenue_growth: { value: "+23%", change: "+5%", changeLabel: "vs last quarter", icon: TrendingUp, trend: "up" as const },
    ebitda_margin: { value: "18.2%", change: "+2.1%", changeLabel: "vs target", icon: DollarSign, trend: "up" as const },
    customer_retention: { value: "92%", change: "-1%", changeLabel: "MoM", icon: Users, trend: "down" as const },
    burn_rate: { value: "$2.1M", change: "6 months", changeLabel: "runway", icon: Gauge, trend: "neutral" as const },
    cac_payback: { value: "14 mo", change: "-2 mo", changeLabel: "improvement", icon: Target, trend: "up" as const },
    nps_score: { value: "67", change: "+12", changeLabel: "vs last survey", icon: Activity, trend: "up" as const },
  };

  const addWidget = () => {
    // In a real implementation, this would open a modal to select widget type
    const newWidget: DashboardWidget = {
      id: Date.now().toString(),
      type: "metric",
      title: "New Metric",
      size: "small",
      config: { metric: "nps_score" }
    };
    setWidgets([...widgets, newWidget]);
  };

  const removeWidget = (id: string) => {
    setWidgets(widgets.filter(w => w.id !== id));
  };

  if (metricsLoading) {
    return (
      <AppLayout>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6 animate-fade-in">
        {/* Header with Company Filter and Customize Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">Business Intelligence Dashboard</h1>
            <Select value={selectedCompany} onValueChange={setSelectedCompany}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select company" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Companies</SelectItem>
                <SelectItem value="techco">TechCo</SelectItem>
                <SelectItem value="retailbrand">RetailBrand</SelectItem>
                <SelectItem value="healthcorp">HealthCorp</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Link href="/data-analysis">
              <Button variant="default" className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                <Upload className="h-4 w-4 mr-2" />
                Upload & Analyze Data
              </Button>
            </Link>
            <Button
              variant={isCustomizing ? "default" : "outline"}
              onClick={() => setIsCustomizing(!isCustomizing)}
            >
              <Settings2 className="h-4 w-4 mr-2" />
              {isCustomizing ? "Done" : "Customize"}
            </Button>
            {isCustomizing && (
              <Button onClick={addWidget}>
                <Plus className="h-4 w-4 mr-2" />
                Add Widget
              </Button>
            )}
          </div>
        </div>

        {/* Dynamic Widget Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {widgets.map((widget) => {
            if (widget.type === "metric" && widget.size === "small") {
              const metricData = operationalMetrics[widget.config.metric as keyof typeof operationalMetrics];
              return (
                <div key={widget.id} className="relative group">
                  <MetricCard
                    title={widget.title}
                    value={metricData?.value || "N/A"}
                    change={metricData?.change || ""}
                    changeLabel={metricData?.changeLabel || ""}
                    icon={metricData?.icon || TrendingUp}
                    trend={metricData?.trend || "neutral"}
                    className="animate-slide-up"
                  />
                  {isCustomizing && (
                    <button
                      onClick={() => removeWidget(widget.id)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white p-1 rounded"
                    >
                      ×
                    </button>
                  )}
                </div>
              );
            }
            return null;
          })}
        </div>

        {/* Business Intelligence Widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {widgets.filter(w => w.type === "chart" || w.type === "table").map((widget) => (
            <div key={widget.id} className={`relative group ${widget.size === "large" ? "xl:col-span-2" : ""}`}>
              {widget.config.chart === "revenue_trend" && <PortfolioChart />}
              {widget.config.chart === "cohorts" && <SectorChart />}
              {widget.config.table === "kpi_summary" && <TopPerformers />}
              {isCustomizing && (
                <button
                  onClick={() => removeWidget(widget.id)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white p-1 rounded z-10"
                >
                  ×
                </button>
              )}
            </div>
          ))}
          
          {widgets.find(w => w.type === "ai") && (
            <div className="relative group">
              <AIInsights />
              {isCustomizing && (
                <button
                  onClick={() => removeWidget(widgets.find(w => w.type === "ai")!.id)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white p-1 rounded z-10"
                >
                  ×
                </button>
              )}
            </div>
          )}
        </div>

        {/* Data Quality Panel */}
        <DataQualityPanel />
      </div>
    </AppLayout>
  );
}
