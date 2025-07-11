import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet, TrendingUp, DollarSign, Users, Target, AlertCircle } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, ScatterChart, Scatter } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PowerPointExport } from "@/components/PowerPointExport";
import { ExcelExport } from "@/components/ExcelExport";
import { PDFExport } from "@/components/PDFExport";

// Sample data from our uploaded CSV
const revenueData = [
  { date: "2015-01", revenue: 850000, arr: 10200000, mrr: 850000 },
  { date: "2016-01", revenue: 1519000, arr: 18228000, mrr: 1519000 },
  { date: "2017-01", revenue: 2724750, arr: 32697000, mrr: 2724750 },
  { date: "2018-01", revenue: 4888800, arr: 58665600, mrr: 4888800 },
  { date: "2019-01", revenue: 8778000, arr: 105336000, mrr: 8778000 },
  { date: "2020-01", revenue: 15761000, arr: 189132000, mrr: 15761000 },
  { date: "2021-01", revenue: 28302750, arr: 339633000, mrr: 28302750 },
  { date: "2022-01", revenue: 50825250, arr: 609903000, mrr: 50825250 },
  { date: "2023-01", revenue: 91271250, arr: 1095255000, mrr: 91271250 },
  { date: "2024-01", revenue: 163910250, arr: 1966923000, mrr: 163910250 },
];

const segmentData = [
  { name: "Enterprise", value: 81955000, growth: 0.45 },
  { name: "SMB", value: 49173075, growth: 0.38 },
  { name: "Consumer", value: 32782050, growth: 0.28 },
];

const geographyData = [
  { name: "US", value: 98346150, percentage: 60 },
  { name: "Europe", value: 32782050, percentage: 20 },
  { name: "APAC", value: 16391025, percentage: 10 },
  { name: "LATAM", value: 16391025, percentage: 10 },
];

const unitEconomics = [
  { metric: "CAC", value: 255, trend: -48.2, benchmark: 400 },
  { metric: "LTV", value: 107700, trend: 62.3, benchmark: 85000 },
  { metric: "LTV/CAC", value: 422.7, trend: 214.1, benchmark: 3.0 },
  { metric: "Payback Period", value: 2.8, trend: -45.2, benchmark: 12 },
];

