import { AppLayout } from "@/components/Layout/AppLayout";
import { MetricCard } from "@/components/MetricCard";
import { PortfolioChart } from "@/components/Charts/PortfolioChart";
import { SectorChart } from "@/components/Charts/SectorChart";
import { WaterfallChart } from "@/components/Charts/WaterfallChart";
import { TopPerformers } from "@/components/TopPerformers";
import { AIInsights } from "@/components/AIInsights";
import { DataQualityPanel } from "@/components/DataQualityPanel";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Briefcase, Percent, Database } from "lucide-react";

export default function Dashboard() {
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["/api/dashboard/metrics"],
  });

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
        {/* Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Portfolio Value"
            value={`$${(metrics?.totalPortfolioValue / 1000000000 || 2.4).toFixed(1)}B`}
            change="+12.5%"
            changeLabel="vs last month"
            icon={TrendingUp}
            trend="up"
            className="animate-slide-up"
          />
          
          <MetricCard
            title="Active Investments"
            value={metrics?.activeInvestments?.toString() || "47"}
            change="3 new"
            changeLabel="this quarter"
            icon={Briefcase}
            trend="neutral"
            className="animate-slide-up"
            style={{ animationDelay: "0.1s" }}
          />
          
          <MetricCard
            title="Average IRR"
            value={`${metrics?.averageIRR || 24.8}%`}
            change="+2.1%"
            changeLabel="vs benchmark"
            icon={Percent}
            trend="up"
            className="animate-slide-up"
            style={{ animationDelay: "0.2s" }}
          />
          
          <MetricCard
            title="Data Quality Score"
            value={`${metrics?.dataQualityScore || 94}%`}
            change="Excellent"
            changeLabel="status"
            icon={Database}
            trend="up"
            className="animate-slide-up"
            style={{ animationDelay: "0.3s" }}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Portfolio Performance Chart */}
          <div className="xl:col-span-2">
            <PortfolioChart />
          </div>

          {/* Sector Allocation */}
          <SectorChart />

          {/* Revenue Waterfall */}
          <WaterfallChart />

          {/* Top Performing Companies */}
          <TopPerformers />

          {/* AI Insights */}
          <AIInsights />
        </div>

        {/* Data Quality Panel */}
        <DataQualityPanel />
      </div>
    </AppLayout>
  );
}
