import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";
import { 
  TrendingUp, 
  TrendingDown,
  BarChart3, 
  Users,
  Building,
  Globe,
  ArrowUp,
  ArrowDown,
  Minus,
  RefreshCw,
  Filter,
  Calendar,
  Target
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  ComposedChart,
  Area,
  AreaChart
} from "recharts";

interface ComparisonData {
  period: string;
  myEmissions: number;
  industryAverage: number;
  regionalAverage: number;
  bestInClass: number;
  difference: number;
  trend: 'up' | 'down' | 'stable';
}

interface BenchmarkData {
  category: string;
  myValue: number;
  industryAverage: number;
  topPerformers: number;
  unit: string;
  percentile: number;
}

export default function Comparison() {
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('6months');
  const [comparisonType, setComparisonType] = useState('industry');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { toast } = useToast();

  const [comparisonData, setComparisonData] = useState<ComparisonData[]>([]);
  const [benchmarkData, setBenchmarkData] = useState<BenchmarkData[]>([]);
  const [summaryStats, setSummaryStats] = useState({
    myTotal: 0,
    industryAverage: 0,
    percentileBetter: 0,
    improvement: 0
  });

  useEffect(() => {
    loadComparisonData();
  }, [timeRange, comparisonType, selectedCategory]);

  const loadComparisonData = async () => {
    try {
      setLoading(true);
      
      // Get user's actual emission data
      const [userHistory, categoryBreakdown] = await Promise.all([
        apiService.getEmissionHistory(),
        apiService.getCategoryBreakdown(timeRange)
      ]);

      // Calculate user's total emissions
      const userTotal = userHistory.reduce((sum: number, item: any) => sum + item.emissions, 0);

      // Industry benchmarks (these could come from a benchmarking API in the future)
      const industryBenchmarks = {
        electricity: { average: 580.2, topPerformers: 320.1 },
        travel: { average: 450.8, topPerformers: 220.5 },
        fuel: { average: 320.4, topPerformers: 180.3 },
        waste: { average: 229.1, topPerformers: 95.7 },
        total: { average: 1580.3, topPerformers: 950.0 }
      };

      // Create comparison data from user's actual emissions
      const comparisonData: ComparisonData[] = userHistory.slice(-6).map((item: any, index: number) => {
        const monthDate = new Date(item.date + '-01');
        const monthName = monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        const industryAvg = industryBenchmarks.total.average / 12; // Monthly average
        const bestInClass = industryBenchmarks.total.topPerformers / 12;
        const difference = ((item.emissions - industryAvg) / industryAvg) * 100;
        
        return {
          period: monthName,
          myEmissions: Math.round(item.emissions),
          industryAverage: Math.round(industryAvg),
          regionalAverage: Math.round(industryAvg * 0.9), // Assume regional is 10% better
          bestInClass: Math.round(bestInClass),
          difference: Math.round(difference),
          trend: difference < -5 ? 'down' : difference > 5 ? 'up' : 'stable'
        };
      });

      // Create benchmark data from category breakdown
      const benchmarkData: BenchmarkData[] = categoryBreakdown.data?.map((category: any) => {
        const categoryKey = category.category.toLowerCase() as keyof typeof industryBenchmarks;
        const benchmark = industryBenchmarks[categoryKey] || { average: category.value * 1.5, topPerformers: category.value * 0.8 };
        const percentile = Math.min(95, Math.max(5, 100 - ((category.value / benchmark.average) * 100)));
        
        return {
          category: category.category,
          myValue: category.value,
          industryAverage: benchmark.average,
          topPerformers: benchmark.topPerformers,
          unit: 'kg CO₂',
          percentile: Math.round(percentile)
        };
      }) || [];

      // Calculate summary stats
      const improvement = userTotal > 0 ? ((userTotal - industryBenchmarks.total.average) / industryBenchmarks.total.average) * 100 : 0;
      const percentileBetter = Math.min(95, Math.max(5, 100 - ((userTotal / industryBenchmarks.total.average) * 100)));

      setSummaryStats({
        myTotal: userTotal,
        industryAverage: industryBenchmarks.total.average,
        percentileBetter: Math.round(percentileBetter),
        improvement: Math.round(improvement)
      });

      setComparisonData(comparisonData);
      setBenchmarkData(benchmarkData);

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load comparison data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <ArrowUp className="w-4 h-4 text-destructive" />;
      case 'down':
        return <ArrowDown className="w-4 h-4 text-primary" />;
      default:
        return <Minus className="w-4 h-4 text-slate-500" />;
    }
  };

  const getPerformanceColor = (percentile: number) => {
    if (percentile >= 80) return 'text-primary dark:text-primary';
    if (percentile >= 60) return 'text-chart-2 dark:text-chart-2';
    return 'text-destructive dark:text-destructive';
  };

  const getPerformanceBadge = (percentile: number) => {
    if (percentile >= 80) return { label: 'Excellent', variant: 'default' as const };
    if (percentile >= 60) return { label: 'Good', variant: 'secondary' as const };
    return { label: 'Needs Improvement', variant: 'destructive' as const };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Comparison Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-400">Compare your performance with industry benchmarks</p>
        </div>
        <Button onClick={loadComparisonData} variant="outline" size="sm" disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-white/80 dark:bg-slate-800/90 backdrop-blur-xl border-white/40 dark:border-slate-600/40 shadow-lg">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Time Range</label>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3months">Last 3 Months</SelectItem>
                  <SelectItem value="6months">Last 6 Months</SelectItem>
                  <SelectItem value="12months">Last 12 Months</SelectItem>
                  <SelectItem value="24months">Last 24 Months</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Comparison Type</label>
              <Select value={comparisonType} onValueChange={setComparisonType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select comparison" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="industry">Industry Average</SelectItem>
                  <SelectItem value="regional">Regional Average</SelectItem>
                  <SelectItem value="global">Global Average</SelectItem>
                  <SelectItem value="similar">Similar Companies</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="electricity">Electricity</SelectItem>
                  <SelectItem value="travel">Travel</SelectItem>
                  <SelectItem value="fuel">Fuel</SelectItem>
                  <SelectItem value="waste">Waste</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white/80 dark:bg-slate-800/90 backdrop-blur-xl border-white/40 dark:border-slate-600/40 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Your Total</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {summaryStats.myTotal.toFixed(1)}
                </p>
                <p className="text-xs text-slate-500">kg CO₂</p>
              </div>
              <Building className="w-8 h-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-slate-800/90 backdrop-blur-xl border-white/40 dark:border-slate-600/40 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Industry Avg</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {summaryStats.industryAverage.toFixed(1)}
                </p>
                <p className="text-xs text-slate-500">kg CO₂</p>
              </div>
              <Users className="w-8 h-8 text-slate-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-slate-800/90 backdrop-blur-xl border-white/40 dark:border-slate-600/40 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Percentile</p>
                <p className="text-2xl font-bold text-primary dark:text-primary">
                  {summaryStats.percentileBetter}th
                </p>
                <p className="text-xs text-slate-500">Better than peers</p>
              </div>
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-slate-800/90 backdrop-blur-xl border-white/40 dark:border-slate-600/40 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Improvement</p>
                <div className="flex items-center gap-1">
                  <p className="text-2xl font-bold text-primary dark:text-primary">
                    {Math.abs(summaryStats.improvement).toFixed(1)}%
                  </p>
                  <ArrowDown className="w-5 h-5 text-primary" />
                </div>
                <p className="text-xs text-slate-500">vs last period</p>
              </div>
              <Target className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trend Comparison Chart */}
      <Card className="bg-white/80 dark:bg-slate-800/90 backdrop-blur-xl border-white/40 dark:border-slate-600/40 shadow-lg">
        <CardHeader>
          <CardTitle>Performance Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number, name: string) => [`${value} kg CO₂`, name]}
                  labelFormatter={(label) => `Period: ${label}`}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="industryAverage" 
                  fill="#e2e8f0" 
                  stroke="#64748b" 
                  fillOpacity={0.3}
                  name="Industry Average"
                />
                <Area 
                  type="monotone" 
                  dataKey="regionalAverage" 
                  fill="#d1fae5" 
                  stroke="#10b981" 
                  fillOpacity={0.3}
                  name="Regional Average"
                />
                <Line 
                  type="monotone" 
                  dataKey="myEmissions" 
                  stroke="#059669" 
                  strokeWidth={3}
                  name="Your Emissions"
                />
                <Line 
                  type="monotone" 
                  dataKey="bestInClass" 
                  stroke="#047857" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Best in Class"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Category Benchmarks */}
      <Card className="bg-white/80 dark:bg-slate-800/90 backdrop-blur-xl border-white/40 dark:border-slate-600/40 shadow-lg">
        <CardHeader>
          <CardTitle>Category Benchmarks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {benchmarkData.map((benchmark, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900 dark:text-white">{benchmark.category}</h3>
                  <Badge {...getPerformanceBadge(benchmark.percentile)}>
                    {getPerformanceBadge(benchmark.percentile).label}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Your Performance</span>
                    <span className="font-medium">{benchmark.myValue.toFixed(1)} {benchmark.unit}</span>
                  </div>
                  
                  <Progress value={benchmark.percentile} className="h-3" />
                  
                  <div className="grid grid-cols-3 gap-4 text-xs text-slate-500">
                    <div>
                      <span className="block font-medium">Top Performers</span>
                      <span>{benchmark.topPerformers.toFixed(1)} {benchmark.unit}</span>
                    </div>
                    <div>
                      <span className="block font-medium">Industry Avg</span>
                      <span>{benchmark.industryAverage.toFixed(1)} {benchmark.unit}</span>
                    </div>
                    <div>
                      <span className="block font-medium">Your Percentile</span>
                      <span className={getPerformanceColor(benchmark.percentile)}>
                        {benchmark.percentile}th
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Insights & Recommendations */}
      <Card className="bg-white/80 dark:bg-slate-800/90 backdrop-blur-xl border-white/40 dark:border-slate-600/40 shadow-lg">
        <CardHeader>
          <CardTitle>Insights & Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-slate-900 dark:text-white">Strengths</h4>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Your waste management is in the 81st percentile - excellent performance
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    18.5% improvement over last period shows strong commitment
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Consistently below industry average across all categories
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-slate-900 dark:text-white">Opportunities</h4>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-chart-2 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Travel emissions could be reduced by 30% to match top performers
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-chart-2 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Consider implementing energy efficiency measures for electricity
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-chart-2 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Fuel optimization could move you to 85th percentile
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}