const cohortRetention = [
  { month: "M0", "2023-01": 100, "2023-06": 100, "2024-01": 100 },
  { month: "M1", "2023-01": 98, "2023-06": 97, "2024-01": 99 },
  { month: "M3", "2023-01": 95, "2023-06": 94, "2024-01": 97 },
  { month: "M6", "2023-01": 92, "2023-06": 91, "2024-01": 95 },
  { month: "M12", "2023-01": 88, "2023-06": 87, "2024-01": null },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export function PEDueDiligence() {
  const [timeRange, setTimeRange] = useState("10Y");

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">CloudTech SaaS - Due Diligence Analysis</h1>
          <p className="text-muted-foreground">10-Year Historical Performance & Investment Thesis</p>
        </div>
        <div className="flex gap-4">
          <ExcelExport 
            fileName="CloudTech_SaaS_Due_Diligence"
            company={{
              name: "CloudTech SaaS",
              industry: "Technology",
              revenue: 163910250,
              growthRate: 79.6,
              valuation: 4200000000,
              stage: "Series C"
            }}
            data={revenueData}
          />
          <PDFExport 
            fileName="CloudTech_SaaS_Investment_Analysis"
            company={{
              name: "CloudTech SaaS",
              industry: "Technology",
              revenue: 163910250,
              growthRate: 79.6,
              valuation: 4200000000,
              stage: "Series C"
            }}
          />
          <PowerPointExport 
            company={{
              name: "CloudTech SaaS",
              industry: "Technology",
              revenue: 163910250,
              growthRate: 79.6,
              valuation: 4200000000,
              stage: "Series C"
            }}
          />
        </div>
      </div>

      {/* Key Investment Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">ARR (2024)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1.97B</div>
            <p className="text-xs text-muted-foreground">+79.6% YoY</p>
            <div className="text-xs text-green-600 mt-1">33% CAGR (10Y)</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Gross Margin</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">100%</div>
            <p className="text-xs text-muted-foreground">Industry-leading</p>
            <div className="text-xs text-green-600 mt-1">+28pp improvement</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">NRR</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">165%</div>
            <p className="text-xs text-muted-foreground">Best-in-class</p>
            <div className="text-xs text-green-600 mt-1">Land & expand working</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Rule of 40</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">155</div>
            <p className="text-xs text-muted-foreground">Growth + Margin</p>
            <div className="text-xs text-green-600 mt-1">Exceptional efficiency</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="revenue">Revenue Analysis</TabsTrigger>
          <TabsTrigger value="segments">Segment Breakdown</TabsTrigger>
          <TabsTrigger value="unit-economics">Unit Economics</TabsTrigger>
          <TabsTrigger value="cohorts">Cohort Analysis</TabsTrigger>
          <TabsTrigger value="forecasts">Growth Forecasts</TabsTrigger>
          <TabsTrigger value="risks">Risk Assessment</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>ARR Growth Trajectory</CardTitle>
                <CardDescription>Annual Recurring Revenue (2015-2024)</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis tickFormatter={(value) => `$${(value / 1000000).toFixed(0)}M`} />
                    <Tooltip 
                      formatter={(value: number) => `$${(value / 1000000).toFixed(1)}M`}
                    />
                    <Area type="monotone" dataKey="arr" stroke="#8884d8" fill="#8884d8" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Mix by Geography</CardTitle>
                <CardDescription>Geographic revenue distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={geographyData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name} ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {geographyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `$${(value / 1000000).toFixed(1)}M`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="segments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Customer Segment</CardTitle>
              <CardDescription>Enterprise continues to drive growth</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={segmentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" orientation="left" tickFormatter={(value) => `$${(value / 1000000).toFixed(0)}M`} />
                  <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="value" fill="#8884d8" name="Revenue" />
                  <Line yAxisId="right" type="monotone" dataKey="growth" stroke="#ff7300" name="Growth Rate" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="unit-economics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Unit Economics Evolution</CardTitle>
                <CardDescription>CAC, LTV, and efficiency metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {unitEconomics.map((metric) => (
                    <div key={metric.metric} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{metric.metric}</p>
                        <p className="text-2xl font-bold">
                          {metric.metric === "CAC" ? `$${metric.value}` : 
                           metric.metric === "LTV" ? `$${metric.value.toLocaleString()}` :
                           metric.metric === "Payback Period" ? `${metric.value} months` :
                           metric.value.toFixed(1)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">vs Benchmark</p>
                        <p className={`text-lg font-semibold ${metric.value > metric.benchmark ? 'text-green-600' : 'text-red-600'}`}>
                          {((metric.value / metric.benchmark - 1) * 100).toFixed(0)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>LTV/CAC Ratio Trend</CardTitle>
                <CardDescription>Efficiency improvement over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={[
                    { year: "2019", ratio: 3.2 },
                    { year: "2020", ratio: 5.8 },
                    { year: "2021", ratio: 12.4 },
                    { year: "2022", ratio: 89.2 },
                    { year: "2023", ratio: 276.5 },
                    { year: "2024", ratio: 422.7 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="ratio" stroke="#8884d8" strokeWidth={2} />
                    <Line type="monotone" dataKey={() => 3} stroke="#ff0000" strokeDasharray="5 5" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cohorts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cohort Retention Analysis</CardTitle>
              <CardDescription>Monthly retention by cohort</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={cohortRetention}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `${value}%`} />
                  <Tooltip formatter={(value: number) => `${value}%`} />
                  <Legend />
                  <Line type="monotone" dataKey="2023-01" stroke="#8884d8" name="Jan 2023 Cohort" />
                  <Line type="monotone" dataKey="2023-06" stroke="#82ca9d" name="Jun 2023 Cohort" />
                  <Line type="monotone" dataKey="2024-01" stroke="#ffc658" name="Jan 2024 Cohort" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecasts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Forecast & Scenarios</CardTitle>
              <CardDescription>3-year projections with sensitivity analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={[
                  { year: "2024", base: 280, bear: 280, bull: 280 },
                  { year: "2025", base: 420, bear: 364, bull: 476 },
                  { year: "2026", base: 630, bear: 473, bull: 833 },
                  { year: "2027", base: 945, bear: 615, bull: 1458 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis tickFormatter={(value) => `$${value}M`} />
                  <Tooltip formatter={(value: number) => `$${value}M`} />
                  <Legend />
                  <Area type="monotone" dataKey="bull" stackId="1" stroke="#82ca9d" fill="#82ca9d" name="Bull Case (75% growth)" />
                  <Area type="monotone" dataKey="base" stackId="2" stroke="#8884d8" fill="#8884d8" name="Base Case (50% growth)" />
                  <Area type="monotone" dataKey="bear" stackId="3" stroke="#ffc658" fill="#ffc658" name="Bear Case (30% growth)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risks" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Risk Matrix</CardTitle>
                <CardDescription>Key investment risks and mitigations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg bg-red-50">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <span className="font-medium">Market Saturation</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Enterprise segment showing signs of maturity</p>
                    <p className="text-xs text-green-600 mt-1">Mitigation: International expansion + SMB focus</p>
                  </div>
                  <div className="p-3 border rounded-lg bg-yellow-50">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <span className="font-medium">Competition</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">New entrants with AI-native solutions</p>
                    <p className="text-xs text-green-600 mt-1">Mitigation: R&D investment + acquisition strategy</p>
                  </div>
                  <div className="p-3 border rounded-lg bg-blue-50">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">Regulatory</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Data privacy regulations in EU/APAC</p>
                    <p className="text-xs text-green-600 mt-1">Mitigation: Compliance team + local partnerships</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Investment Thesis Summary</CardTitle>
                <CardDescription>Key value drivers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm">33% revenue CAGR with improving margins</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="text-sm">LTV/CAC of 422x (world-class efficiency)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-green-600" />
                    <span className="text-sm">165% NRR with &lt;0.0004% churn</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Clear path to $1B ARR by 2026</span>
                  </div>
                  <div className="mt-4 p-3 bg-green-50 rounded-lg">
                    <p className="font-medium text-green-900">Recommended Action</p>
                    <p className="text-sm text-green-700">Proceed to final due diligence at 15-20x ARR valuation</p>
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