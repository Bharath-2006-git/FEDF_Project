import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAuth, useRoleAccess } from "@/context/AuthContext";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { formatEmissionValue, getTrend } from "@/lib/formatting";
import { 
  TrendingUp, 
  TrendingDown,
  Target, 
  Plus,
  Lightbulb,
  BarChart3,
  Calendar,
  CheckCircle,
  Award,
  Building,
  AlertCircle
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
  const [error, setError] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState("month");
  const pieColors = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
  useEffect(() => {
    loadDashboardData();
  }, [timeFilter]);
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardAPI.getData();
      setDashboardData(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load dashboard data. Please try again.");
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  const calculateTrend = () => {
    if (!dashboardData?.history || dashboardData.history.length < 2) return { trend: 0, isPositive: false };
    const current = dashboardData.history[dashboardData.history.length - 1]?.emissions || 0;
    const previous = dashboardData.history[dashboardData.history.length - 2]?.emissions || 0;
    const trend = previous > 0 ? ((current - previous) / previous) * 100 : 0;
    return { trend: Math.abs(trend), isPositive: trend < 0 };
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
    return dashboardData.history.map(item => {
      const date = new Date(item.date);
      return {
        ...item,
        displayDate: !isNaN(date.getTime()) 
          ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          : item.date,
        fullDate: !isNaN(date.getTime())
          ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          : item.date
      };
    });
  };
  const { trend, isPositive } = calculateTrend();
  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-red-500 dark:text-red-400 mx-auto" />
            <h3 className="text-lg font-semibold">Failed to Load Dashboard</h3>
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button onClick={loadDashboardData} className="w-full">Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!dashboardData || dashboardData.totalEmissions === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="p-6 space-y-8 max-w-7xl mx-auto">
          <PageHeader
            title="Dashboard"
            description="Track and monitor your carbon footprint"
          />
          <Card className="border-dashed">
            <CardContent className="p-12 text-center space-y-4">
              <div className="text-6xl"></div>
              <h3 className="text-xl font-semibold">No Emissions Logged Yet</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Start tracking your carbon footprint by logging your first emission.
              </p>
              <Button asChild className="mt-4">
                <a href="/log-emissions">Log Your First Emission</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="p-6 space-y-8 max-w-7xl mx-auto">
        <PageHeader
          title={`Welcome back, ${user?.firstName || 'User'}!`}
          description={isIndividual() 
            ? "Monitor your emissions and make a positive environmental impact with CarbonSense."
            : "Track your company's sustainability metrics and drive eco-friendly practices."
          }
          actions={
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
          }
        />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="group bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl bg-gradient-to-br from-red-50/90 to-red-100/90 dark:from-red-950/50 dark:to-red-900/40 border border-red-200/50 dark:border-red-800/50 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between pb-4 pt-6 px-6">
            <div className="flex-1">
              <p className="text-sm text-red-600 dark:text-red-400 font-bold tracking-wide mb-2">TOTAL EMISSIONS</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{formatEmissionValue(dashboardData?.totalEmissions || 0)}</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-red-500/25 group-hover:scale-110 transition-all duration-300 flex-shrink-0">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
          </CardHeader>
        </Card>
        <Card className="group bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl bg-gradient-to-br from-blue-50/90 to-cyan-100/90 dark:from-blue-950/50 dark:to-cyan-900/40 border border-blue-200/50 dark:border-blue-800/50 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between pb-4 pt-6 px-6">
            <div className="flex-1">
              <p className="text-sm text-blue-600 dark:text-blue-400 font-bold tracking-wide mb-2">THIS MONTH</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{formatEmissionValue(dashboardData?.monthlyEmissions || 0)}</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-blue-500/25 group-hover:scale-110 transition-all duration-300 flex-shrink-0">
              <Calendar className="w-7 h-7 text-white" />
            </div>
          </CardHeader>
        </Card>
        <Card className="group bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl bg-gradient-to-br from-teal-50/90 to-green-100/90 dark:from-teal-950/50 dark:to-green-900/40 border border-teal-200/50 dark:border-teal-800/50 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between pb-4 pt-6 px-6">
            <div className="flex-1">
              <p className="text-sm text-teal-600 dark:text-teal-400 font-bold tracking-wide mb-2">ACTIVE GOALS</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{dashboardData?.goals?.length || 0}</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-teal-500/25 group-hover:scale-110 transition-all duration-300 flex-shrink-0">
              <Target className="w-7 h-7 text-white" />
            </div>
          </CardHeader>
        </Card>
        <Card className="group bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl bg-gradient-to-br from-cyan-50/90 to-emerald-100/90 dark:from-cyan-950/50 dark:to-emerald-900/40 border border-cyan-200/50 dark:border-cyan-800/50 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between pb-4 pt-6 px-6">
            <div className="flex-1">
              <p className="text-sm text-cyan-600 dark:text-cyan-400 font-bold tracking-wide mb-2">
                {isCompany() ? "DEPARTMENTS" : "CATEGORIES"}
              </p>
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                {Object.keys(dashboardData?.categories || {}).length}
              </p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-cyan-500/25 group-hover:scale-110 transition-all duration-300 flex-shrink-0">
              {isCompany() ? <Building className="w-7 h-7 text-white" /> : <BarChart3 className="w-7 h-7 text-white" />}
            </div>
          </CardHeader>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-2">
        <Card className="bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl shadow-2xl hover:shadow-3xl transition-all duration-500 group overflow-hidden border border-emerald-200/30 dark:border-emerald-700/30">
          <CardHeader className="border-b border-border/50 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-cyan-50/50 dark:from-emerald-950/50 dark:via-teal-950/30 dark:to-cyan-950/50 transition-all duration-300 ease-in-out">
            <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 transition-colors duration-300 ease-in-out">
              <BarChart3 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform duration-300" />
              Emissions by {isCompany() ? "Department" : "Category"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 transition-colors duration-300 ease-in-out">
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={preparePieData()}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                    paddingAngle={2}
                  >
                    {preparePieData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name, props: any) => [
                      formatEmissionValue(Number(value)),
                      `${props.payload.name} (${props.payload.percentage}%)`
                    ]}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '8px 12px'
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={80}
                    wrapperStyle={{
                      paddingTop: '20px',
                      fontSize: '14px'
                    }}
                    iconType="circle"
                    iconSize={8}
                    formatter={(value, entry: any) => (
                      <span style={{ 
                        color: 'var(--foreground)',
                        fontSize: '13px',
                        padding: '4px 8px',
                        display: 'inline-block'
                      }}>
                        {entry.payload.name} ({entry.payload.percentage}%)
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl shadow-2xl hover:shadow-3xl transition-all duration-500 group overflow-hidden border border-blue-200/30 dark:border-blue-700/30">
          <CardHeader className="border-b border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-r from-blue-50/50 via-cyan-50/30 to-teal-50/50 dark:from-blue-950/50 dark:via-cyan-950/30 dark:to-teal-950/50 transition-all duration-300 ease-in-out">
            <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300 transition-colors duration-300 ease-in-out">
              <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300" />
              Emissions Trend
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 transition-colors duration-300 ease-in-out">
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={prepareHistoryData()} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                  <defs>
                    <linearGradient id="colorEmissions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                      <stop offset="50%" stopColor="#06B6D4" stopOpacity={0.5}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" stroke="#cbd5e1" />
                  <XAxis 
                    dataKey="displayDate" 
                    className="text-muted-foreground transition-colors duration-300 ease-in-out"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tick={{ fontSize: 12 }}
                    interval={0}
                    minTickGap={5}
                  />
                  <YAxis 
                    className="text-muted-foreground transition-colors duration-300 ease-in-out"
                    tick={{ fontSize: 12 }}
                    label={{ value: 'CO₂ Emissions (kg)', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }}
                  />
                  <Tooltip 
                    formatter={(value) => [formatEmissionValue(Number(value)), "Emissions"]}
                    labelFormatter={(label, payload) => {
                      if (payload && payload[0]) {
                        return payload[0].payload.fullDate;
                      }
                      return label;
                    }}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '12px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="emissions" 
                    stroke="#3B82F6" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorEmissions)"
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl shadow-2xl hover:shadow-3xl transition-all duration-500 border border-teal-200/30 dark:border-teal-700/30">
          <CardHeader className="border-b border-slate-200/50 dark:border-slate-700/50 pb-4">
            <CardTitle className="flex items-center justify-between text-slate-800 dark:text-slate-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-500/10 rounded-lg">
                  <Target className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                </div>
                Active Goals & Progress
              </div>
              {dashboardData?.goals && dashboardData.goals.length > 0 && (
                <Badge className="bg-teal-600 text-white px-3 py-1">
                  {dashboardData.goals.length} Active
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 p-6">
            {dashboardData?.goals && dashboardData.goals.length > 0 ? (
              dashboardData.goals.map((goal) => {
                const progress = typeof goal.progress === 'number' && !isNaN(goal.progress) ? goal.progress : 0;
                const isCompleted = progress >= 100;
                return (
                  <div key={goal.id} className="p-4 rounded-xl bg-white dark:bg-slate-800 border-2 border-teal-200 dark:border-teal-800 hover:border-teal-400 dark:hover:border-teal-600 transition-all duration-300 shadow-sm hover:shadow-md">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-slate-900 dark:text-slate-100">{goal.name}</h4>
                          {isCompleted && (
                            <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                          )}
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Target: Reduce emissions by {goal.target}%
                        </p>
                      </div>
                      <Badge 
                        variant={isCompleted ? "default" : "secondary"} 
                        className={`text-lg px-3 py-1 ${
                          isCompleted 
                            ? 'bg-emerald-600 text-white' 
                            : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                        }`}
                      >
                        {progress}%
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <Progress value={progress} className="h-4" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Current progress</span>
                        <span>{progress >= 100 ? 'Goal Achieved!' : `${100 - progress}% to go`}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 px-6">
                <div className="inline-flex p-4 bg-teal-500/10 rounded-2xl mb-4">
                  <Target className="w-12 h-12 text-teal-600 dark:text-teal-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-100">No active goals yet</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Set your first goal and start tracking your progress towards a greener future!
                </p>
                <a href="/goals">
                  <Button className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all">
                    <Plus className="w-4 h-4 mr-2" />
                    Set Your First Goal
                  </Button>
                </a>
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl shadow-2xl hover:shadow-3xl transition-all duration-500 border border-cyan-200/30 dark:border-cyan-700/30">
          <CardHeader className="border-b border-slate-200/50 dark:border-slate-700/50 pb-4">
            <CardTitle className="flex items-center gap-3 text-slate-800 dark:text-slate-200">
              <div className="p-2 bg-cyan-500/10 rounded-lg">
                <Lightbulb className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              </div>
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-6">
            <a href="/log-emissions" className="block">
              <Button className="w-full justify-start h-12 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white border-0 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300">
                <Plus className="w-5 h-5 mr-3" />
                <span className="font-semibold">Log New Emission</span>
              </Button>
            </a>
            <a href="/goals" className="block">
              <Button className="w-full justify-start h-12 bg-white dark:bg-slate-800 border-2 border-teal-300 dark:border-teal-700 text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-900/30 hover:scale-105 transition-all duration-300">
                <Target className="w-5 h-5 mr-3" />
                <span className="font-semibold">Set New Goal</span>
              </Button>
            </a>
            <a href="/reports" className="block">
              <Button className="w-full justify-start h-12 bg-white dark:bg-slate-800 border-2 border-cyan-300 dark:border-cyan-700 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-50 dark:hover:bg-cyan-900/30 hover:scale-105 transition-all duration-300">
                <BarChart3 className="w-5 h-5 mr-3" />
                <span className="font-semibold">View Reports</span>
              </Button>
            </a>
            <div className="pt-4 mt-2 border-t-2 border-cyan-200 dark:border-cyan-800 bg-gradient-to-r from-emerald-50/50 to-cyan-50/50 dark:from-emerald-950/30 dark:to-cyan-950/30 -mx-6 px-6 py-4 rounded-b-xl">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg mt-1 flex-shrink-0">
                  <Lightbulb className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1 text-emerald-800 dark:text-emerald-200">Today's Tip</h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {isIndividual() 
                      ? "Try using public transportation or biking today to reduce your carbon footprint!"
                      : "Consider implementing a company-wide recycling program to reduce waste emissions."
                    }
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </div>
  );
}
