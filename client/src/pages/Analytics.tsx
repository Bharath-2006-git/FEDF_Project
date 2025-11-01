import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { PageHeader } from "@/components/shared/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { 
  Download,
  BarChart3,
  Activity,
  Target,
  TrendingUp,
  TrendingDown,
  Calendar,
  PieChart as PieChartIcon
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
  AreaChart,
  ComposedChart
} from "recharts";
import { dashboardAPI } from "@/services/api";

interface AnalyticsData {
  monthlyComparison: Array<{
    month: string;
    current: number;
    previous: number;
    change: number;
  }>;
  categoryBreakdown: Array<{
    category: string;
    value: number;
    percentage: number;
    trend: number;
  }>;
  yearlyTrends: Array<{
    year: string;
    emissions: number;
    goals: number;
    achieved: boolean;
  }>;
  peakAnalysis: {
    highestDay: { date: string; value: number };
    lowestDay: { date: string; value: number };
    averageDaily: number;
  };
}

const COLORS = ['#10b981', '#059669', '#047857', '#065F46', '#064E3B', '#022C22'];

export default function Analytics() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState('6months');

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [monthlyRes, categoryRes, yearlyRes, peakRes] = await Promise.all([
        dashboardAPI.getMonthlyComparison(timeRange),
        dashboardAPI.getCategoryBreakdown(timeRange),
        dashboardAPI.getYearlyTrends(),
        dashboardAPI.getPeakAnalysis(timeRange)
      ]);

      setData({
        monthlyComparison: monthlyRes.data,
        categoryBreakdown: categoryRes.data,
        yearlyTrends: yearlyRes.data,
        peakAnalysis: peakRes.data
      });
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load analytics data. Please try again.");
      console.error("Analytics error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await dashboardAPI.exportReport('csv', timeRange);
      
      // Create download link
      const blob = new Blob([response.data], { 
        type: 'text/csv' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `carbon-analytics-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      // Export failed
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading analytics..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center space-y-4">
            <div className="text-red-500 dark:text-red-400 text-5xl">📊</div>
            <h3 className="text-lg font-semibold">Failed to Load Analytics</h3>
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button onClick={fetchAnalyticsData} className="w-full">Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data || (data.categoryBreakdown && data.categoryBreakdown.length === 0)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="p-6 space-y-8 max-w-7xl mx-auto">
          <PageHeader
            title="Advanced Analytics"
            description="Deep dive into your carbon emission patterns and trends"
          />
          <Card className="border-dashed">
            <CardContent className="p-12 text-center space-y-4">
              <div className="text-6xl">📈</div>
              <h3 className="text-xl font-semibold">Not Enough Data</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Start logging emissions to see detailed analytics and insights about your carbon footprint.
              </p>
              <Button asChild className="mt-4">
                <a href="/log-emissions">Log Emissions</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Analytics</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Deep insights into your carbon emission patterns and trends
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-slate-300 dark:border-slate-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3months">📅 Last 3 Months</SelectItem>
                <SelectItem value="6months">📅 Last 6 Months</SelectItem>
                <SelectItem value="year">📅 Last Year</SelectItem>
                <SelectItem value="2years">📅 Last 2 Years</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Key Metrics - Enhanced */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-white/40 dark:border-slate-700/40 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">Peak Day</CardTitle>
              <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <Activity className="h-5 w-5 text-red-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {data?.peakAnalysis.highestDay.value.toFixed(1)} kg
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                {data?.peakAnalysis.highestDay.date}
              </p>
              <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                <p className="text-xs text-red-600 dark:text-red-400">Highest emissions recorded</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-white/40 dark:border-slate-700/40 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">Best Day</CardTitle>
              <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                <Activity className="h-5 w-5 text-emerald-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {data?.peakAnalysis.lowestDay.value.toFixed(1)} kg
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                {data?.peakAnalysis.lowestDay.date}
              </p>
              <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                <p className="text-xs text-emerald-600 dark:text-emerald-400">Lowest emissions recorded</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-white/40 dark:border-slate-700/40 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">Daily Average</CardTitle>
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <BarChart3 className="h-5 w-5 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {data?.peakAnalysis.averageDaily.toFixed(1)} kg
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                CO₂e per day
              </p>
              <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                <p className="text-xs text-blue-600 dark:text-blue-400">Across selected period</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-white/40 dark:border-slate-700/40 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">Goals Met</CardTitle>
              <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                <Target className="h-5 w-5 text-emerald-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {data?.yearlyTrends.filter(year => year.achieved).length || 0}/{data?.yearlyTrends.length || 0}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                {Math.round(((data?.yearlyTrends.filter(year => year.achieved).length || 0) / (data?.yearlyTrends.length || 1)) * 100)}% success rate
              </p>
              <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                <p className="text-xs text-emerald-600 dark:text-emerald-400">Goals achieved</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Comparison Chart - Enhanced */}
        <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-white/40 dark:border-slate-700/40 shadow-lg">
          <CardHeader className="border-b border-slate-200 dark:border-slate-700">
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                <BarChart3 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              Month-over-Month Comparison
            </CardTitle>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Compare current and previous period emissions
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={320}>
              <ComposedChart data={data?.monthlyComparison || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="month" 
                  stroke="#64748b"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#64748b"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '8px 12px'
                  }}
                />
                <Legend 
                  wrapperStyle={{ fontSize: '13px' }}
                  iconType="circle"
                />
                <Bar 
                  dataKey="current" 
                  fill="#10b981" 
                  name="Current Period"
                  radius={[6, 6, 0, 0]}
                />
                <Bar 
                  dataKey="previous" 
                  fill="#94a3b8" 
                  name="Previous Period"
                  radius={[6, 6, 0, 0]}
                />
                <Line 
                  type="monotone" 
                  dataKey="change" 
                  stroke="#ef4444" 
                  name="% Change"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Analysis - Enhanced */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-white/40 dark:border-slate-700/40 shadow-lg">
            <CardHeader className="border-b border-slate-200 dark:border-slate-700">
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <PieChartIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                Category Breakdown
              </CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Emissions distribution by category
              </p>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data?.categoryBreakdown || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, percentage }) => `${category}: ${percentage.toFixed(0)}%`}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {data?.categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`${value.toFixed(1)} kg CO₂e`, 'Emissions']}
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '8px 12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-white/40 dark:border-slate-700/40 shadow-lg">
            <CardHeader className="border-b border-slate-200 dark:border-slate-700">
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                Category Trends
              </CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Track changes over time
              </p>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {data?.categoryBreakdown.map((category, index) => (
                  <div 
                    key={category.category} 
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full shadow-sm"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="font-medium text-slate-900 dark:text-white">
                        {category.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-slate-600 dark:text-slate-400 font-mono">
                        {category.value.toFixed(1)} kg
                      </span>
                      <Badge 
                        variant={category.trend > 0 ? "destructive" : "default"}
                        className="text-xs min-w-[70px] justify-center"
                      >
                        {category.trend > 0 ? (
                          <TrendingUp className="w-3 h-3 mr-1" />
                        ) : (
                          <TrendingDown className="w-3 h-3 mr-1" />
                        )}
                        {Math.abs(category.trend).toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Yearly Trends - Enhanced */}
        <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-white/40 dark:border-slate-700/40 shadow-lg">
          <CardHeader className="border-b border-slate-200 dark:border-slate-700">
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              Yearly Performance vs Goals
            </CardTitle>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Compare actual emissions against your targets
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={data?.yearlyTrends || []}>
                <defs>
                  <linearGradient id="colorEmissions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorGoals" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="year" 
                  stroke="#64748b"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#64748b"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '8px 12px'
                  }}
                />
                <Legend 
                  wrapperStyle={{ fontSize: '13px' }}
                  iconType="circle"
                />
                <Area 
                  type="monotone" 
                  dataKey="emissions" 
                  stroke="#ef4444" 
                  fill="url(#colorEmissions)"
                  strokeWidth={2}
                  name="Actual Emissions"
                />
                <Area 
                  type="monotone" 
                  dataKey="goals" 
                  stroke="#10b981" 
                  fill="url(#colorGoals)"
                  strokeWidth={2}
                  name="Target Goals"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}