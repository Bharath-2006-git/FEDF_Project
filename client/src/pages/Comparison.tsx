import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";
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

  // Sample comparison data
  const [comparisonData, setComparisonData] = useState<ComparisonData[]>([]);
  const [benchmarkData, setBenchmarkData] = useState<BenchmarkData[]>([]);
  const [summaryStats, setSummaryStats] = useState({
    myTotal: 1250.5,
    industryAverage: 1580.3,
    percentileBetter: 72,
    improvement: -18.5
  });

  useEffect(() => {
    loadComparisonData();
  }, [timeRange, comparisonType, selectedCategory]);

  const loadComparisonData = async () => {
    try {
      setLoading(true);
      
      // Simulate API call with realistic comparison data
      const mockComparison: ComparisonData[] = [
        {
          period: 'Jan 2025',
          myEmissions: 280,
          industryAverage: 350,
          regionalAverage: 320,
          bestInClass: 180,
          difference: -20,
          trend: 'down'
        },
        {
          period: 'Feb 2025',
          myEmissions: 310,
          industryAverage: 365,
          regionalAverage: 340,
          bestInClass: 190,
          difference: -15,
          trend: 'down'
        },
        {
          period: 'Mar 2025',
          myEmissions: 290,
          industryAverage: 355,
          regionalAverage: 325,
          bestInClass: 185,
          difference: -18,
          trend: 'down'
        },
        {
          period: 'Apr 2025',
          myEmissions: 340,
          industryAverage: 370,
          regionalAverage: 345,
          bestInClass: 200,
          difference: -8,
          trend: 'stable'
        },
        {
          period: 'May 2025',
          myEmissions: 320,
          industryAverage: 360,
          regionalAverage: 335,
          bestInClass: 195,
          difference: -11,
          trend: 'down'
        },
        {
          period: 'Jun 2025',
          myEmissions: 300,
          industryAverage: 358,
          regionalAverage: 330,
          bestInClass: 188,
          difference: -16,
          trend: 'down'
        }
      ];

      const mockBenchmarks: BenchmarkData[] = [
        {
          category: 'Electricity',
          myValue: 450.3,
          industryAverage: 580.2,
          topPerformers: 320.1,
          unit: 'kg CO₂',
          percentile: 78
        },
        {
          category: 'Travel',
          myValue: 380.7,
          industryAverage: 450.8,
          topPerformers: 220.5,
          unit: 'kg CO₂',
          percentile: 65
        },
        {
          category: 'Fuel',
          myValue: 250.1,
          industryAverage: 320.4,
          topPerformers: 180.3,
          unit: 'kg CO₂',
          percentile: 72
        },
        {
          category: 'Waste',
          myValue: 169.4,
          industryAverage: 229.1,
          topPerformers: 95.7,
          unit: 'kg CO₂',
          percentile: 81
        }
      ];

      setComparisonData(mockComparison);
      setBenchmarkData(mockBenchmarks);

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
      <Card>
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
        <Card>
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

        <Card>
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

        <Card>
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

        <Card>
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
      <Card>
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
      <Card>
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
      <Card>
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
  );
}