import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Sparkles, AlertTriangle, CheckCircle, Database, Filter, 
  Wand2, Download, FileSpreadsheet, TrendingUp, AlertCircle,
  Loader2, Settings, ArrowRight
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface DataCleanerProps {
  dataSourceId: number;
  dataQuality: any;
  onCleanComplete?: () => void;
}

export function DataCleaner({ dataSourceId, dataQuality, onCleanComplete }: DataCleanerProps) {
  const [cleaningOptions, setCleaningOptions] = useState({
    fillMissing: true,
    removeOutliers: false,
    standardizeTypes: true,
    removeDuplicates: true,
    normalizeText: true
  });
  const [cleaningProgress, setCleaningProgress] = useState(0);
  const { toast } = useToast();

  const cleanDataMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/data-sources/${dataSourceId}/clean`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ options: cleaningOptions })
      });
      
      if (!response.ok) throw new Error("Cleaning failed");
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "✓ Data cleaned successfully",
        description: `Cleaned ${data.cleanedRows} rows with ${data.fixedIssues} issues resolved`
      });
      onCleanComplete?.();
    }
  });

  const qualityScore = dataQuality ? Math.round((dataQuality.cleanRows / dataQuality.totalRows) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Data Quality Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Data Quality Overview
            </CardTitle>
            <Badge variant={qualityScore > 80 ? "success" : qualityScore > 60 ? "secondary" : "destructive"}>
              {qualityScore}% Clean
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={qualityScore} className="mb-4" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">{dataQuality?.cleanRows || 0} clean rows</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <span className="text-sm">{dataQuality?.issues?.length || 0} issues found</span>
            </div>
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-blue-600" />
              <span className="text-sm">{dataQuality?.totalRows || 0} total rows</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Issues and Cleaning Options */}
      <Tabs defaultValue="issues" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="issues">Data Issues</TabsTrigger>
          <TabsTrigger value="clean">Clean & Transform</TabsTrigger>
        </TabsList>

        <TabsContent value="issues" className="space-y-4">
          {dataQuality?.issues?.map((issue: any, index: number) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="h-4 w-4 text-orange-600" />
                      <span className="font-medium">{issue.column}</span>
                      <Badge variant="outline">{issue.type.replace(/_/g, ' ')}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {issue.count} occurrences found
                    </p>
                    {issue.examples && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Examples: {issue.examples.slice(0, 3).join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {dataQuality?.recommendations?.length > 0 && (
            <Alert>
              <Sparkles className="h-4 w-4" />
              <AlertDescription>
                <strong>Recommendations:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  {dataQuality.recommendations.map((rec: string, i: number) => (
                    <li key={i} className="text-sm">{rec}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="clean" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5" />
                Automated Cleaning Options
              </CardTitle>
              <CardDescription>
                Select the cleaning operations to apply to your data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="fill-missing">Fill Missing Values</Label>
                  <p className="text-sm text-muted-foreground">
                    Replace empty cells with smart defaults
                  </p>
                </div>
                <Switch
                  id="fill-missing"
                  checked={cleaningOptions.fillMissing}
                  onCheckedChange={(checked) => 
                    setCleaningOptions(prev => ({ ...prev, fillMissing: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="remove-outliers">Remove Outliers</Label>
                  <p className="text-sm text-muted-foreground">
                    Filter out extreme values that may be errors
                  </p>
                </div>
                <Switch
                  id="remove-outliers"
                  checked={cleaningOptions.removeOutliers}
                  onCheckedChange={(checked) => 
                    setCleaningOptions(prev => ({ ...prev, removeOutliers: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="standardize-types">Standardize Data Types</Label>
                  <p className="text-sm text-muted-foreground">
                    Convert mixed types to consistent format
                  </p>
                </div>
                <Switch
                  id="standardize-types"
                  checked={cleaningOptions.standardizeTypes}
                  onCheckedChange={(checked) => 
                    setCleaningOptions(prev => ({ ...prev, standardizeTypes: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="remove-duplicates">Remove Duplicates</Label>
                  <p className="text-sm text-muted-foreground">
                    Keep only unique rows in your dataset
                  </p>
                </div>
                <Switch
                  id="remove-duplicates"
                  checked={cleaningOptions.removeDuplicates}
                  onCheckedChange={(checked) => 
                    setCleaningOptions(prev => ({ ...prev, removeDuplicates: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="normalize-text">Normalize Text</Label>
                  <p className="text-sm text-muted-foreground">
                    Standardize text formatting and casing
                  </p>
                </div>
                <Switch
                  id="normalize-text"
                  checked={cleaningOptions.normalizeText}
                  onCheckedChange={(checked) => 
                    setCleaningOptions(prev => ({ ...prev, normalizeText: checked }))
                  }
                />
              </div>

              <Button 
                className="w-full" 
                onClick={() => cleanDataMutation.mutate()}
                disabled={cleanDataMutation.isPending}
              >
                {cleanDataMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Clean Data
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              {cleanDataMutation.isPending && (
                <Progress value={cleaningProgress} className="mt-4" />
              )}
            </CardContent>
          </Card>

          <Alert>
            <Settings className="h-4 w-4" />
            <AlertDescription>
              <strong>Advanced Options:</strong> For more complex transformations like custom formulas, 
              pivoting, or joining multiple datasets, use the Formula Editor or contact support.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  );
}