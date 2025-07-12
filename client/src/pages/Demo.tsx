import { useState } from "react";
import { AppLayout } from "@/components/Layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Pause, RefreshCw, ChevronRight, Upload, Brain, BarChart3, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DemoStep {
  id: number;
  title: string;
  description: string;
  action: () => void;
  duration: number; // in seconds
}

export default function Demo() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [demoData, setDemoData] = useState<any>(null);
  const { toast } = useToast();

  const demoSteps: DemoStep[] = [
    {
      id: 1,
      title: "Upload Sample Data",
      description: "Uploading a sample CSV file with sales data",
      duration: 2,
      action: () => {
        setDemoData({
          type: "upload",
          message: "Sample sales data uploaded successfully",
          data: {
            fileName: "Q4_2024_Sales_Data.csv",
            rowCount: 5432,
            columns: ["Date", "Product", "Revenue", "Region", "Customer"]
          }
        });
        toast({
          title: "✓ Data Uploaded",
          description: "5,432 rows imported successfully"
        });
      }
    },
    {
      id: 2,
      title: "Ask Natural Language Question",
      description: "Asking: 'Show me monthly revenue trends'",
      duration: 3,
      action: () => {
        setDemoData({
          type: "query",
          question: "Show me monthly revenue trends",
          processing: true
        });
        setTimeout(() => {
          setDemoData({
            type: "results",
            chartData: [
              { month: "Oct", revenue: 145000 },
              { month: "Nov", revenue: 168000 },
              { month: "Dec", revenue: 192000 }
            ],
            insights: [
              "Revenue grew 32% over Q4",
              "December showed strongest performance",
              "Holiday season drove 15% of annual revenue"
            ]
          });
          toast({
            title: "✓ Analysis Complete",
            description: "Generated revenue trend analysis"
          });
        }, 1500);
      }
    },
    {
      id: 3,
      title: "Generate Visualizations",
      description: "Creating interactive charts from the analysis",
      duration: 2,
      action: () => {
        setDemoData({
          type: "visualization",
          charts: ["Line Chart", "Bar Chart", "Pie Chart"],
          active: "Line Chart"
        });
        toast({
          title: "✓ Charts Created",
          description: "3 visualizations ready"
        });
      }
    },
    {
      id: 4,
      title: "Export to PowerPoint",
      description: "Generating executive presentation",
      duration: 2,
      action: () => {
        setDemoData({
          type: "export",
          format: "PowerPoint",
          slides: 12,
          status: "Generating..."
        });
        setTimeout(() => {
          setDemoData({
            type: "export",
            format: "PowerPoint",
            slides: 12,
            status: "Ready to download",
            fileName: "Q4_Revenue_Analysis.pptx"
          });
          toast({
            title: "✓ Export Ready",
            description: "PowerPoint presentation generated"
          });
        }, 1000);
      }
    }
  ];

  const runDemo = async () => {
    setIsPlaying(true);
    setCurrentStep(0);
    
    for (let i = 0; i < demoSteps.length; i++) {
      setCurrentStep(i);
      demoSteps[i].action();
      await new Promise(resolve => setTimeout(resolve, demoSteps[i].duration * 1000));
    }
    
    setIsPlaying(false);
    toast({
      title: "Demo Complete",
      description: "See how DataFlow transforms your data analysis workflow"
    });
  };

  const resetDemo = () => {
    setCurrentStep(0);
    setDemoData(null);
    setIsPlaying(false);
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Interactive Demo</h1>
            <p className="text-muted-foreground">Experience DataFlow's capabilities in action</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={isPlaying ? () => setIsPlaying(false) : runDemo}
              variant="default"
            >
              {isPlaying ? (
                <>
                  <Pause className="mr-2 h-4 w-4" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Start Demo
                </>
              )}
            </Button>
            <Button onClick={resetDemo} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>

        {/* Demo Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Demo Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {demoSteps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex items-center gap-4 p-3 rounded-lg transition-all ${
                    index === currentStep
                      ? "bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800"
                      : index < currentStep
                      ? "bg-green-50 dark:bg-green-950"
                      : "bg-gray-50 dark:bg-gray-900"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index <= currentStep
                        ? "bg-blue-600 text-white"
                        : "bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {index < currentStep ? "✓" : step.id}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{step.title}</h4>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                  {index === currentStep && isPlaying && (
                    <div className="animate-pulse">
                      <ChevronRight className="h-5 w-5 text-blue-600" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Demo Visualization */}
        {demoData && (
          <Card>
            <CardHeader>
              <CardTitle>Demo Output</CardTitle>
            </CardHeader>
            <CardContent>
              {demoData.type === "upload" && (
                <div className="bg-green-50 dark:bg-green-950 p-6 rounded-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <Upload className="h-8 w-8 text-green-600" />
                    <div>
                      <h3 className="font-semibold">{demoData.data.fileName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {demoData.data.rowCount} rows • {demoData.data.columns.length} columns
                      </p>
                    </div>
                  </div>
                  <div className="text-sm">
                    <strong>Columns:</strong> {demoData.data.columns.join(", ")}
                  </div>
                </div>
              )}

              {demoData.type === "query" && (
                <div className="bg-purple-50 dark:bg-purple-950 p-6 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Brain className="h-8 w-8 text-purple-600" />
                    <div>
                      <h3 className="font-semibold">AI Query</h3>
                      <p className="text-lg">{demoData.question}</p>
                      {demoData.processing && (
                        <p className="text-sm text-muted-foreground mt-2">Processing your request...</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {demoData.type === "results" && (
                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Revenue Trend</h4>
                    <div className="h-48 flex items-end justify-around">
                      {demoData.chartData.map((item: any, i: number) => (
                        <div key={i} className="text-center">
                          <div
                            className="w-16 bg-blue-600 rounded-t"
                            style={{ height: `${(item.revenue / 200000) * 100}%` }}
                          />
                          <p className="text-xs mt-1">{item.month}</p>
                          <p className="text-xs font-medium">${(item.revenue / 1000).toFixed(0)}k</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Key Insights</h4>
                    <ul className="space-y-1">
                      {demoData.insights.map((insight: string, i: number) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <span className="text-green-600">•</span>
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {demoData.type === "visualization" && (
                <div className="bg-orange-50 dark:bg-orange-950 p-6 rounded-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <BarChart3 className="h-8 w-8 text-orange-600" />
                    <div>
                      <h3 className="font-semibold">Visualizations Ready</h3>
                      <p className="text-sm text-muted-foreground">
                        Switch between different chart types
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {demoData.charts.map((chart: string) => (
                      <Button
                        key={chart}
                        variant={demoData.active === chart ? "default" : "outline"}
                        size="sm"
                      >
                        {chart}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {demoData.type === "export" && (
                <div className="bg-indigo-50 dark:bg-indigo-950 p-6 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Download className="h-8 w-8 text-indigo-600" />
                    <div className="flex-1">
                      <h3 className="font-semibold">{demoData.format} Export</h3>
                      <p className="text-sm text-muted-foreground">
                        {demoData.slides} slides • {demoData.status}
                      </p>
                      {demoData.fileName && (
                        <p className="text-sm font-medium mt-1">{demoData.fileName}</p>
                      )}
                    </div>
                    {demoData.status === "Ready to download" && (
                      <Button>Download</Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Natural Language</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Ask questions in plain English - no SQL knowledge required
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Instant Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                AI processes your data and generates insights in seconds
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">One-Click Export</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Export to PowerPoint, Excel, or PDF with professional formatting
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}