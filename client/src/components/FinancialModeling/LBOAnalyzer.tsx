import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Calculator, TrendingUp, DollarSign, Target, ArrowUpDown } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

interface LBOMetrics {
  purchasePrice: number;
  debtToEquity: number;
  exitMultiple: number;
  holdingPeriod: number;
  revenueGrowth: number;
  ebitdaMargin: number;
  taxRate: number;
}

interface LBOResults {
  moic: number;
  irr: number;
  cashOnCash: number;
  debtPaydown: number;
  equityContribution: number;
  exitValue: number;
}

export function LBOAnalyzer() {
  const [metrics, setMetrics] = useState<LBOMetrics>({
    purchasePrice: 100,
    debtToEquity: 0.6,
    exitMultiple: 8.5,
    holdingPeriod: 5,
    revenueGrowth: 0.08,
    ebitdaMargin: 0.25,
    taxRate: 0.25
  });

  const [results, setResults] = useState<LBOResults | null>(null);

  const calculateLBO = () => {
    const { purchasePrice, debtToEquity, exitMultiple, holdingPeriod, revenueGrowth, ebitdaMargin } = metrics;
    
    // Calculate equity and debt
    const totalDebt = purchasePrice * debtToEquity;
    const equityContribution = purchasePrice - totalDebt;
    
    // Project exit EBITDA and value
    const currentEbitda = purchasePrice / 8; // Assuming 8x entry multiple
    const exitEbitda = currentEbitda * Math.pow(1 + revenueGrowth, holdingPeriod);
    const exitValue = exitEbitda * exitMultiple;
    
    // Calculate debt paydown (assume 20% annual paydown)
    const remainingDebt = totalDebt * Math.pow(0.8, holdingPeriod);
    const debtPaydown = totalDebt - remainingDebt;
    
    // Calculate returns
    const totalProceeds = exitValue - remainingDebt;
    const moic = totalProceeds / equityContribution;
    const irr = Math.pow(moic, 1 / holdingPeriod) - 1;
    const cashOnCash = moic;

    setResults({
      moic,
      irr,
      cashOnCash,
      debtPaydown,
      equityContribution,
      exitValue
    });
  };

  const sensitivityData = [
    { multiple: "6.0x", moic2: 1.8, moic3: 2.1, moic4: 2.4 },
    { multiple: "7.0x", moic2: 2.1, moic3: 2.5, moic4: 2.9 },
    { multiple: "8.0x", moic2: 2.4, moic3: 2.9, moic4: 3.4 },
    { multiple: "9.0x", moic2: 2.7, moic3: 3.3, moic4: 3.9 },
    { multiple: "10.0x", moic2: 3.0, moic3: 3.7, moic4: 4.4 }
  ];

  const waterfallData = [
    { name: "Equity", value: results?.equityContribution || 0, color: "#8884d8" },
    { name: "Multiple Expansion", value: results ? (results.exitValue - metrics.purchasePrice) : 0, color: "#82ca9d" },
    { name: "Debt Paydown", value: results?.debtPaydown || 0, color: "#ffc658" },
    { name: "Total Return", value: results ? results.equityContribution * results.moic : 0, color: "#ff7300" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Calculator className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold">LBO Analysis Engine</h2>
        <Badge variant="secondary">Private Equity</Badge>
      </div>

      <Tabs defaultValue="inputs" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="inputs">Deal Inputs</TabsTrigger>
          <TabsTrigger value="results">Returns Analysis</TabsTrigger>
          <TabsTrigger value="sensitivity">Sensitivity</TabsTrigger>
          <TabsTrigger value="waterfall">Value Creation</TabsTrigger>
        </TabsList>

        <TabsContent value="inputs" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Purchase Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="purchasePrice">Purchase Price ($M)</Label>
                  <Input
                    id="purchasePrice"
                    type="number"
                    value={metrics.purchasePrice}
                    onChange={(e) => setMetrics(prev => ({ ...prev, purchasePrice: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="debtToEquity">Debt/Total Ratio</Label>
                  <Input
                    id="debtToEquity"
                    type="number"
                    step="0.1"
                    value={metrics.debtToEquity}
                    onChange={(e) => setMetrics(prev => ({ ...prev, debtToEquity: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="holdingPeriod">Holding Period (Years)</Label>
                  <Input
                    id="holdingPeriod"
                    type="number"
                    value={metrics.holdingPeriod}
                    onChange={(e) => setMetrics(prev => ({ ...prev, holdingPeriod: Number(e.target.value) }))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Growth Assumptions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="revenueGrowth">Revenue Growth (Annual %)</Label>
                  <Input
                    id="revenueGrowth"
                    type="number"
                    step="0.01"
                    value={metrics.revenueGrowth}
                    onChange={(e) => setMetrics(prev => ({ ...prev, revenueGrowth: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="ebitdaMargin">EBITDA Margin (%)</Label>
                  <Input
                    id="ebitdaMargin"
                    type="number"
                    step="0.01"
                    value={metrics.ebitdaMargin}
                    onChange={(e) => setMetrics(prev => ({ ...prev, ebitdaMargin: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="taxRate">Tax Rate (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    step="0.01"
                    value={metrics.taxRate}
                    onChange={(e) => setMetrics(prev => ({ ...prev, taxRate: Number(e.target.value) }))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Exit Assumptions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="exitMultiple">Exit Multiple (EBITDA)</Label>
                  <Input
                    id="exitMultiple"
                    type="number"
                    step="0.1"
                    value={metrics.exitMultiple}
                    onChange={(e) => setMetrics(prev => ({ ...prev, exitMultiple: Number(e.target.value) }))}
                  />
                </div>
                <Button onClick={calculateLBO} className="w-full">
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculate Returns
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="results">
          {results && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Money Multiple (MoIC)</CardTitle>
                  <CardDescription>Total return multiple</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {results.moic.toFixed(1)}x
                  </div>
                  <p className="text-sm text-gray-600">
                    ${(results.equityContribution * results.moic).toFixed(1)}M total return
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">IRR</CardTitle>
                  <CardDescription>Internal rate of return</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {(results.irr * 100).toFixed(1)}%
                  </div>
                  <p className="text-sm text-gray-600">
                    Annualized return
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Equity Contribution</CardTitle>
                  <CardDescription>Initial investment</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">
                    ${results.equityContribution.toFixed(1)}M
                  </div>
                  <p className="text-sm text-gray-600">
                    {((1 - metrics.debtToEquity) * 100).toFixed(0)}% of purchase price
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Debt Paydown</CardTitle>
                  <CardDescription>Value from deleveraging</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-600">
                    ${results.debtPaydown.toFixed(1)}M
                  </div>
                  <p className="text-sm text-gray-600">
                    {((results.debtPaydown / results.equityContribution) * 100).toFixed(0)}% of equity
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="sensitivity">
          <Card>
            <CardHeader>
              <CardTitle>Exit Multiple Sensitivity Analysis</CardTitle>
              <CardDescription>MoIC under different exit scenarios</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={sensitivityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="multiple" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="moic2" fill="#8884d8" name="2% Growth" />
                  <Bar dataKey="moic3" fill="#82ca9d" name="3% Growth" />
                  <Bar dataKey="moic4" fill="#ffc658" name="4% Growth" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="waterfall">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowUpDown className="h-5 w-5" />
                Value Creation Waterfall
              </CardTitle>
              <CardDescription>Sources of return generation</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={waterfallData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${Number(value).toFixed(1)}M`, ""]} />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}