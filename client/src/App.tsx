import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { Bell, Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

// Import pages
import Dashboard from "@/pages/Dashboard";
import LogEmissions from "@/pages/LogEmissions";
import Tips from "@/pages/Tips";
import Goals from "@/pages/Goals";
import Profile from "@/pages/Profile";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Landing from "@/pages/Landing";
import NotFound from "@/pages/not-found";
import ComingSoonPage from "@/pages/ComingSoon";
import { BarChart3, FileText } from "lucide-react";

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="relative overflow-hidden hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300 hover:scale-105 hover:shadow-lg group"
      data-testid="button-theme-toggle"
    >
      <div className="relative w-4 h-4">
        {/* Light mode icon */}
        <Sun 
          className={`absolute inset-0 w-4 h-4 text-slate-600 dark:text-slate-400 transition-all duration-500 ${
            theme === "light" 
              ? "rotate-0 scale-100 opacity-100" 
              : "rotate-90 scale-0 opacity-0"
          }`} 
        />
        {/* Dark mode icon */}
        <Moon 
          className={`absolute inset-0 w-4 h-4 text-slate-600 dark:text-slate-400 transition-all duration-500 ${
            theme === "dark" 
              ? "rotate-0 scale-100 opacity-100" 
              : "-rotate-90 scale-0 opacity-0"
          }`} 
        />
      </div>
      
      {/* Subtle glow effect on hover */}
      <div className="absolute inset-0 rounded-md bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </Button>
  );
}

function AuthenticatedApp() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/signup" component={Signup} />
        <Route path="/" component={Landing} />
        <Route component={Landing} />
      </Switch>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="border-b border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-900/60">
            <div className="flex h-14 items-center gap-4 px-6">
              <SidebarTrigger className="hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" />
              <div className="flex-1" />
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 hover:scale-105"
                >
                  <Bell className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                </Button>
                <ThemeToggle />
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            <Switch>
              <Route path="/" component={Dashboard} />
              <Route path="/dashboard" component={Dashboard} />
              <Route path="/emissions" component={LogEmissions} />
              <Route path="/log-emissions" component={LogEmissions} />
              <Route path="/profile" component={Profile} />
              <Route path="/goals" component={Goals} />
              <Route path="/tips" component={Tips} />
              
              {/* Coming Soon Routes */}
              <Route path="/analytics" component={() => <ComingSoonPage title="Analytics" description="Advanced analytics and data visualization features are coming soon. Explore detailed carbon footprint analytics and insights." icon={BarChart3} />} />
              <Route path="/compare" component={() => <ComingSoonPage title="Compare" description="Compare your carbon footprint with industry benchmarks, regional averages, and similar organizations." icon={BarChart3} />} />
              <Route path="/comparison" component={() => <ComingSoonPage title="Comparison" description="Compare your carbon footprint with industry benchmarks, regional averages, and similar organizations." icon={BarChart3} />} />
              <Route path="/reports" component={() => <ComingSoonPage title="Reports" description="Advanced reporting and analytics features are coming soon. Generate detailed emission reports, export data, and analyze trends." icon={FileText} />} />
              <Route path="/what-if" component={() => <ComingSoonPage title="What-If Analysis" description="Scenario analysis and predictive modeling features are coming soon. Explore the impact of different sustainability initiatives." icon={BarChart3} />} />
              
              {/* Catch-all route for any other pages - redirect to Coming Soon */}
              <Route component={() => <ComingSoonPage title="Coming Soon" description="This feature is currently under development. We're working hard to bring you new sustainability tools and insights." icon={BarChart3} />} />
            </Switch>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="carbonSense-theme">
        <TooltipProvider>
          <AuthProvider>
            <AuthenticatedApp />
            <Toaster />
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;