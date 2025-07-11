import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Database, FileSpreadsheet, Link, Cloud, Plus, RefreshCw } from "lucide-react";

interface DataSource {
  name: string;
  icon: any;
  records: string;
  quality: number;
  lastUpdated: string;
  status: "active" | "warning" | "error";
}

export function DataQualityPanel() {
  const { data: dataSources, isLoading } = useQuery({
    queryKey: ["/api/data-sources"],
  });

  const mockSources: DataSource[] = [
    {
      name: "Financial DB",
      icon: Database,
      records: "2.4M",
      quality: 98,
      lastUpdated: "2m ago",
      status: "active",
    },
    {
      name: "Q3 Reports",
      icon: FileSpreadsheet,
      records: "47",
      quality: 95,
      lastUpdated: "1h ago",
      status: "active",
    },
    {
      name: "Market API",
      icon: Link,
      records: "12",
      quality: 87,
      lastUpdated: "15m ago",
      status: "warning",
    },
    {
      name: "Cloud Storage",
      icon: Cloud,
      records: "1.2K",
      quality: 92,
      lastUpdated: "5m ago",
      status: "active",
    },
  ];

  const displaySources = dataSources || mockSources;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "warning":
        return "bg-yellow-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getQualityColor = (quality: number) => {
    if (quality >= 95) return "text-green-600";
    if (quality >= 85) return "text-yellow-600";
    return "text-red-600";
  };

  if (isLoading) {
    return (
      <Card className="animate-slide-up">
        <CardHeader>
          <CardTitle>Data Sources & Quality</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="animate-slide-up">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">Data Sources & Quality</CardTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Real-time monitoring and health status
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button className="gradient-brand">
              <Plus className="w-4 h-4 mr-2" />
              Add Source
            </Button>
            <Button variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh All
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {displaySources.map((source: any, index: number) => {
            const Icon = mockSources[index]?.icon || Database;
            const sourceData = mockSources[index] || source;
            
            return (
              <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Icon className="w-5 h-5 text-blue-500" />
                    <span className="font-medium text-gray-900 dark:text-white">
                      {sourceData.name}
                    </span>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(sourceData.status)} ${
                    sourceData.status === 'active' ? 'animate-pulse-slow' : ''
                  }`} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Records:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {sourceData.records}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Quality:</span>
                    <span className={`font-medium ${getQualityColor(sourceData.quality)}`}>
                      {sourceData.quality}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Last Updated:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {sourceData.lastUpdated}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
