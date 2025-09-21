import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAuth, useRoleAccess } from "@/context/AuthContext";
import { 
  TrendingUp, 
  TrendingDown,
  Target, 
  Plus,
  Lightbulb,
  BarChart3,
  Zap,
  Hand,
  CheckCircle,
  Award,
  Calendar,
  Users,
  Building
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  ResponsiveContainer,
  Area,
  AreaChart
} from "recharts";
import { dashboardAPI } from "@/services/api";

interface DashboardData {
  totalEmissions: number;
  monthlyEmissions: number;
  categories: Record<string, number>;
  history: Array<{ date: string; emissions: number }>;
  goals: Array<{ id: number; name: string; progress: number; target: number }>;
}

export default function Dashboard() {
  const { user } = useAuth();
  const { isIndividual, isCompany } = useRoleAccess();
  
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState("month");

  // Color schemes for charts
  const pieColors = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  useEffect(() => {
    loadDashboardData();
  }, [timeFilter]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await dashboardAPI.getData();
      setDashboardData(data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatEmissionValue = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}t`;
    }
    return `${value.toFixed(1)}kg`;
  };

  const calculateTrend = () => {
    if (!dashboardData?.history || dashboardData.history.length < 2) return { trend: 0, isPositive: false };
    
    const current = dashboardData.history[dashboardData.history.length - 1]?.emissions || 0;
    const previous = dashboardData.history[dashboardData.history.length - 2]?.emissions || 0;
    
    const trend = previous > 0 ? ((current - previous) / previous) * 100 : 0;
    return { trend: Math.abs(trend), isPositive: trend < 0 }; // Positive trend means reduction (good)
  };

  const preparePieData = () => {
    if (!dashboardData?.categories) return [];
    
    return Object.entries(dashboardData.categories).map(([category, value]) => ({
      name: category.charAt(0).toUpperCase() + category.slice(1),
      value: Number(value),
      percentage: ((Number(value) / dashboardData.totalEmissions) * 100).toFixed(1)
    }));
  };

  const prepareHistoryData = () => {
    if (!dashboardData?.history) return [];
    
    return dashboardData.history.map(item => ({
      ...item,
      month: new Date(item.date + '-01').toLocaleDateString('en-US', { month: 'short' })
    }));
  };

  const { trend, isPositive } = calculateTrend();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen transition-colors duration-300 ease-in-out">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto transition-colors duration-300 ease-in-out"></div>
          <p className="mt-2 text-muted-foreground transition-colors duration-300 ease-in-out">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="p-6 space-y-8 max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 dark:from-emerald-500/5 dark:to-blue-500/5 rounded-3xl blur-3xl opacity-75 dark:opacity-100"></div>
          <div className="relative bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-white/30 dark:border-slate-700/30">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-3">
                Welcome back, {user?.firstName || 'User'}! 
                <div className="animate-bounce">
                  <Hand className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                </div>
              </h1>
              <p className="text-lg font-medium text-slate-600 dark:text-slate-300">
                {isIndividual() 
                  ? "Track your carbon footprint and make a positive impact on the environment."
                  : "Monitor your company's environmental impact and drive sustainable practices."
                }
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="w-32 bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border border-slate-200 dark:border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-700">
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="group bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl bg-gradient-to-br from-red-50/90 to-red-100/90 dark:from-red-950/50 dark:to-red-900/40 border border-red-200/50 dark:border-red-800/50 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2 transition-colors duration-300 ease-in-out">
            <div>
              <p className="text-sm text-red-600 dark:text-red-400 font-bold tracking-wide transition-colors duration-300 ease-in-out">TOTAL EMISSIONS</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 transition-colors duration-300 ease-in-out">{formatEmissionValue(dashboardData?.totalEmissions || 0)}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium transition-colors duration-300 ease-in-out">CO₂ equivalent</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-red-500/25 group-hover:scale-110 transition-all duration-300">
              <TrendingUp className="w-7 h-7 text-white transition-transform duration-300 ease-in-out" />
            </div>
          </CardHeader>
          <CardContent className="transition-colors duration-300 ease-in-out">
            <div className="flex items-center text-xs text-muted-foreground transition-colors duration-300 ease-in-out">
              {isPositive ? (
                <TrendingDown className="w-4 h-4 text-green-500 mr-1 transition-colors duration-300 ease-in-out" />
              ) : (
                <TrendingUp className="w-4 h-4 text-red-500 mr-1 transition-colors duration-300 ease-in-out" />
              )}
              <span className={`transition-colors duration-300 ease-in-out ${isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                {trend.toFixed(1)}% {isPositive ? "reduction" : "increase"} from last period
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="group bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl bg-gradient-to-br from-blue-50/90 to-blue-100/90 dark:from-blue-950/50 dark:to-blue-900/40 border border-blue-200/50 dark:border-blue-800/50 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2 transition-colors duration-300 ease-in-out">
            <div>
              <p className="text-sm text-blue-600 dark:text-blue-400 font-bold tracking-wide transition-colors duration-300 ease-in-out">THIS MONTH</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 transition-colors duration-300 ease-in-out">{formatEmissionValue(dashboardData?.monthlyEmissions || 0)}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium transition-colors duration-300 ease-in-out">Current period</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-blue-500/25 group-hover:scale-110 transition-all duration-300">
              <Calendar className="w-7 h-7 text-white transition-transform duration-300 ease-in-out" />
            </div>
          </CardHeader>
        </Card>

        <Card className="group bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl bg-gradient-to-br from-green-50/90 to-green-100/90 dark:from-green-950/50 dark:to-green-900/40 border border-green-200/50 dark:border-green-800/50 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2 transition-colors duration-300 ease-in-out">
            <div>
              <p className="text-sm text-green-600 dark:text-green-400 font-bold tracking-wide transition-colors duration-300 ease-in-out">ACTIVE GOALS</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 transition-colors duration-300 ease-in-out">{dashboardData?.goals?.length || 0}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium transition-colors duration-300 ease-in-out">Reduction targets</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-green-500/25 group-hover:scale-110 transition-all duration-300">
              <Target className="w-7 h-7 text-white transition-transform duration-300 ease-in-out" />
            </div>
          </CardHeader>
        </Card>

        <Card className="group bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl bg-gradient-to-br from-purple-50/90 to-purple-100/90 dark:from-purple-950/50 dark:to-purple-900/40 border border-purple-200/50 dark:border-purple-800/50 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2 transition-colors duration-300 ease-in-out">
            <div>
              <p className="text-sm text-purple-600 dark:text-purple-400 font-bold tracking-wide transition-colors duration-300 ease-in-out">
                {isCompany() ? "DEPARTMENTS" : "CATEGORIES"}
              </p>
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 transition-colors duration-300 ease-in-out">
                {Object.keys(dashboardData?.categories || {}).length}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium transition-colors duration-300 ease-in-out">Data sources</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-purple-500/25 group-hover:scale-110 transition-all duration-300">
              {isCompany() ? <Building className="w-7 h-7 text-white transition-transform duration-300 ease-in-out" /> : <BarChart3 className="w-7 h-7 text-white transition-transform duration-300 ease-in-out" />}
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Emissions by Category - Pie Chart */}
        <Card className="bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl shadow-2xl hover:shadow-3xl transition-all duration-500 group overflow-hidden border border-white/30 dark:border-slate-700/30">
          <CardHeader className="border-b border-border/50 bg-gradient-to-r from-transparent via-primary/5 to-transparent transition-all duration-300 ease-in-out">
            <CardTitle className="flex items-center gap-2 transition-colors duration-300 ease-in-out">
              <BarChart3 className="w-5 h-5 text-primary group-hover:scale-110 transition-transform duration-300" />
              Emissions by {isCompany() ? "Department" : "Category"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 transition-colors duration-300 ease-in-out">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={preparePieData()}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                  >
                    {preparePieData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatEmissionValue(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Emissions Trend - Line Chart */}
        <Card className="bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl shadow-2xl hover:shadow-3xl transition-all duration-500 group overflow-hidden border border-white/30 dark:border-slate-700/30">
          <CardHeader className="border-b border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-r from-emerald-500/10 via-green-500/10 to-emerald-500/10 dark:from-emerald-600/10 dark:via-green-600/10 dark:to-emerald-600/10 transition-all duration-300 ease-in-out">
            <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-200 transition-colors duration-300 ease-in-out">
              <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform duration-300" />
              Emissions Trend
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 transition-colors duration-300 ease-in-out">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={prepareHistoryData()}>
                  <defs>
                    <linearGradient id="colorEmissions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorEmissionsDark" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#34D399" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="#34D399" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="month" className="text-muted-foreground transition-colors duration-300 ease-in-out" />
                  <YAxis className="text-muted-foreground transition-colors duration-300 ease-in-out" />
                  <Tooltip formatter={(value) => [formatEmissionValue(Number(value)), "Emissions"]} />
                  <Area 
                    type="monotone" 
                    dataKey="emissions" 
                    stroke="#10B981" 
                    fillOpacity={1} 
                    fill="url(#colorEmissions)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Goals and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Goals */}
        <Card className="lg:col-span-2 bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl shadow-2xl hover:shadow-3xl transition-all duration-500 border border-white/30 dark:border-slate-700/30">
          <CardHeader className="border-b border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-r from-emerald-500/10 via-green-500/10 to-emerald-500/10 dark:from-emerald-600/10 dark:via-green-600/10 dark:to-emerald-600/10 transition-colors duration-300 ease-in-out">
            <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-200 transition-colors duration-300 ease-in-out">
              <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400 transition-colors duration-300 ease-in-out" />
              Active Goals & Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            {dashboardData?.goals?.map((goal) => (
              <div key={goal.id} className="space-y-2 transition-all duration-300 ease-in-out">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-slate-800 dark:text-slate-200 transition-colors duration-300 ease-in-out">{goal.name}</h4>
                  <Badge variant={goal.progress >= 100 ? "default" : "secondary"} className="bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 transition-all duration-300 ease-in-out">
                    {goal.progress}%
                  </Badge>
                </div>
                <Progress value={goal.progress} className="h-3 transition-all duration-300 ease-in-out" />
                <p className="text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300 ease-in-out">
                  Progress: {goal.progress}% of {goal.target}% target
                </p>
              </div>
            )) || (
              <div className="text-center text-slate-600 dark:text-slate-400 py-8 transition-colors duration-300 ease-in-out">
                <Target className="w-12 h-12 mx-auto mb-4 opacity-50 text-emerald-600 dark:text-emerald-400 transition-all duration-300 ease-in-out" />
                <p className="transition-colors duration-300 ease-in-out">No active goals yet.</p>
                <Button variant="outline" className="mt-2 border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all duration-300 ease-in-out">
                  <Plus className="w-4 h-4 mr-2" />
                  Set Your First Goal
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl shadow-2xl hover:shadow-3xl transition-all duration-500 border border-white/30 dark:border-slate-700/30">
          <CardHeader className="border-b border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-r from-emerald-500/10 via-green-500/10 to-emerald-500/10 dark:from-emerald-600/10 dark:via-green-600/10 dark:to-emerald-600/10 transition-colors duration-300 ease-in-out">
            <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-200 transition-colors duration-300 ease-in-out">
              <Lightbulb className="w-5 h-5 text-emerald-600 dark:text-emerald-400 transition-colors duration-300 ease-in-out" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <Button className="w-full justify-start bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300" variant="outline">
              <Plus className="w-4 h-4 mr-2 transition-transform duration-300 ease-in-out" />
              Log New Emission
            </Button>
            <Button className="w-full justify-start border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all duration-300" variant="outline">
              <Target className="w-4 h-4 mr-2 transition-transform duration-300 ease-in-out" />
              Set New Goal
            </Button>
            <Button className="w-full justify-start border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all duration-300" variant="outline">
              <BarChart3 className="w-4 h-4 mr-2 transition-transform duration-300 ease-in-out" />
              View Reports
            </Button>
            
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700 transition-all duration-300 ease-in-out">
              <h4 className="font-medium mb-2 text-sm text-slate-800 dark:text-slate-200 transition-colors duration-300 ease-in-out">💡 Today's Tip</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300 ease-in-out">
                {isIndividual() 
                  ? "Try using public transportation or biking today to reduce your carbon footprint!"
                  : "Consider implementing a company-wide recycling program to reduce waste emissions."
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Achievements */}
      <Card className="shadow-lg transition-all duration-300 ease-in-out">
        <CardHeader className="transition-colors duration-300 ease-in-out">
          <CardTitle className="flex items-center gap-2 transition-colors duration-300 ease-in-out">
            <Award className="w-5 h-5 text-primary transition-colors duration-300 ease-in-out" />
            Recent Achievements
          </CardTitle>
        </CardHeader>
        <CardContent className="transition-colors duration-300 ease-in-out">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 transition-all duration-300 ease-in-out">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400 transition-colors duration-300 ease-in-out" />
              <div>
                <h4 className="font-medium transition-colors duration-300 ease-in-out">First Week Complete</h4>
                <p className="text-sm text-muted-foreground transition-colors duration-300 ease-in-out">Logged emissions for 7 days</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 transition-all duration-300 ease-in-out">
              <Target className="w-8 h-8 text-blue-600 dark:text-blue-400 transition-colors duration-300 ease-in-out" />
              <div>
                <h4 className="font-medium transition-colors duration-300 ease-in-out">Goal Setter</h4>
                <p className="text-sm text-muted-foreground transition-colors duration-300 ease-in-out">Created your first reduction goal</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 transition-all duration-300 ease-in-out">
              <TrendingDown className="w-8 h-8 text-purple-600 dark:text-purple-400 transition-colors duration-300 ease-in-out" />
              <div>
                <h4 className="font-medium transition-colors duration-300 ease-in-out">Trend Tracker</h4>
                <p className="text-sm text-muted-foreground transition-colors duration-300 ease-in-out">Reduced emissions by 15%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    </div>
  );
}