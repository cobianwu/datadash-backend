import { useState } from "react";
import { AppLayout } from "@/components/Layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Upload, Database, FileText, RefreshCw, Trash2, Eye } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { DataPreview } from "@/components/DataPreview";

export default function DataSources() {
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [selectedDataSource, setSelectedDataSource] = useState<any>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const { toast } = useToast();

  const { data: dataSources, isLoading } = useQuery({
    queryKey: ["/api/data-sources"],
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      
      const response = await fetch("/api/data-sources/upload", {
        method: "POST",
        body: formData,
        credentials: "include"
      });
      
      if (!response.ok) throw new Error("Upload failed");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/data-sources"] });
      toast({
        title: "File uploaded successfully",
        description: "Your data source has been created"
      });
      setUploadFile(null);
    },
    onError: () => {
      toast({
        title: "Upload failed",
        description: "There was an error uploading your file",
        variant: "destructive"
      });
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
    }
  };

  const handleUpload = () => {
    if (uploadFile) {
      uploadMutation.mutate(uploadFile);
    }
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Data Sources</h1>
            <p className="text-muted-foreground">Manage your data connections and uploads</p>
          </div>
        </div>

        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Data</CardTitle>
            <CardDescription>
              Upload CSV, Excel, JSON, or Parquet files up to 100MB
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Input
                  type="file"
                  accept=".csv,.xlsx,.xls,.json,.parquet"
                  onChange={handleFileChange}
                  className="flex-1"
                />
                <Button 
                  onClick={handleUpload} 
                  disabled={!uploadFile || uploadMutation.isPending}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {uploadMutation.isPending ? "Uploading..." : "Upload"}
                </Button>
              </div>
              {uploadFile && (
                <p className="text-sm text-muted-foreground">
                  Selected: {uploadFile.name} ({(uploadFile.size / 1024 / 1024).toFixed(2)}MB)
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Data Sources List */}
        <div className="grid gap-4">
          {isLoading ? (
            <Card>
              <CardContent className="p-12">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                  <p className="text-muted-foreground">Loading data sources...</p>
                </div>
              </CardContent>
            </Card>
          ) : dataSources?.length === 0 ? (
            <Card>
              <CardContent className="p-12">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <Database className="h-12 w-12 text-muted-foreground" />
                  <h3 className="text-lg font-semibold">No data sources yet</h3>
                  <p className="text-muted-foreground text-center max-w-md">
                    Upload your first data file to start analyzing. We support CSV, Excel, JSON, and Parquet formats.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            dataSources?.map((source: any) => (
              <Card 
                key={source.id} 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => {
                  setSelectedDataSource(source);
                  setPreviewOpen(true);
                }}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-8 w-8 text-blue-600" />
                      <div>
                        <CardTitle className="text-lg">{source.name}</CardTitle>
                        <CardDescription>
                          {source.rowCount?.toLocaleString()} rows • {source.type?.toUpperCase()} • 
                          {source.createdAt && ` Uploaded ${format(new Date(source.createdAt), "MMM d, yyyy")}`}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        source.status === 'ready' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {source.status || 'processing'}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDataSource(source);
                          setPreviewOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: Add delete functionality
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">File Name</p>
                      <p className="font-medium">{source.fileName || 'Unknown'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Schema</p>
                      <p className="font-medium">
                        {source.schema ? Object.keys(source.schema).length : 0} columns
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Type</p>
                      <p className="font-medium">{source.type?.toUpperCase() || 'Unknown'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Status</p>
                      <p className="font-medium capitalize">{source.status || 'Processing'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Data Preview Dialog */}
        <DataPreview 
          dataSource={selectedDataSource}
          isOpen={previewOpen}
          onClose={() => {
            setPreviewOpen(false);
            setSelectedDataSource(null);
          }}
        />
      </div>
    </AppLayout>
  );
}