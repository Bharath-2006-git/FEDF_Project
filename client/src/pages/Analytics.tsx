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
  PieChart as PieChartIcon,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Flame,
  Droplet,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  Sparkles
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
  ComposedChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
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
  const [activeTab, setActiveTab] = useState('overview');

  // AI-Powered Insights
  const insights = React.useMemo(() => {
    if (!data || !data.categoryBreakdown || data.categoryBreakdown.length === 0) return null;

    const totalEmissions = data.categoryBreakdown.reduce((sum, cat) => sum + cat.value, 0);
    const highestCategory = data.categoryBreakdown.reduce((max, cat) => cat.value > max.value ? cat : max, data.categoryBreakdown[0]);
    const improvingCategories = data.categoryBreakdown.filter(cat => cat.trend < 0);
    const worseningCategories = data.categoryBreakdown.filter(cat => cat.trend > 0);
    
    // Calculate trend
    const monthlyData = data.monthlyComparison || [];
    const recentTrend = monthlyData.length > 1 
      ? monthlyData[monthlyData.length - 1].current - monthlyData[monthlyData.length - 2].current
      : 0;
    
    // Performance score (0-100)
    const goalsMetPercentage = data.yearlyTrends.length > 0
      ? (data.yearlyTrends.filter(y => y.achieved).length / data.yearlyTrends.length) * 100
      : 0;
    const improvementScore = improvingCategories.length > 0 
      ? (improvingCategories.length / data.categoryBreakdown.length) * 100 
      : 0;
    const performanceScore = Math.round((goalsMetPercentage * 0.6) + (improvementScore * 0.4));

    return {
      totalEmissions,
      highestCategory,
      improvingCategories,
      worseningCategories,
      recentTrend,
      performanceScore,
      goalsMetPercentage,
      improvementScore
    };
  }, [data]);

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
        monthlyComparison: monthlyRes.data || monthlyRes,
        categoryBreakdown: categoryRes.data || categoryRes,
        yearlyTrends: yearlyRes.data || yearlyRes,
        peakAnalysis: peakRes.data || peakRes
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
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              Advanced Analytics
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              AI-powered insights into your carbon emission patterns and trends
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
            <Button 
              onClick={handleExport}
              variant="outline"
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* AI Performance Score Card */}
        {insights && (
          <Alert className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 border-emerald-300 dark:border-emerald-700">
            <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <AlertDescription className="text-slate-900 dark:text-slate-100">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <strong className="text-lg">Your Carbon Performance Score: {insights.performanceScore}/100</strong>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {insights.recentTrend < 0 ? (
                      <>✨ Great job! Your emissions are trending downward by {Math.abs(insights.recentTrend).toFixed(1)} kg CO₂</>
                    ) : insights.recentTrend > 0 ? (
                      <>⚠️ Emissions increased by {insights.recentTrend.toFixed(1)} kg CO₂. Focus on {insights.highestCategory.category} to improve.</>
                    ) : (
                      <>📊 Emissions are stable. Keep up the good work!</>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      {insights.improvingCategories.length}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">Improving</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {insights.worseningCategories.length}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">Need Focus</div>
                  </div>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Key Metrics - Enhanced with Better Visuals */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-red-200 dark:border-red-800 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">Peak Day</CardTitle>
              <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-lg">
                <Flame className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                {data?.peakAnalysis.highestDay.value.toFixed(1)}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                kg CO₂ on {new Date(data?.peakAnalysis.highestDay.date || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
              <div className="mt-3">
                <div className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                  <AlertTriangle className="w-3 h-3" />
                  Highest emissions recorded
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-200 dark:border-emerald-800 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">Best Day</CardTitle>
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg">
                <Droplet className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                {data?.peakAnalysis.lowestDay.value.toFixed(1)}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                kg CO₂ on {new Date(data?.peakAnalysis.lowestDay.date || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
              <div className="mt-3">
                <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" />
                  Lowest emissions recorded
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">Daily Average</CardTitle>
              <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {data?.peakAnalysis.averageDaily.toFixed(1)}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                kg CO₂ per day
              </p>
              <div className="mt-3">
                <Progress 
                  value={Math.min((data?.peakAnalysis.averageDaily || 0) / (data?.peakAnalysis.highestDay.value || 1) * 100, 100)} 
                  className="h-2"
                />
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  {((data?.peakAnalysis.averageDaily || 0) / (data?.peakAnalysis.highestDay.value || 1) * 100).toFixed(0)}% of peak
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">Goals Achievement</CardTitle>
              <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                <Award className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {data?.yearlyTrends.filter(year => year.achieved).length || 0}/{data?.yearlyTrends.length || 0}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {Math.round(((data?.yearlyTrends.filter(year => year.achieved).length || 0) / (data?.yearlyTrends.length || 1)) * 100)}% success rate
              </p>
              <div className="mt-3">
                <Progress 
                  value={Math.round(((data?.yearlyTrends.filter(year => year.achieved).length || 0) / (data?.yearlyTrends.length || 1)) * 100)} 
                  className="h-2"
                />
                <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                  Keep pushing forward! 🎯
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Different Analytics Views */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
            <TabsTrigger value="overview" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="trends" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <TrendingUp className="w-4 h-4 mr-2" />
              Trends
            </TabsTrigger>
            <TabsTrigger value="categories" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <PieChartIcon className="w-4 h-4 mr-2" />
              Categories
            </TabsTrigger>
            <TabsTrigger value="insights" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
              <Sparkles className="w-4 h-4 mr-2" />
              AI Insights
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
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
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {/* Yearly Trends Chart */}
              <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-white/40 dark:border-slate-700/40 shadow-lg">
                <CardHeader className="border-b border-slate-200 dark:border-slate-700">
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    Yearly Performance vs Goals
                  </CardTitle>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Compare actual emissions against your targets over time
                  </p>
                </CardHeader>
                <CardContent className="pt-6">
                  <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={data?.yearlyTrends || []}>
                      <defs>
                        <linearGradient id="colorEmissions2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                        </linearGradient>
                        <linearGradient id="colorGoals2" x1="0" y1="0" x2="0" y2="1">
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
                        fill="url(#colorEmissions2)"
                        strokeWidth={2}
                        name="Actual Emissions"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="goals" 
                        stroke="#10b981" 
                        fill="url(#colorGoals2)"
                        strokeWidth={2}
                        name="Target Goals"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Monthly Trend Details */}
              <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-white/40 dark:border-slate-700/40 shadow-lg">
                <CardHeader className="border-b border-slate-200 dark:border-slate-700">
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <TrendingDown className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    Monthly Trend Analysis
                  </CardTitle>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Detailed monthly comparison showing improvement areas
                  </p>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    {data?.monthlyComparison.slice(-6).reverse().map((month, index) => (
                      <div 
                        key={month.month}
                        className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900/50 border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-2xl font-bold text-slate-400 dark:text-slate-600">
                            #{index + 1}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white">
                              {month.month}
                            </div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                              Current: {month.current.toFixed(1)} kg | Previous: {month.previous.toFixed(1)} kg
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge 
                            variant={month.change < 0 ? "default" : "destructive"}
                            className={`text-sm px-3 py-1 ${
                              month.change < 0 
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            }`}
                          >
                            {month.change < 0 ? (
                              <ArrowDownRight className="w-4 h-4 mr-1" />
                            ) : (
                              <ArrowUpRight className="w-4 h-4 mr-1" />
                            )}
                            {Math.abs(month.change).toFixed(1)}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-white/40 dark:border-slate-700/40 shadow-lg">
                <CardHeader className="border-b border-slate-200 dark:border-slate-700">
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <PieChartIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    Category Distribution
                  </CardTitle>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Your emissions breakdown by category
                  </p>
                </CardHeader>
                <CardContent className="pt-6">
                  <ResponsiveContainer width="100%" height={320}>
                    <PieChart>
                      <Pie
                        data={data?.categoryBreakdown || []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ category, percentage }) => `${category}: ${percentage.toFixed(0)}%`}
                        outerRadius={100}
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
                    Category Performance
                  </CardTitle>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Track improvements and areas needing attention
                  </p>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    {data?.categoryBreakdown
                      .sort((a, b) => b.value - a.value)
                      .map((category, index) => (
                        <div 
                          key={category.category} 
                          className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900/50 border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div 
                              className="w-10 h-10 rounded-full shadow-sm flex items-center justify-center text-white font-bold"
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            >
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-slate-900 dark:text-white">
                                {category.category}
                              </div>
                              <div className="text-sm text-slate-600 dark:text-slate-400">
                                {category.value.toFixed(1)} kg CO₂ ({category.percentage.toFixed(1)}%)
                              </div>
                              <Progress 
                                value={category.percentage} 
                                className="h-1.5 mt-2"
                                style={{ 
                                  backgroundColor: `${COLORS[index % COLORS.length]}20`
                                }}
                              />
                            </div>
                          </div>
                          <Badge 
                            variant={category.trend < 0 ? "default" : "destructive"}
                            className={`ml-3 ${
                              category.trend < 0 
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            }`}
                          >
                            {category.trend < 0 ? (
                              <TrendingDown className="w-3 h-3 mr-1" />
                            ) : (
                              <TrendingUp className="w-3 h-3 mr-1" />
                            )}
                            {Math.abs(category.trend).toFixed(1)}%
                          </Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            {insights && (
              <>
                {/* Key Insights Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-200 dark:border-emerald-800 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                        <CheckCircle2 className="w-5 h-5" />
                        Improving Areas
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-4xl font-bold text-emerald-600 dark:text-emerald-400 mb-4">
                        {insights.improvingCategories.length}
                      </div>
                      <div className="space-y-2">
                        {insights.improvingCategories.slice(0, 3).map((cat) => (
                          <div key={cat.category} className="flex items-center justify-between text-sm">
                            <span className="text-slate-700 dark:text-slate-300">{cat.category}</span>
                            <Badge variant="default" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                              <TrendingDown className="w-3 h-3 mr-1" />
                              {Math.abs(cat.trend).toFixed(1)}%
                            </Badge>
                          </div>
                        ))}
                      </div>
                      {insights.improvingCategories.length === 0 && (
                        <p className="text-sm text-slate-600 dark:text-slate-400">No improvements yet. Keep logging!</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-red-200 dark:border-red-800 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-300">
                        <AlertTriangle className="w-5 h-5" />
                        Need Attention
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-4xl font-bold text-red-600 dark:text-red-400 mb-4">
                        {insights.worseningCategories.length}
                      </div>
                      <div className="space-y-2">
                        {insights.worseningCategories.slice(0, 3).map((cat) => (
                          <div key={cat.category} className="flex items-center justify-between text-sm">
                            <span className="text-slate-700 dark:text-slate-300">{cat.category}</span>
                            <Badge variant="destructive" className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              {cat.trend.toFixed(1)}%
                            </Badge>
                          </div>
                        ))}
                      </div>
                      {insights.worseningCategories.length === 0 && (
                        <p className="text-sm text-slate-600 dark:text-slate-400">All categories stable or improving! 🎉</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                        <Target className="w-5 h-5" />
                        Top Emitter
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                        {insights.highestCategory.category}
                      </div>
                      <div className="text-lg text-slate-700 dark:text-slate-300 mb-4">
                        {insights.highestCategory.value.toFixed(1)} kg CO₂
                      </div>
                      <Progress 
                        value={insights.highestCategory.percentage} 
                        className="h-3 mb-2"
                      />
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {insights.highestCategory.percentage.toFixed(1)}% of total emissions
                      </p>
                      <Alert className="mt-4 bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700">
                        <Info className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <AlertDescription className="text-purple-700 dark:text-purple-300 text-xs">
                          Focus your reduction efforts here for maximum impact
                        </AlertDescription>
                      </Alert>
                    </CardContent>
                  </Card>
                </div>

                {/* Recommendations */}
                <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border-amber-200 dark:border-amber-800 shadow-lg">
                  <CardHeader className="border-b border-amber-200 dark:border-amber-800">
                    <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
                      <Sparkles className="w-5 h-5" />
                      AI-Powered Recommendations
                    </CardTitle>
                    <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                      Personalized action items based on your emission patterns
                    </p>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {insights.recentTrend > 0 && (
                        <Alert className="bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700">
                          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                          <AlertDescription className="text-red-900 dark:text-red-300">
                            <strong>Priority Action:</strong> Your emissions increased by {insights.recentTrend.toFixed(1)} kg CO₂ recently. 
                            Focus on reducing <strong>{insights.highestCategory.category}</strong> emissions first - it accounts for {insights.highestCategory.percentage.toFixed(1)}% of your footprint.
                          </AlertDescription>
                        </Alert>
                      )}
                      
                      {insights.recentTrend < 0 && (
                        <Alert className="bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                          <AlertDescription className="text-emerald-900 dark:text-emerald-300">
                            <strong>Great Progress!</strong> You reduced emissions by {Math.abs(insights.recentTrend).toFixed(1)} kg CO₂. 
                            Keep up the momentum by maintaining your {insights.improvingCategories.map(c => c.category).join(', ')} improvements.
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                          <div className="flex items-center gap-2 mb-2">
                            <Zap className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            <h4 className="font-semibold text-slate-900 dark:text-white">Quick Win</h4>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Review the <strong>Tips page</strong> for personalized actions targeting your highest emission categories
                          </p>
                        </div>

                        <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                          <div className="flex items-center gap-2 mb-2">
                            <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            <h4 className="font-semibold text-slate-900 dark:text-white">Set a Goal</h4>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Reduce <strong>{insights.highestCategory.category}</strong> emissions by 10% this month to see significant improvements
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div>
                          <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-1">Performance Score</h4>
                          <p className="text-sm text-blue-700 dark:text-blue-400">
                            You're in the <strong>{insights.performanceScore >= 75 ? 'Excellent' : insights.performanceScore >= 50 ? 'Good' : 'Getting Started'}</strong> range
                          </p>
                        </div>
                        <div className="text-5xl font-bold text-blue-600 dark:text-blue-400">
                          {insights.performanceScore}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}