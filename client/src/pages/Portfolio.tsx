import { AppLayout } from "@/components/Layout/AppLayout";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Building2, TrendingUp, TrendingDown, Calendar, DollarSign, Users, Target, Activity } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";

export default function Portfolio() {
  const { data: companies, isLoading } = useQuery({
    queryKey: ["/api/companies"],
  });

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  const portfolioSummary = {
    totalValue: companies?.reduce((sum: number, c: any) => sum + (c.valuation || 0), 0) || 0,
    totalRevenue: companies?.reduce((sum: number, c: any) => sum + (c.revenue || 0), 0) || 0,
    avgGrowth: companies?.reduce((sum: number, c: any) => sum + (c.growthRate || 0), 0) / (companies?.length || 1) || 0,
    totalEmployees: companies?.reduce((sum: number, c: any) => sum + (c.employees || 0), 0) || 0,
  };

  const revenueData = companies?.map((c: any) => ({
    name: c.name,
    revenue: c.revenue / 1000000,
    growth: c.growthRate,
  })) || [];

  const performanceData = [
    { month: "Jan", value: 4800, benchmark: 4200 },
    { month: "Feb", value: 5200, benchmark: 4400 },
    { month: "Mar", value: 5600, benchmark: 4600 },
    { month: "Apr", value: 5900, benchmark: 4800 },
    { month: "May", value: 6400, benchmark: 5000 },
    { month: "Jun", value: 6800, benchmark: 5200 },
  ];

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Portfolio Overview</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Monitor and analyze your investment portfolio performance
            </p>
          </div>
          <Badge variant="secondary" className="text-sm">
            Last updated: {new Date().toLocaleDateString()}
          </Badge>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${(portfolioSummary.totalValue / 1000000000).toFixed(1)}B
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+18.2%</span> from last year
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${(portfolioSummary.totalRevenue / 1000000).toFixed(0)}M
              </div>
              <p className="text-xs text-muted-foreground">
                Across {companies?.length || 0} companies
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Growth</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {portfolioSummary.avgGrowth.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Year-over-year revenue growth
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(portfolioSummary.totalEmployees / 1000).toFixed(1)}K
              </div>
              <p className="text-xs text-muted-foreground">
                Across portfolio companies
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="companies" className="space-y-4">
          <TabsList>
            <TabsTrigger value="companies">Portfolio Companies</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="companies" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {companies?.map((company: any) => (
                <Card key={company.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{company.name}</CardTitle>
                          <CardDescription>{company.industry}</CardDescription>
                        </div>
                      </div>
                      <Badge variant={company.status === "active" ? "default" : "secondary"}>
                        {company.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Revenue</span>
                        <span className="font-medium">${(company.revenue / 1000000).toFixed(0)}M</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Growth Rate</span>
                        <span className={`font-medium ${company.growthRate > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {company.growthRate > 0 ? '+' : ''}{company.growthRate}%
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Valuation</span>
                        <span className="font-medium">${(company.valuation / 1000000000).toFixed(1)}B</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">IRR</span>
                        <span className="font-medium">{company.irr || 25}%</span>
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Investment Progress</span>
                        <span className="text-muted-foreground">
                          ${((company.investmentAmount || 100) * 0.7 / 1000000).toFixed(0)}M / 
                          ${((company.investmentAmount || 100) / 1000000).toFixed(0)}M
                        </span>
                      </div>
                      <Progress value={70} className="h-2" />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Badge variant="outline" className="text-xs">
                        <Calendar className="w-3 h-3 mr-1" />
                        {company.investmentDate || "2023"}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <Target className="w-3 h-3 mr-1" />
                        {company.stage || "Series B"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Portfolio vs Benchmark Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Portfolio vs Benchmark</CardTitle>
                  <CardDescription>6-month performance comparison</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#3b82f6" 
                        fill="#3b82f6" 
                        fillOpacity={0.3}
                        name="Portfolio" 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="benchmark" 
                        stroke="#94a3b8" 
                        fill="#94a3b8" 
                        fillOpacity={0.3}
                        name="Benchmark" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Revenue by Company */}
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Distribution</CardTitle>
                  <CardDescription>Revenue by portfolio company</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="revenue" fill="#3b82f6" name="Revenue ($M)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Analytics</CardTitle>
                <CardDescription>
                  Deep dive into portfolio metrics and performance indicators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Industry Distribution */}
                  <div>
                    <h3 className="font-semibold mb-4">Industry Distribution</h3>
                    <div className="space-y-3">
                      {["Technology", "Healthcare", "Finance", "Consumer", "Energy"].map((industry, idx) => {
                        const percentage = [35, 25, 20, 15, 5][idx];
                        return (
                          <div key={industry} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>{industry}</span>
                              <span className="text-muted-foreground">{percentage}%</span>
                            </div>
                            <Progress value={percentage} className="h-2" />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Key Metrics Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">2.8x</div>
                      <div className="text-xs text-muted-foreground">Avg. Multiple</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">85%</div>
                      <div className="text-xs text-muted-foreground">Success Rate</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">4.2</div>
                      <div className="text-xs text-muted-foreground">Years Avg. Hold</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">12</div>
                      <div className="text-xs text-muted-foreground">Exits</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}