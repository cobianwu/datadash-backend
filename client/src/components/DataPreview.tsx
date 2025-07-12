import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FileText, Database, BarChart3, AlertTriangle, CheckCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";

interface DataPreviewProps {
  dataSource: any;
  isOpen: boolean;
  onClose: () => void;
}

export function DataPreview({ dataSource, isOpen, onClose }: DataPreviewProps) {
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && dataSource) {
      fetchPreviewData();
    }
  }, [isOpen, dataSource]);

  const fetchPreviewData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/data-sources/${dataSource.id}/preview`, {
        credentials: "include"
      });
      if (response.ok) {
        const data = await response.json();
        setPreviewData(data.preview || []);
      }
    } catch (error) {
      console.error("Error fetching preview:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!dataSource) return null;

  const columns = dataSource.columns || [];
  const schema = dataSource.schema || {};
  const dataQuality = dataSource.dataQuality || {};

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {dataSource.name}
          </DialogTitle>
          <DialogDescription>
            Preview and analyze your uploaded data source
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="preview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="preview">Data Preview</TabsTrigger>
            <TabsTrigger value="schema">Schema</TabsTrigger>
            <TabsTrigger value="quality">Data Quality</TabsTrigger>
            <TabsTrigger value="info">Information</TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="space-y-4">
            <div className="rounded-md border">
              <ScrollArea className="h-[400px] w-full">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {columns.map((col: string) => (
                        <TableHead key={col} className="min-w-[100px]">
                          {col}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={columns.length} className="text-center">
                          Loading preview...
                        </TableCell>
                      </TableRow>
                    ) : previewData.length > 0 ? (
                      previewData.map((row: any, idx: number) => (
                        <TableRow key={idx}>
                          {columns.map((col: string) => (
                            <TableCell key={col}>
                              {formatCellValue(row[col], schema[col]?.type)}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={columns.length} className="text-center">
                          No preview data available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
            <p className="text-sm text-muted-foreground">
              Showing first {previewData.length} rows of {dataSource.rowCount} total rows
            </p>
          </TabsContent>

          <TabsContent value="schema" className="space-y-4">
            <div className="grid gap-4">
              {Object.entries(schema).map(([field, info]: [string, any]) => (
                <Card key={field}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <Database className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{field}</p>
                        <p className="text-sm text-muted-foreground">
                          {info.nullable ? "Nullable" : "Required"}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">{info.type}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="quality" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Total Rows</p>
                      <p className="text-2xl font-bold">{dataQuality.totalRows || 0}</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Clean Rows</p>
                      <p className="text-2xl font-bold">{dataQuality.cleanRows || 0}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {dataQuality.issues > 0 && (
              <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <p className="text-sm font-medium">
                      {dataQuality.issues} potential issues found
                    </p>
                  </div>
                  {dataQuality.recommendations && (
                    <ul className="mt-2 list-disc list-inside text-sm text-muted-foreground">
                      {dataQuality.recommendations.map((rec: string, idx: number) => (
                        <li key={idx}>{rec}</li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="info" className="space-y-4">
            <div className="grid gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="grid gap-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">File Name</span>
                      <span className="text-sm text-muted-foreground">{dataSource.fileName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Type</span>
                      <Badge variant="secondary">{dataSource.type}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Status</span>
                      <Badge variant={dataSource.status === 'ready' ? 'default' : 'secondary'}>
                        {dataSource.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Columns</span>
                      <span className="text-sm text-muted-foreground">{columns.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Rows</span>
                      <span className="text-sm text-muted-foreground">
                        {dataSource.rowCount?.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Uploaded</span>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(dataSource.createdAt), 'MMM d, yyyy h:mm a')}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function formatCellValue(value: any, type?: string): string {
  if (value === null || value === undefined) return "-";
  
  if (type === "date" && value) {
    try {
      return format(new Date(value), "MMM d, yyyy");
    } catch {
      return String(value);
    }
  }
  
  if (type === "number" && typeof value === "number") {
    return value.toLocaleString();
  }
  
  return String(value);
}