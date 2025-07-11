import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

export function TopPerformers() {
  const { data: performers, isLoading } = useQuery({
    queryKey: ["/api/dashboard/top-performers"],
  });

  if (isLoading) {
    return (
      <Card className="animate-slide-up">
        <CardHeader>
          <CardTitle>Company KPI Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const defaultPerformers = [
    { id: 1, name: "TechCorp", sector: "Technology", revenue_growth: 28.4, ebitda_margin: 22.1, nps: 72 },
    { id: 2, name: "GreenSolutions", sector: "Energy", revenue_growth: 21.7, ebitda_margin: 18.5, nps: 68 },
    { id: 3, name: "FinanceInc", sector: "Financial", revenue_growth: 18.3, ebitda_margin: 25.2, nps: 74 },
  ];

  const displayData = performers || defaultPerformers;

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase();
  };

  const getGradientClass = (index: number) => {
    const gradients = [
      "bg-gradient-to-br from-blue-500 to-blue-600",
      "bg-gradient-to-br from-orange-500 to-orange-600",
      "bg-gradient-to-br from-purple-500 to-pink-500",
    ];
    return gradients[index % gradients.length];
  };

  return (
    <Card className="animate-slide-up">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">Company KPI Summary</CardTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Key business metrics</p>
          </div>
          <Button variant="link" className="text-blue-600 dark:text-blue-400 p-0">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayData.map((company: any, index: number) => (
            <div key={company.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 ${getGradientClass(index)} rounded-lg flex items-center justify-center`}>
                    <span className="text-xs font-bold text-white">{getInitials(company.name)}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{company.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{company.sector}</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 mt-3">
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Revenue</p>
                  <p className="font-semibold text-green-600">+{company.revenue_growth?.toFixed(1) || company.performance?.toFixed(1)}%</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">EBITDA</p>
                  <p className="font-semibold">{company.ebitda_margin?.toFixed(1) || 20.5}%</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">NPS</p>
                  <p className="font-semibold">{company.nps || 70}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
