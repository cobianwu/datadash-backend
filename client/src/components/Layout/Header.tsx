import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { Brain, Sun, Moon, Bell } from "lucide-react";

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 transition-colors duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Executive Dashboard</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Real-time insights and performance metrics</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* AI Search */}
          <div className="relative">
            <Input 
              type="text" 
              placeholder="Ask AI about your data..." 
              className="w-80 pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700"
            />
            <Brain className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
          </div>
          
          {/* Theme Toggle */}
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
          </Button>

          {/* User Menu */}
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {user?.firstName || user?.username || "User"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Portfolio Manager</p>
            </div>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {(user?.firstName?.[0] || user?.username?.[0] || "U").toUpperCase()}
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
