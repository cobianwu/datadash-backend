import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import Dashboard from "@/pages/Dashboard";
import AdvancedAnalytics from "@/pages/AdvancedAnalytics";
import Login from "@/pages/Login";
import NotFound from "@/pages/not-found";
import { PEDueDiligence } from "@/pages/PEDueDiligence";
import DataSources from "@/pages/DataSources";
import AIAssistant from "@/pages/AIAssistant";
import Portfolio from "@/pages/Portfolio";
import Warehouses from "@/pages/Warehouses";
import { useAuth } from "@/hooks/useAuth";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/analytics" component={() => <ProtectedRoute component={AdvancedAnalytics} />} />
      <Route path="/due-diligence" component={() => <ProtectedRoute component={PEDueDiligence} />} />
      <Route path="/data-sources" component={() => <ProtectedRoute component={DataSources} />} />
      <Route path="/ai" component={() => <ProtectedRoute component={AIAssistant} />} />
      <Route path="/portfolio" component={() => <ProtectedRoute component={Portfolio} />} />
      <Route path="/warehouses" component={() => <ProtectedRoute component={Warehouses} />} />
      <Route path="/login" component={Login} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
