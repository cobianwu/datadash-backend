import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface HeatmapData {
  company: string;
  sector: string;
  revenue: number;
  ebitda: number;
  growth: number;
  margin: number;
  roic: number;
}

interface HeatmapChartProps {
  data?: HeatmapData[];
  title?: string;
  metric?: "growth" | "margin" | "roic" | "revenue";
}

export function HeatmapChart({ 
  data = mockData, 
  title = "Portfolio Performance Heatmap",
  metric = "growth"
}: HeatmapChartProps) {
  
  const getMetricValue = (item: HeatmapData) => {
    switch (metric) {
      case "growth": return item.growth;
      case "margin": return item.margin;
      case "roic": return item.roic;
      case "revenue": return item.revenue;
      default: return item.growth;
    }
  };

  const getColorIntensity = (value: number, min: number, max: number) => {
    const normalizedValue = (value - min) / (max - min);
    if (normalizedValue > 0.7) return "bg-green-600 text-white";
    if (normalizedValue > 0.4) return "bg-green-400 text-white";
    if (normalizedValue > 0.1) return "bg-yellow-400 text-black";
    if (normalizedValue > -0.1) return "bg-orange-400 text-white";
    return "bg-red-600 text-white";
  };

  const getTrendIcon = (value: number) => {
    if (value > 0.05) return <TrendingUp className="h-4 w-4" />;
    if (value < -0.05) return <TrendingDown className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };

  const values = data.map(getMetricValue);
  const min = Math.min(...values);
  const max = Math.max(...values);

  const sectors = Array.from(new Set(data.map(item => item.sector)));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {title}
            <Badge variant="secondary" className="capitalize">
              {metric} Analysis
            </Badge>
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {sectors.map(sector => {
            const sectorCompanies = data.filter(item => item.sector === sector);
            return (
              <div key={sector} className="space-y-2">
                <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200 border-b pb-1">
                  {sector}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
                  {sectorCompanies.map((company, index) => {
                    const value = getMetricValue(company);
                    const colorClass = getColorIntensity(value, min, max);
                    const formattedValue = metric === "revenue" 
                      ? `$${value.toFixed(0)}M`
                      : `${(value * 100).toFixed(1)}%`;
                    
                    return (
                      <div
                        key={`${company.company}-${index}`}
                        className={`p-3 rounded-lg text-center transition-all hover:scale-105 cursor-pointer ${colorClass}`}
                      >
                        <div className="font-medium text-sm mb-1">{company.company}</div>
                        <div className="flex items-center justify-center gap-1 text-xs">
                          {getTrendIcon(value)}
                          <span className="font-bold">{formattedValue}</span>
                        </div>
                        {metric !== "revenue" && (
                          <div className="text-xs opacity-75 mt-1">
                            ${company.revenue.toFixed(0)}M rev
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-600 rounded"></div>
                <span>Underperforming</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-400 rounded"></div>
                <span>Average</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-600 rounded"></div>
                <span>Outperforming</span>
              </div>
            </div>
            <div>
              Range: {metric === "revenue" ? `$${min.toFixed(0)}M - $${max.toFixed(0)}M` : `${(min * 100).toFixed(1)}% - ${(max * 100).toFixed(1)}%`}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const mockData: HeatmapData[] = [
  // Technology
  { company: "TechCorp", sector: "Technology", revenue: 145, ebitda: 36, growth: 0.28, margin: 0.25, roic: 0.18 },
  { company: "DataSoft", sector: "Technology", revenue: 89, ebitda: 27, growth: 0.35, margin: 0.30, roic: 0.22 },
  { company: "CloudCo", sector: "Technology", revenue: 203, ebitda: 51, growth: 0.22, margin: 0.25, roic: 0.16 },
  { company: "DevTools", sector: "Technology", revenue: 67, ebitda: 14, growth: 0.42, margin: 0.21, roic: 0.25 },
  
  // Healthcare
  { company: "MedDevice", sector: "Healthcare", revenue: 234, ebitda: 47, growth: 0.12, margin: 0.20, roic: 0.14 },
  { company: "BioPharma", sector: "Healthcare", revenue: 156, ebitda: 39, growth: 0.18, margin: 0.25, roic: 0.16 },
  { company: "HealthTech", sector: "Healthcare", revenue: 98, ebitda: 22, growth: 0.31, margin: 0.22, roic: 0.19 },
  
  // Manufacturing
  { company: "AutoParts", sector: "Manufacturing", revenue: 312, ebitda: 43, growth: 0.08, margin: 0.14, roic: 0.11 },
  { company: "AeroSpace", sector: "Manufacturing", revenue: 445, ebitda: 67, growth: 0.06, margin: 0.15, roic: 0.09 },
  { company: "ChemCorp", sector: "Manufacturing", revenue: 189, ebitda: 28, growth: 0.11, margin: 0.15, roic: 0.12 },
  { company: "MetalWorks", sector: "Manufacturing", revenue: 267, ebitda: 35, growth: 0.04, margin: 0.13, roic: 0.08 },
  
  // Consumer
  { company: "BrandCo", sector: "Consumer", revenue: 178, ebitda: 32, growth: 0.15, margin: 0.18, roic: 0.13 },
  { company: "RetailChain", sector: "Consumer", revenue: 567, ebitda: 85, growth: 0.09, margin: 0.15, roic: 0.10 },
  { company: "FoodBrand", sector: "Consumer", revenue: 134, ebitda: 24, growth: 0.07, margin: 0.18, roic: 0.11 },
  
  // Financial Services
  { company: "FinTech", sector: "Financial Services", revenue: 87, ebitda: 35, growth: 0.45, margin: 0.40, roic: 0.28 },
  { company: "InsureTech", sector: "Financial Services", revenue: 123, ebitda: 37, growth: 0.24, margin: 0.30, roic: 0.20 },
  
  // Energy
  { company: "CleanEnergy", sector: "Energy", revenue: 298, ebitda: 59, growth: 0.19, margin: 0.20, roic: 0.15 },
  { company: "SolarCorp", sector: "Energy", revenue: 167, ebitda: 25, growth: 0.33, margin: 0.15, roic: 0.18 }
];