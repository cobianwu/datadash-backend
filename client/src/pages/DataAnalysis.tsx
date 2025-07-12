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
import { Upload, Search, BarChart3, LineChart, PieChart, RefreshCw, Download, Brain, FileText } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, LineChart as RechartsLineChart, Line, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function DataAnalysis() {
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [selectedDataSource, setSelectedDataSource] = useState<string>("");
  const [aiQuery, setAiQuery] = useState("");
  const [chartType, setChartType] = useState<"bar" | "line" | "pie">("bar");
  const [chartData, setChartData] = useState<any[]>([]);
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
        title: "✓ Data uploaded successfully",
        description: `${data.rowCount} rows imported and ready for analysis`
      });
      setUploadFile(null);
      setSelectedDataSource(data.id.toString());
      
      // Generate some sample data for visualization
      const sampleData = [
        { name: "Jan", value: 4000, category: "Sales" },
        { name: "Feb", value: 3000, category: "Sales" },
        { name: "Mar", value: 5000, category: "Sales" },
        { name: "Apr", value: 4500, category: "Sales" },
        { name: "May", value: 6000, category: "Sales" },
        { name: "Jun", value: 5500, category: "Sales" }
      ];
      setChartData(sampleData);
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
        body: JSON.stringify({ query }),
        credentials: "include"
      });
      
      if (!response.ok) throw new Error("Query failed");
      return response.json();
    },
    onSuccess: (data) => {
      // Transform the AI response into chart data
      if (data.data && data.data.length > 0) {
        setChartData(data.data);
        
        // Auto-select chart type based on data
        if (data.chartSuggestions && data.chartSuggestions.length > 0) {
          const suggestion = data.chartSuggestions[0].type;
          if (suggestion === "bar") setChartType("bar");
          else if (suggestion === "line") setChartType("line");
          else if (suggestion === "pie") setChartType("pie");
        }
      }
      
      toast({
        title: "✓ Analysis complete",
        description: `Found ${data.data?.length || 0} data points. ${data.insights?.[0] || ""}`
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
    if (aiQuery.trim()) {
      aiQueryMutation.mutate(aiQuery);
    }
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const exampleQueries = [
    "Show me monthly revenue trends",
    "What are my top 5 products by sales?",
    "Compare Q1 vs Q2 performance",
    "Which customers have the highest order value?",
    "Show me sales by region"
  ];

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Data Analysis Center</h1>
            <p className="text-muted-foreground">Upload data, analyze with AI, and create visualizations</p>
          </div>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Results
          </Button>
        </div>

        {/* Step 1: Upload Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-sm font-bold">1</div>
              Upload Your Data
            </CardTitle>
            <CardDescription>
              Start by uploading a CSV, Excel, JSON, or Parquet file (up to 100MB)
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

              {/* Show existing data sources */}
              {dataSources && dataSources.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Or select existing data:</p>
                  <Select value={selectedDataSource} onValueChange={setSelectedDataSource}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a data source" />
                    </SelectTrigger>
                    <SelectContent>
                      {dataSources.map((source: any) => (
                        <SelectItem key={source.id} value={source.id.toString()}>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            {source.name} ({source.rowCount} rows)
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Step 2: AI Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-sm font-bold">2</div>
              Ask Questions About Your Data
            </CardTitle>
            <CardDescription>
              Use natural language to analyze your data - I'll create the charts automatically
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Textarea
                placeholder="Ask a question like: 'Show me sales by month' or 'What are my top performing products?'"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                className="min-h-[80px]"
              />
              <Button 
                onClick={handleAIQuery}
                disabled={!selectedDataSource || !aiQuery.trim() || aiQueryMutation.isPending}
                className="px-8"
              >
                <Brain className="mr-2 h-4 w-4" />
                {aiQueryMutation.isPending ? "Analyzing..." : "Analyze"}
              </Button>
            </div>

            {/* Example queries */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">Try these examples:</p>
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
            </div>
          </CardContent>
        </Card>

        {/* Step 3: Visualization */}
        {chartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-sm font-bold">3</div>
                Your Data Visualization
              </CardTitle>
              <CardDescription>
                Interactive chart based on your analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={chartType} onValueChange={(v) => setChartType(v as any)}>
                <TabsList className="mb-4">
                  <TabsTrigger value="bar" className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Bar Chart
                  </TabsTrigger>
                  <TabsTrigger value="line" className="flex items-center gap-2">
                    <LineChart className="h-4 w-4" />
                    Line Chart
                  </TabsTrigger>
                  <TabsTrigger value="pie" className="flex items-center gap-2">
                    <PieChart className="h-4 w-4" />
                    Pie Chart
                  </TabsTrigger>
                </TabsList>

                <TabsContent value={chartType}>
                  <div className="h-96">
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
                    {chartType === "pie" && (
                      <RechartsPieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(entry) => entry.name}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </RechartsPieChart>
                    )}
                  </ResponsiveContainer>
                </div>

                {/* Data table */}
                <div className="mt-6">
                  <h4 className="font-medium mb-2">Data Points:</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead>
                        <tr>
                          {Object.keys(chartData[0] || {}).map((key) => (
                            <th key={key} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {chartData.slice(0, 5).map((row, i) => (
                          <tr key={i}>
                            {Object.values(row).map((value: any, j) => (
                              <td key={j} className="px-4 py-2 whitespace-nowrap text-sm">
                                {value}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {chartData.length > 5 && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Showing 5 of {chartData.length} rows
                      </p>
                    )}
                  </div>
                </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* Info about AI tools */}
        <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="text-blue-900 dark:text-blue-100">About AI Analysis Tools</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2 text-blue-800 dark:text-blue-200">
            <p><strong>This page (Data Analysis):</strong> Upload your data and ask questions in plain English. I'll analyze it and create charts automatically.</p>
            <p><strong>AI Assistant page:</strong> General business intelligence questions and strategic insights across all your data.</p>
            <p><strong>Advanced Analytics page:</strong> More complex analysis including financial modeling, forecasting, and multi-dimensional analysis.</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}