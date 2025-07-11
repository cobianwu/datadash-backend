import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Database, 
  LineChart, 
  Briefcase, 
  Brain, 
  Server,
  BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Data Sources", href: "/data-sources", icon: Database },
  { name: "Advanced Analytics", href: "/analytics", icon: LineChart },
  { name: "Due Diligence", href: "/due-diligence", icon: Briefcase },
  { name: "Portfolio", href: "/portfolio", icon: Briefcase },
  { name: "AI Assistant", href: "/ai", icon: Brain },
  { name: "Warehouses", href: "/warehouses", icon: Server },
];

export function Sidebar() {
  const [location] = useLocation();
  
  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-shrink-0 transition-colors duration-300">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">DataFlow</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Analytics Platform</p>
          </div>
        </div>
      </div>

      <nav className="p-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isCurrent = location === item.href;
          return (
            <Link 
              key={item.name} 
              href={item.href}
            >
              <div className={`
                flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors
                ${isCurrent 
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }
              `}>
                <Icon className="w-5 h-5" />
                <span className={isCurrent ? "font-medium" : ""}>{item.name}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
          <h3 className="font-semibold text-sm">Upgrade to Pro</h3>
          <p className="text-xs text-blue-100 mt-1">Unlock advanced features</p>
          <Button 
            variant="secondary"
            size="sm"
            className="bg-white text-blue-600 hover:bg-blue-50 mt-2"
          >
            Learn More
          </Button>
        </div>
      </div>
    </aside>
  );
}
