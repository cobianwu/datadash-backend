import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  ScatterChart,
  Scatter
} from "recharts";
import { 
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  Target, 
  Brain,
  Zap,
  BarChart3
} from "lucide-react";

interface ForecastData {
  period: string;
  actual?: number;
  forecast: number;
  lower: number;
  upper: number;
  confidence: number;
}

interface AnomalyData {
  company: string;
  metric: string;
  current: number;
  expected: number;
  deviation: number;
  severity: "low" | "medium" | "high";
  trend: "improving" | "declining" | "stable";
}

interface ForecastEngineProps {
  dataSourceId: string;
}

export function ForecastEngine({ dataSourceId }: ForecastEngineProps) {
  const [selectedCompany, setSelectedCompany] = useState("techcorp");
  const [selectedMetric, setSelectedMetric] = useState("revenue");
  const [forecastHorizon, setForecastHorizon] = useState("12");

  const revenueData: ForecastData[] = [
    { period: "2021 Q1", actual: 45, forecast: 45, lower: 43, upper: 47, confidence: 0.95 },
    { period: "2021 Q2", actual: 48, forecast: 47, lower: 45, upper: 49, confidence: 0.93 },
    { period: "2021 Q3", actual: 52, forecast: 50, lower: 48, upper: 52, confidence: 0.91 },
    { period: "2021 Q4", actual: 58, forecast: 53, lower: 51, upper: 55, confidence: 0.89 },
    { period: "2022 Q1", actual: 62, forecast: 56, lower: 54, upper: 58, confidence: 0.87 },
    { period: "2022 Q2", actual: 67, forecast: 60, lower: 57, upper: 63, confidence: 0.85 },
    { period: "2022 Q3", actual: 71, forecast: 64, lower: 61, upper: 67, confidence: 0.83 },
    { period: "2022 Q4", actual: 75, forecast: 68, lower: 65, upper: 71, confidence: 0.81 },
    { period: "2023 Q1", forecast: 72, lower: 68, upper: 76, confidence: 0.79 },
    { period: "2023 Q2", forecast: 76, lower: 71, upper: 81, confidence: 0.77 },
    { period: "2023 Q3", forecast: 81, lower: 75, upper: 87, confidence: 0.75 },
    { period: "2023 Q4", forecast: 86, lower: 79, upper: 93, confidence: 0.73 },
  ];

  const anomalies: AnomalyData[] = [
    {
      company: "TechCorp",
      metric: "Revenue Growth",
      current: 0.15,
      expected: 0.22,
      deviation: -0.07,
      severity: "high",
      trend: "declining"
    },
    {
      company: "MedDevice", 
      metric: "EBITDA Margin",
      current: 0.18,
      expected: 0.20,
      deviation: -0.02,
      severity: "medium",
      trend: "stable"
    },
    {
      company: "FinTech",
      metric: "Customer Churn",
      current: 0.08,
      expected: 0.05,
      deviation: 0.03,
      severity: "high",
      trend: "declining"
    },
    {
      company: "RetailChain",
      metric: "Same Store Sales",
      current: 0.03,
      expected: 0.07,
      deviation: -0.04,
      severity: "medium",
      trend: "declining"
    }
  ];

  const correlationData = [
    { metric1: 45, metric2: 32, company: "TechCorp" },
    { metric1: 52, metric2: 28, company: "DataSoft" },
    { metric1: 38, metric2: 42, company: "MedDevice" },
    { metric1: 67, metric2: 51, company: "FinTech" },
    { metric1: 41, metric2: 35, company: "AutoParts" },
    { metric1: 59, metric2: 44, company: "CloudCo" },
    { metric1: 33, metric2: 29, company: "ChemCorp" },
    { metric1: 71, metric2: 63, company: "BrandCo" }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "text-red-600 bg-red-50 border-red-200";
      case "medium": return "text-orange-600 bg-orange-50 border-orange-200";
      case "low": return "text-yellow-600 bg-yellow-50 border-yellow-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "improving": return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "declining": return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Target className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Sparkles className="h-6 w-6 text-indigo-600" />
        <h2 className="text-2xl font-bold">Predictive Analytics Engine</h2>
        <Badge variant="secondary">AI-Powered</Badge>
      </div>

      <Tabs defaultValue="forecasting" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="forecasting">Revenue Forecasting</TabsTrigger>
          <TabsTrigger value="anomalies">Anomaly Detection</TabsTrigger>
          <TabsTrigger value="correlations">Pattern Analysis</TabsTrigger>
          <TabsTrigger value="scenarios">Scenario Planning</TabsTrigger>
        </TabsList>

        <TabsContent value="forecasting" className="space-y-4">
          <div className="flex gap-4 mb-4">
            <Select value={selectedCompany} onValueChange={setSelectedCompany}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select company" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="techcorp">TechCorp</SelectItem>
                <SelectItem value="meddevice">MedDevice</SelectItem>
                <SelectItem value="fintech">FinTech</SelectItem>
                <SelectItem value="retailchain">RetailChain</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedMetric} onValueChange={setSelectedMetric}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select metric" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="revenue">Revenue</SelectItem>
                <SelectItem value="ebitda">EBITDA</SelectItem>
                <SelectItem value="margin">EBITDA Margin</SelectItem>
                <SelectItem value="growth">Growth Rate</SelectItem>
              </SelectContent>
            </Select>

            <Select value={forecastHorizon} onValueChange={setForecastHorizon}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Forecast horizon" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6">6 Months</SelectItem>
                <SelectItem value="12">12 Months</SelectItem>
                <SelectItem value="24">24 Months</SelectItem>
                <SelectItem value="36">36 Months</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Revenue Forecast with Confidence Intervals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      `$${Number(value).toFixed(1)}M`,
                      name === "forecast" ? "Forecast" : 
                      name === "actual" ? "Actual" :
                      name === "upper" ? "Upper Bound" : "Lower Bound"
                    ]}
                  />
                  <Area
                    dataKey="upper"
                    stackId="1"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.1}
                  />
                  <Area
                    dataKey="lower"
                    stackId="1"
                    stroke="#8884d8"
                    fill="#ffffff"
                    fillOpacity={1}
                  />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    stroke="#2563eb"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="forecast"
                    stroke="#dc2626"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ r: 3 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Forecast Accuracy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">94.2%</div>
                <p className="text-sm text-gray-600">12-month rolling accuracy</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Next Quarter Prediction</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">$86.4M</div>
                <p className="text-sm text-gray-600">Range: $79M - $93M</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Growth Trajectory</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">+18.7%</div>
                <p className="text-sm text-gray-600">Predicted annual growth</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="anomalies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Performance Anomalies Detected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {anomalies.map((anomaly, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${getSeverityColor(anomaly.severity)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{anomaly.company}</h3>
                          <Badge variant="outline" className="text-xs">
                            {anomaly.metric}
                          </Badge>
                          {getTrendIcon(anomaly.trend)}
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Current:</span> {(anomaly.current * 100).toFixed(1)}%
                          </div>
                          <div>
                            <span className="font-medium">Expected:</span> {(anomaly.expected * 100).toFixed(1)}%
                          </div>
                          <div>
                            <span className="font-medium">Deviation:</span> {(anomaly.deviation * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                      <Badge variant={anomaly.severity === "high" ? "destructive" : "secondary"}>
                        {anomaly.severity.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="font-medium text-blue-900">TechCorp Revenue Issue</div>
                  <div className="text-sm text-blue-700">Consider market expansion or pricing optimization</div>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <div className="font-medium text-orange-900">FinTech Churn Alert</div>
                  <div className="text-sm text-orange-700">Implement customer retention program immediately</div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="font-medium text-purple-900">RetailChain Opportunity</div>
                  <div className="text-sm text-purple-700">Digital transformation could boost same-store sales</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Action Items
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-2 border rounded">
                  <span className="text-sm">Deep dive on TechCorp metrics</span>
                  <Button size="sm" variant="outline">Schedule</Button>
                </div>
                <div className="flex items-center justify-between p-2 border rounded">
                  <span className="text-sm">Review FinTech customer data</span>
                  <Button size="sm" variant="outline">Assign</Button>
                </div>
                <div className="flex items-center justify-between p-2 border rounded">
                  <span className="text-sm">Benchmark retail performance</span>
                  <Button size="sm" variant="outline">Research</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="correlations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue vs. Marketing Spend Correlation</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart data={correlationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="metric1" name="Revenue ($M)" />
                  <YAxis dataKey="metric2" name="Marketing Spend ($M)" />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }}
                    formatter={(value, name) => [
                      `$${Number(value).toFixed(1)}M`,
                      name === "metric1" ? "Revenue" : "Marketing Spend"
                    ]}
                  />
                  <Scatter dataKey="metric2" fill="#8884d8" />
                </ScatterChart>
              </ResponsiveContainer>
              <div className="mt-4 text-center">
                <Badge variant="secondary">Correlation Coefficient: 0.87 (Strong Positive)</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scenarios" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-green-600">Bull Case Scenario</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Revenue Growth:</span>
                    <span className="font-bold">+25%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>EBITDA Margin:</span>
                    <span className="font-bold">28%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Exit Multiple:</span>
                    <span className="font-bold">12x</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span>Portfolio IRR:</span>
                    <span className="font-bold text-green-600">35.2%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-blue-600">Base Case Scenario</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Revenue Growth:</span>
                    <span className="font-bold">+15%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>EBITDA Margin:</span>
                    <span className="font-bold">22%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Exit Multiple:</span>
                    <span className="font-bold">8.5x</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span>Portfolio IRR:</span>
                    <span className="font-bold text-blue-600">22.7%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-red-600">Bear Case Scenario</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Revenue Growth:</span>
                    <span className="font-bold">+5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>EBITDA Margin:</span>
                    <span className="font-bold">18%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Exit Multiple:</span>
                    <span className="font-bold">6x</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span>Portfolio IRR:</span>
                    <span className="font-bold text-red-600">12.1%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}