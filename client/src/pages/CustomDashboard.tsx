import { useState } from "react";
import { AppLayout } from "@/components/Layout/AppLayout";
import { DashboardBuilder } from "@/components/DashboardBuilder/DashboardBuilder";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

export default function CustomDashboard() {
  const { toast } = useToast();
  const [selectedDataSource, setSelectedDataSource] = useState<number | null>(null);

  // Fetch user's data sources
  const { data: dataSources } = useQuery({
    queryKey: ["/api/data-sources"],
  });

  // Fetch saved dashboards
  const { data: dashboards } = useQuery({
    queryKey: ["/api/dashboards"],
  });

  // Save dashboard mutation
  const saveDashboardMutation = useMutation({
    mutationFn: async (dashboard: any) => {
      const response = await fetch("/api/dashboards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dashboard),
        credentials: "include"
      });
      
      if (!response.ok) throw new Error("Failed to save dashboard");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboards"] });
      toast({
        title: "✓ Dashboard saved",
        description: "Your custom dashboard has been saved successfully"
      });
    },
    onError: () => {
      toast({
        title: "Save failed",
        description: "There was an error saving your dashboard",
        variant: "destructive"
      });
    }
  });

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Custom Dashboard Builder</h1>
          <p className="text-muted-foreground">Create interactive dashboards with drag-and-drop widgets</p>
        </div>

        {/* Data Source Selector */}
        {dataSources && dataSources.length > 0 && (
          <div className="bg-muted/20 p-4 rounded-lg">
            <label className="text-sm font-medium">Select Data Source:</label>
            <select 
              className="ml-4 px-3 py-1 rounded border"
              value={selectedDataSource || ''}
              onChange={(e) => setSelectedDataSource(Number(e.target.value))}
            >
              <option value="">Choose a data source...</option>
              {dataSources.map((ds: any) => (
                <option key={ds.id} value={ds.id}>{ds.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Dashboard Builder */}
        <DashboardBuilder
          dataSourceId={selectedDataSource || undefined}
          onSave={(layout) => saveDashboardMutation.mutate(layout)}
        />

        {/* Saved Dashboards */}
        {dashboards && dashboards.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Saved Dashboards</h3>
            <div className="grid grid-cols-3 gap-4">
              {dashboards.map((dashboard: any) => (
                <div key={dashboard.id} className="border rounded-lg p-4 cursor-pointer hover:bg-muted/20">
                  <h4 className="font-medium">{dashboard.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {dashboard.widgets?.length || 0} widgets
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}