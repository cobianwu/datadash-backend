import { AppLayout } from "@/components/Layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LBOAnalyzer } from "@/components/FinancialModeling/LBOAnalyzer";
import { QueryInterface } from "@/components/NaturalLanguageQuery/QueryInterface";
import { HeatmapChart } from "@/components/AdvancedCharts/HeatmapChart";
import { ForecastEngine } from "@/components/PredictiveAnalytics/ForecastEngine";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calculator, 
  Brain, 
  TrendingUp, 
  Sparkles,
  Download,
  Share,
  Settings,
  Zap
} from "lucide-react";

export default function AdvancedAnalytics() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Zap className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold">Advanced Analytics Suite</h1>
            </div>
            <Badge variant="secondary" className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              Enterprise AI
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Configure
            </Button>
            <Button variant="outline" size="sm">
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export All
            </Button>
          </div>
        </div>

        <Tabs defaultValue="nlp" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="nlp" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              AI Query Engine
            </TabsTrigger>
            <TabsTrigger value="lbo" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              LBO Modeling
            </TabsTrigger>
            <TabsTrigger value="heatmap" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Performance Heatmap
            </TabsTrigger>
            <TabsTrigger value="forecast" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Predictive Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="nlp" className="mt-6">
            <QueryInterface />
          </TabsContent>

          <TabsContent value="lbo" className="mt-6">
            <LBOAnalyzer />
          </TabsContent>

          <TabsContent value="heatmap" className="mt-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <HeatmapChart 
                  title="Revenue Growth Heatmap" 
                  metric="growth"
                />
                <HeatmapChart 
                  title="EBITDA Margin Heatmap" 
                  metric="margin"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <HeatmapChart 
                  title="ROIC Performance Heatmap" 
                  metric="roic"
                />
                <HeatmapChart 
                  title="Revenue Scale Heatmap" 
                  metric="revenue"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="forecast" className="mt-6">
            <ForecastEngine />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}