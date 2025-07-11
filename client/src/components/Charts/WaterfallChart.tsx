import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";

const waterfallData = [
  { name: 'Q2 Revenue', value: 180, color: 'hsl(var(--muted-foreground))' },
  { name: 'New Deals', value: 45, color: 'hsl(var(--success))' },
  { name: 'Upsells', value: 25, color: 'hsl(var(--success))' },
  { name: 'Churn', value: -15, color: 'hsl(var(--destructive))' },
  { name: 'Q3 Revenue', value: 235, color: 'hsl(var(--primary))' },
];

export function WaterfallChart() {
  return (
    <Card className="animate-slide-up">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">Revenue Waterfall</CardTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Q3 2024 breakdown</p>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            +$2.1M
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={waterfallData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="name" 
                className="text-sm"
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis className="text-sm" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px"
                }}
                formatter={(value: any) => [`$${Math.abs(value)}M`, value < 0 ? "Decrease" : "Increase"]}
              />
              <Bar 
                dataKey="value" 
                fill={(entry: any) => entry.color}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
