import { AppLayout } from "@/components/Layout/AppLayout";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { apiRequest } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Database, Server, Activity, Plus, Settings, Trash2, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function Warehouses() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState<any>(null);
  const { toast } = useToast();

  const { data: warehouses, isLoading } = useQuery({
    queryKey: ["/api/warehouses"],
  });

  const createWarehouseMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/warehouses", data).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/warehouses"] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Success",
        description: "Data warehouse created successfully",
      });
    },
  });

  const deleteWarehouseMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/warehouses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/warehouses"] });
      toast({
        title: "Success",
        description: "Data warehouse deleted successfully",
      });
    },
  });

  const handleCreateWarehouse = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    createWarehouseMutation.mutate({
      name: formData.get("name"),
      type: formData.get("type"),
      config: {
        host: formData.get("host"),
        port: formData.get("port"),
        database: formData.get("database"),
      },
    });
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  const warehouseTypes = [
    { type: "snowflake", name: "Snowflake", icon: Database, color: "text-blue-600" },
    { type: "bigquery", name: "BigQuery", icon: Server, color: "text-orange-600" },
    { type: "redshift", name: "Redshift", icon: Activity, color: "text-red-600" },
    { type: "databricks", name: "Databricks", icon: Database, color: "text-green-600" },
  ];

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Data Warehouses</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Connect and manage your data warehouse integrations
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Warehouse
          </Button>
        </div>

        {/* Warehouse Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {warehouses?.map((warehouse: any) => {
            const warehouseType = warehouseTypes.find(t => t.type === warehouse.type);
            const Icon = warehouseType?.icon || Database;
            
            return (
              <Card key={warehouse.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center ${warehouseType?.color}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle>{warehouse.name}</CardTitle>
                        <CardDescription>{warehouseType?.name || warehouse.type}</CardDescription>
                      </div>
                    </div>
                    <Badge variant={warehouse.status === "active" ? "default" : "secondary"}>
                      {warehouse.status === "active" ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Active
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Inactive
                        </>
                      )}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tables</span>
                      <span className="font-medium">{warehouse.tableCount || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Storage Used</span>
                      <span className="font-medium">{warehouse.storageUsed || "0 GB"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Last Sync</span>
                      <span className="font-medium flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {warehouse.lastSync || "Never"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Storage Capacity</span>
                      <span className="text-muted-foreground">
                        {warehouse.storageUsed || "0 GB"} / {warehouse.storageLimit || "100 GB"}
                      </span>
                    </div>
                    <Progress value={warehouse.storagePercent || 0} className="h-2" />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setSelectedWarehouse(warehouse)}
                    >
                      <Settings className="w-3 h-3 mr-1" />
                      Configure
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteWarehouseMutation.mutate(warehouse.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Add New Card */}
          <Card 
            className="border-dashed cursor-pointer hover:border-primary hover:shadow-lg transition-all"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <CardContent className="flex flex-col items-center justify-center h-full min-h-[250px] text-center">
              <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                <Plus className="h-6 w-6 text-muted-foreground" />
              </div>
              <CardTitle className="text-lg">Add New Warehouse</CardTitle>
              <CardDescription className="mt-2">
                Connect a new data warehouse to start analyzing your data
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Create Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent>
            <form onSubmit={handleCreateWarehouse}>
              <DialogHeader>
                <DialogTitle>Add Data Warehouse</DialogTitle>
                <DialogDescription>
                  Connect a new data warehouse to DataFlow Analytics
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Warehouse Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Production Warehouse"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Warehouse Type</Label>
                  <Select name="type" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a warehouse type" />
                    </SelectTrigger>
                    <SelectContent>
                      {warehouseTypes.map((type) => (
                        <SelectItem key={type.type} value={type.type}>
                          <div className="flex items-center">
                            <type.icon className={`w-4 h-4 mr-2 ${type.color}`} />
                            {type.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="host">Host</Label>
                  <Input
                    id="host"
                    name="host"
                    placeholder="warehouse.region.provider.com"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="port">Port</Label>
                    <Input
                      id="port"
                      name="port"
                      type="number"
                      placeholder="5432"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="database">Database</Label>
                    <Input
                      id="database"
                      name="database"
                      placeholder="analytics_db"
                      required
                    />
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createWarehouseMutation.isPending}>
                  {createWarehouseMutation.isPending ? "Creating..." : "Create Warehouse"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}