import { useState } from "react";
import { AppLayout } from "@/components/Layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { 
  Upload, Search, BarChart3, LineChart, PieChart, RefreshCw, Download, Brain, FileText, 
  TrendingUp, AlertCircle, CheckCircle, FileSpreadsheet, FileDown, Presentation,
  Activity, Database, Sparkles, AlertTriangle, ArrowUpRight, ArrowDownRight
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { 
  BarChart, Bar, LineChart as RechartsLineChart, Line, PieChart as RechartsPieChart, 
  Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  AreaChart, Area, ScatterChart, Scatter, RadarChart, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis, Radar, Treemap
} from "recharts";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { DataCleaner } from "@/components/DataCleaner";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export default function DataAnalysis() {
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [selectedDataSource, setSelectedDataSource] = useState<string>("");
  const [aiQuery, setAiQuery] = useState("");
  const [chartType, setChartType] = useState<string>("bar");
  const [chartData, setChartData] = useState<any[]>([]);
  const [dataQuality, setDataQuality] = useState<any>(null);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("upload");
  const [trendResults, setTrendResults] = useState<any>(null);
  const { toast } = useToast();

  // Fetch data sources
  const { data: dataSources, isLoading: sourcesLoading } = useQuery({
    queryKey: ["/api/data-sources"],
  });

  // Upload mutation
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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/data-sources"] });
      toast({
        title: "✓ Data uploaded and analyzed",
        description: `${data.rowCount} rows processed with ${data.dataQuality?.cleanRows || 0} clean records`
      });
      setUploadFile(null);
      setSelectedDataSource(data.id.toString());
      
      // Set data quality info
      if (data.dataQuality) {
        setDataQuality(data.dataQuality);
      }
      
      // Set analysis insights
      if (data.analysis) {
        setAnalysisResults(data.analysis);
      }
      
      // Generate chart data if available
      if (data.sampleData && data.sampleData.length > 0) {
        setChartData(data.sampleData);
      }
      
      // Move to clean tab to allow data cleaning first
      setActiveTab("clean");
    },
    onError: () => {
      toast({
        title: "Upload failed",
        description: "There was an error uploading your file",
        variant: "destructive"
      });
    }
  });

  // AI Query mutation
  const aiQueryMutation = useMutation({
    mutationFn: async (query: string) => {
      const response = await fetch("/api/ai/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          query,
          dataSourceId: selectedDataSource ? parseInt(selectedDataSource) : null 
        }),
        credentials: "include"
      });
      
      if (!response.ok) throw new Error("Query failed");
      return response.json();
    },
    onSuccess: (data) => {
      // Use chart data from the response
      if (data.chartData) {
        setChartData(data.chartData);
      } else if (data.data && data.data.length > 0) {
        setChartData(data.data);
      }
      
      // Auto-select chart type based on recommendations
      if (data.chartSuggestions && data.chartSuggestions.length > 0) {
        setChartType(data.chartSuggestions[0].type);
      }
      
      toast({
        title: "✓ Analysis complete",
        description: data.queryExplanation || `Found ${data.data?.length || 0} data points`
      });
    },
    onError: () => {
      toast({
        title: "Analysis failed",
        description: "There was an error processing your query",
        variant: "destructive"
      });
    }
  });

  // Data quality analysis
  const qualityMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/analytics/data-quality", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataSourceId: parseInt(selectedDataSource) }),
        credentials: "include"
      });
      
      if (!response.ok) throw new Error("Quality analysis failed");
      return response.json();
    },
    onSuccess: (data) => {
      setDataQuality(data);
      toast({
        title: "✓ Data quality assessed",
        description: `${data.cleanRows} of ${data.totalRows} rows are clean`
      });
    }
  });

  // Comprehensive analysis mutation
  const analysisMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/analytics/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataSourceId: parseInt(selectedDataSource) }),
        credentials: "include"
      });
      
      if (!response.ok) throw new Error("Analysis failed");
      return response.json();
    },
    onSuccess: (data) => {
      setAnalysisResults(data);
      toast({
        title: "✓ Advanced analysis complete",
        description: `Found ${data.insights?.length || 0} key insights and ${Object.keys(data.correlations || {}).length} correlations`
      });
    }
  });

  // Trend detection mutation
  const trendMutation = useMutation({
    mutationFn: async (params: { timeColumn: string; valueColumn: string }) => {
      const response = await fetch("/api/analytics/trends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          dataSourceId: parseInt(selectedDataSource),
          ...params 
        }),
        credentials: "include"
      });
      
      if (!response.ok) throw new Error("Trend analysis failed");
      return response.json();
    },
    onSuccess: (data) => {
      setTrendResults(data);
      toast({
        title: "✓ Trend analysis complete",
        description: `Trend: ${data.trend} (${data.changePercent.toFixed(1)}% change)`
      });
    }
  });

  // Export mutations
  const exportExcel = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/export/excel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          dataSourceId: parseInt(selectedDataSource),
          includeAnalysis: true 
        }),
        credentials: "include"
      });
      
      if (!response.ok) throw new Error("Export failed");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dataflow_analysis_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
      a.click();
    },
    onSuccess: () => {
      toast({
        title: "✓ Excel export complete",
        description: "Full analysis with pivot tables downloaded"
      });
    }
  });

  const exportPDF = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/export/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          dataSourceId: parseInt(selectedDataSource),
          includeAnalysis: true 
        }),
        credentials: "include"
      });
      
      if (!response.ok) throw new Error("Export failed");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dataflow_report_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      a.click();
    },
    onSuccess: () => {
      toast({
        title: "✓ PDF report generated",
        description: "Professional report with insights downloaded"
      });
    }
  });

  const exportPowerPoint = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/export/powerpoint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          dataSourceId: parseInt(selectedDataSource),
          charts: [{ type: chartType, data: chartData, title: "Analysis Results" }],
          insights: analysisResults?.insights
        }),
        credentials: "include"
      });
      
      if (!response.ok) throw new Error("Export failed");
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "✓ PowerPoint data ready",
        description: `${data.slides?.length || 0} slides prepared for presentation`
      });
      console.log("PowerPoint structure:", data);
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

  const handleAIQuery = () => {
    if (aiQuery.trim() && selectedDataSource) {
      aiQueryMutation.mutate(aiQuery);
    }
  };

  const exampleQueries = [
    "Show revenue trends over time",
    "What are my top 10 customers?",
    "Compare sales by region",
    "Analyze monthly growth rates",
    "Find correlations in my data"
  ];

  const renderChart = () => {
    if (!chartData || chartData.length === 0) return null;

    // For most charts, we expect data with 'name' and 'value' properties
    // For scatter, we'll use the actual column names
    const isScatterData = chartType === "scatter" && chartData[0] && !chartData[0].hasOwnProperty('value');
    
    return (
      <ResponsiveContainer width="100%" height="100%">
        {chartType === "bar" && (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#3b82f6" />
          </BarChart>
        )}
        {chartType === "line" && (
          <RechartsLineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} />
          </RechartsLineChart>
        )}
        {chartType === "area" && (
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
          </AreaChart>
        )}
        {chartType === "pie" && (
          <RechartsPieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(entry) => entry.name || entry[Object.keys(entry)[0]]}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </RechartsPieChart>
        )}
        {chartType === "scatter" && (
          <ScatterChart>
            <CartesianGrid />
            <XAxis 
              type="number" 
              dataKey={isScatterData ? Object.keys(chartData[0])[0] : "name"}
              name={isScatterData ? Object.keys(chartData[0])[0] : "name"}
            />
            <YAxis 
              type="number" 
              dataKey={isScatterData ? Object.keys(chartData[0])[1] : "value"}
              name={isScatterData ? Object.keys(chartData[0])[1] : "value"}
            />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Scatter name="Data" data={chartData} fill="#3b82f6" />
          </ScatterChart>
        )}
        {chartType === "treemap" && (
          <Treemap
            data={chartData}
            dataKey="value"
            ratio={4 / 3}
            stroke="#fff"
            fill="#3b82f6"
          />
        )}
      </ResponsiveContainer>
    );
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Advanced Data Analysis</h1>
          <p className="text-muted-foreground mt-2">
            Upload data, ask questions in plain English, and get instant insights with auto-generated visualizations
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full max-w-3xl">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="clean" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Clean
            </TabsTrigger>
            <TabsTrigger value="analyze" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Analyze
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Insights
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload Your Data</CardTitle>
                <CardDescription>
                  Support for CSV, Excel, JSON, and Parquet files up to 100MB
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                    {uploadMutation.isPending ? "Processing..." : "Upload & Analyze"}
                  </Button>
                </div>

                {dataQuality && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Data Quality: {dataQuality.cleanRows}/{dataQuality.totalRows} clean rows 
                      ({((dataQuality.cleanRows/dataQuality.totalRows) * 100).toFixed(1)}%)
                      {dataQuality.issues > 0 && ` - ${dataQuality.issues} issues found`}
                    </AlertDescription>
                  </Alert>
                )}

                {dataSources && dataSources.length > 0 && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-2">Select a data source to work with:</p>
                      <Select value={selectedDataSource} onValueChange={(value) => {
                        setSelectedDataSource(value);
                        // Clear previous states when switching data sources
                        setDataQuality(null);
                        setChartData([]);
                        setAnalysisResults(null);
                      }}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Choose a data source" />
                        </SelectTrigger>
                        <SelectContent>
                          {dataSources.map((source: any) => (
                            <SelectItem key={source.id} value={source.id.toString()}>
                              <div className="flex items-center gap-2">
                                <Database className="h-4 w-4" />
                                {source.name} ({source.rowCount} rows)
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {selectedDataSource && (
                      <Alert className="bg-blue-50 border-blue-200">
                        <CheckCircle className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-blue-800">
                          Selected: {dataSources.find((s: any) => s.id.toString() === selectedDataSource)?.name}
                          <br />
                          <span className="text-sm">You can now clean, analyze, or export this data</span>
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="clean" className="space-y-6">
            {selectedDataSource ? (
              <DataCleaner 
                dataSourceId={parseInt(selectedDataSource)} 
                dataQuality={dataQuality}
                onCleanComplete={() => {
                  queryClient.invalidateQueries({ queryKey: ["/api/data-sources"] });
                  setActiveTab("analyze");
                }}
              />
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <Database className="h-12 w-12 mx-auto text-muted-foreground" />
                    <h3 className="text-lg font-medium">No Data Selected</h3>
                    <p className="text-sm text-muted-foreground">
                      Upload a file or select an existing data source to start cleaning and organizing your data
                    </p>
                    <Button onClick={() => setActiveTab("upload")} variant="outline">
                      Go to Upload
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="analyze" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Natural Language Analysis</CardTitle>
                <CardDescription>
                  Ask questions about your data and get instant visualizations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Ask anything: 'Show monthly revenue trends' or 'Compare top products by region'"
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    className="min-h-[100px]"
                  />
                  <Button 
                    onClick={handleAIQuery}
                    disabled={!selectedDataSource || !aiQuery.trim() || aiQueryMutation.isPending}
                    className="px-8"
                  >
                    <Search className="mr-2 h-4 w-4" />
                    {aiQueryMutation.isPending ? "Analyzing..." : "Analyze"}
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {exampleQueries.map((example, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      size="sm"
                      onClick={() => setAiQuery(example)}
                    >
                      {example}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {chartData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Visualization</CardTitle>
                  <div className="flex gap-2 mt-2">
                    {["bar", "line", "area", "pie", "scatter", "treemap"].map((type) => (
                      <Button
                        key={type}
                        variant={chartType === type ? "default" : "outline"}
                        size="sm"
                        onClick={() => setChartType(type)}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Button>
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-96">
                    {renderChart()}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Comprehensive Analysis
                    <Button
                      size="sm"
                      onClick={() => analysisMutation.mutate()}
                      disabled={!selectedDataSource || analysisMutation.isPending}
                    >
                      <RefreshCw className={`mr-2 h-4 w-4 ${analysisMutation.isPending ? 'animate-spin' : ''}`} />
                      {analysisMutation.isPending ? "Analyzing..." : "Run Analysis"}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analysisResults && (
                    <div className="space-y-6">
                      {/* Summary Stats */}
                      <div className="grid grid-cols-4 gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold">{analysisResults.summary?.totalRows || 0}</p>
                          <p className="text-sm text-muted-foreground">Total Rows</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold">{analysisResults.summary?.numericColumns?.length || 0}</p>
                          <p className="text-sm text-muted-foreground">Numeric Columns</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold">{analysisResults.summary?.categoricalColumns?.length || 0}</p>
                          <p className="text-sm text-muted-foreground">Category Columns</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold">{Object.keys(analysisResults.correlations || {}).length}</p>
                          <p className="text-sm text-muted-foreground">Correlations</p>
                        </div>
                      </div>

                      <Separator />

                      {/* Key Insights */}
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Sparkles className="h-4 w-4" />
                          Key Insights
                        </h4>
                        <div className="space-y-2">
                          {analysisResults.insights?.map((insight: string, i: number) => (
                            <Alert key={i}>
                              <CheckCircle className="h-4 w-4" />
                              <AlertDescription>{insight}</AlertDescription>
                            </Alert>
                          ))}
                        </div>
                      </div>

                      {/* Recommendations */}
                      {analysisResults.recommendations?.length > 0 && (
                        <>
                          <Separator />
                          <div>
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                              <TrendingUp className="h-4 w-4" />
                              Recommendations
                            </h4>
                            <div className="space-y-2">
                              {analysisResults.recommendations.map((rec: string, i: number) => (
                                <div key={i} className="flex items-start gap-2">
                                  <Badge variant="outline" className="mt-0.5">
                                    {i + 1}
                                  </Badge>
                                  <p className="text-sm">{rec}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Trend Analysis */}
              {analysisResults?.summary?.dateColumns?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Trend Detection
                      <Select onValueChange={(value) => {
                        const [timeCol, valueCol] = value.split('|');
                        trendMutation.mutate({ timeColumn: timeCol, valueColumn: valueCol });
                      }}>
                        <SelectTrigger className="w-64">
                          <SelectValue placeholder="Select columns for trend analysis" />
                        </SelectTrigger>
                        <SelectContent>
                          {analysisResults.summary.dateColumns.map((dateCol: string) => (
                            analysisResults.summary.numericColumns.map((numCol: string) => (
                              <SelectItem key={`${dateCol}|${numCol}`} value={`${dateCol}|${numCol}`}>
                                {dateCol} vs {numCol}
                              </SelectItem>
                            ))
                          ))}
                        </SelectContent>
                      </Select>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {trendResults && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <Badge variant={trendResults.trend === 'increasing' ? 'default' : trendResults.trend === 'decreasing' ? 'destructive' : 'secondary'}>
                            {trendResults.trend === 'increasing' ? <ArrowUpRight className="h-3 w-3 mr-1" /> : 
                             trendResults.trend === 'decreasing' ? <ArrowDownRight className="h-3 w-3 mr-1" /> : null}
                            {trendResults.trend}
                          </Badge>
                          <span className="text-lg font-semibold">
                            {trendResults.changePercent > 0 ? '+' : ''}{trendResults.changePercent.toFixed(1)}% change
                          </span>
                          {trendResults.seasonality && (
                            <Badge variant="outline">Seasonal Pattern Detected</Badge>
                          )}
                        </div>
                        {trendResults.forecast && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-2">Forecast (next 3 periods):</p>
                            <div className="flex gap-4">
                              {trendResults.forecast.map((value: number, i: number) => (
                                <div key={i} className="text-center">
                                  <p className="font-semibold">{value.toFixed(0)}</p>
                                  <p className="text-xs text-muted-foreground">Period {i + 1}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="export" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Export Your Analysis</CardTitle>
                <CardDescription>
                  Download your data and insights in multiple formats
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <Button
                    onClick={() => exportExcel.mutate()}
                    disabled={!selectedDataSource || exportExcel.isPending}
                    className="h-24 flex-col gap-2"
                    variant="outline"
                  >
                    <FileSpreadsheet className="h-8 w-8" />
                    <span>Excel</span>
                    <span className="text-xs text-muted-foreground">With pivot tables</span>
                  </Button>
                  
                  <Button
                    onClick={() => exportPDF.mutate()}
                    disabled={!selectedDataSource || exportPDF.isPending}
                    className="h-24 flex-col gap-2"
                    variant="outline"
                  >
                    <FileText className="h-8 w-8" />
                    <span>PDF Report</span>
                    <span className="text-xs text-muted-foreground">Professional format</span>
                  </Button>
                  
                  <Button
                    onClick={() => exportPowerPoint.mutate()}
                    disabled={!selectedDataSource || exportPowerPoint.isPending}
                    className="h-24 flex-col gap-2"
                    variant="outline"
                  >
                    <Presentation className="h-8 w-8" />
                    <span>PowerPoint</span>
                    <span className="text-xs text-muted-foreground">Ready to present</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}