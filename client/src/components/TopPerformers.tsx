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
          <CardTitle>Top Performers</CardTitle>
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
    { id: 1, name: "TechCorp", sector: "Technology", performance: 28.4, value: 45200000 },
    { id: 2, name: "GreenSolutions", sector: "Energy", performance: 21.7, value: 38900000 },
    { id: 3, name: "FinanceInc", sector: "Financial", performance: 18.3, value: 52100000 },
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
            <CardTitle className="text-lg font-semibold">Top Performers</CardTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Last 30 days</p>
          </div>
          <Button variant="link" className="text-blue-600 dark:text-blue-400 p-0">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayData.map((company: any, index: number) => (
            <div key={company.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 ${getGradientClass(index)} rounded-lg flex items-center justify-center`}>
                  <span className="text-xs font-bold text-white">{getInitials(company.name)}</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{company.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{company.sector}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-green-600">+{company.performance.toFixed(1)}%</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  ${(company.value / 1000000).toFixed(1)}M
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
