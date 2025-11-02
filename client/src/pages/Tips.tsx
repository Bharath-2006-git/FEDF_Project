import React, { useState, useEffect } from "react";
import { useAuth, useRoleAccess } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PageHeader } from "@/components/shared/PageHeader";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Lightbulb, 
  Zap, 
  Car, 
  Factory, 
  Trash2,
  Filter,
  RefreshCw,
  Leaf,
  Star,
  TrendingUp,
  CheckCircle2,
  Target,
  Award,
  Flame,
  TrendingDown,
  Users,
  Calendar,
  ArrowRight,
  BookOpen,
  BarChart3,
  Info,
  Clock,
  Trophy,
  Share2,
  Home,
  Utensils,
  ShoppingBag,
  Plane,
  Recycle
} from "lucide-react";

interface Tip {
  id: number;
  title: string;
  content: string;
  category: string;
  targetRole: string;
  impactLevel: string;
  isActive: string;
  estimatedSavings?: number; // kg CO2 per year
  difficulty?: 'easy' | 'medium' | 'hard';
  timeframe?: string;
}

interface CompletedTip {
  tipId: number;
  completedAt: string;
  estimatedSavings: number;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  reward: string;
  endDate: string;
  category: string;
}

const categoryIcons = {
  energy: Zap,
  transport: Car,
  industrial: Factory,
  waste: Trash2,
  electricity: Zap,
  travel: Car,
  fuel: Flame,
  all: Leaf
};

const impactColors = {
  low: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", 
  high: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
};

const difficultyColors = {
  easy: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  hard: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
};

export default function Tips() {
  const { user } = useAuth();
  const { isIndividual } = useRoleAccess();
  
  const [tips, setTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [visibleTips, setVisibleTips] = useState<number>(12);
  const [impactFilter, setImpactFilter] = useState<string>("all");
  const [userEmissions, setUserEmissions] = useState<any[]>([]);
  const [topCategories, setTopCategories] = useState<string[]>([]);
  const [categoryEmissions, setCategoryEmissions] = useState<Record<string, number>>({});
  const [showPersonalized, setShowPersonalized] = useState(true);
  const [loadingEmissions, setLoadingEmissions] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [completedTips, setCompletedTips] = useState<CompletedTip[]>([]);
  const [totalUserEmissions, setTotalUserEmissions] = useState<number>(0);
  const [potentialSavings, setPotentialSavings] = useState<number>(0);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setLoadingEmissions(true);
      await Promise.all([
        fetchTips(),
        fetchUserEmissions(),
        loadCompletedTips()
      ]);
      setLoading(false);
      setLoadingEmissions(false);
    };
    loadData();
  }, [user?.role]);

  // Load completed tips from localStorage
  const loadCompletedTips = async () => {
    try {
      const saved = localStorage.getItem('carbonSense_completedTips');
      if (saved) {
        setCompletedTips(JSON.parse(saved));
      }
    } catch (err) {
      console.error('Failed to load completed tips:', err);
    }
  };

  // Save completed tips to localStorage
  const saveCompletedTips = (completed: CompletedTip[]) => {
    try {
      localStorage.setItem('carbonSense_completedTips', JSON.stringify(completed));
      setCompletedTips(completed);
    } catch (err) {
      console.error('Failed to save completed tips:', err);
    }
  };

  // Toggle tip completion
  const toggleTipCompletion = (tipId: number, estimatedSavings: number = 0) => {
    const isCompleted = completedTips.some(ct => ct.tipId === tipId);
    
    if (isCompleted) {
      // Remove from completed
      const updated = completedTips.filter(ct => ct.tipId !== tipId);
      saveCompletedTips(updated);
    } else {
      // Add to completed
      const newCompleted: CompletedTip = {
        tipId,
        completedAt: new Date().toISOString(),
        estimatedSavings
      };
      saveCompletedTips([...completedTips, newCompleted]);
    }
  };

  const fetchUserEmissions = async () => {
    try {
      const response = await fetch('/api/emissions/history', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('carbonSense_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const emissions = data.emissions || data;
        console.log('📊 User emissions data:', emissions);
        setUserEmissions(emissions);

        if (emissions && emissions.length > 0) {
          // Calculate total emissions
          const total = emissions.reduce((sum: number, e: any) => sum + (e.co2Emissions || 0), 0);
          setTotalUserEmissions(total);

          // Calculate emission totals per category with detailed analysis
          const categoryTotals: Record<string, number> = {};
          emissions.forEach((emission: any) => {
            const cat = emission.category?.toLowerCase() || 'other';
            categoryTotals[cat] = (categoryTotals[cat] || 0) + (emission.co2Emissions || 0);
          });

          console.log('📈 Category totals:', categoryTotals);
          setCategoryEmissions(categoryTotals);

          // Get ALL categories sorted by emissions (not just top 3)
          const sorted = Object.entries(categoryTotals)
            .sort(([, a], [, b]) => b - a)
            .map(([cat]) => cat);
          
          console.log('🎯 All categories sorted:', sorted);
          setTopCategories(sorted); // Now contains all categories in order
        } else {
          console.log('⚠️ No emission data found');
        }
      }
    } catch (err) {
      console.error('❌ Failed to fetch user emissions:', err);
    }
  };

  const fetchTips = async () => {
    try {
      const role = user?.role || 'individual';
      const category = categoryFilter === 'all' ? undefined : categoryFilter;
      
      const response = await fetch(`/api/tips?role=${role}${category ? `&category=${category}` : ''}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('carbonSense_token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tips');
      }

      const data = await response.json();
      const tipsData = data.tips || data;
      
      // Enhance tips with estimated savings and difficulty
      const enhancedTips = tipsData.map((tip: Tip) => ({
        ...tip,
        estimatedSavings: calculateEstimatedSavings(tip),
        difficulty: calculateDifficulty(tip),
        timeframe: calculateTimeframe(tip)
      }));
      
      setTips(enhancedTips);
      
      // Calculate potential savings
      const totalPotential = enhancedTips.reduce((sum: number, tip: Tip) => 
        sum + (tip.estimatedSavings || 0), 0
      );
      setPotentialSavings(totalPotential);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Calculate estimated CO2 savings based on tip impact level and category
  const calculateEstimatedSavings = (tip: Tip): number => {
    const baseValues = {
      high: { energy: 500, transport: 800, industrial: 1000, waste: 300, electricity: 450, travel: 750, fuel: 400 },
      medium: { energy: 200, transport: 300, industrial: 400, waste: 150, electricity: 180, travel: 280, fuel: 160 },
      low: { energy: 50, transport: 80, industrial: 100, waste: 40, electricity: 45, travel: 70, fuel: 50 }
    };
    
    const level = tip.impactLevel as keyof typeof baseValues;
    const category = tip.category as keyof typeof baseValues.high;
    
    return baseValues[level]?.[category] || baseValues[level]?.energy || 100;
  };

  // Calculate difficulty based on content
  const calculateDifficulty = (tip: Tip): 'easy' | 'medium' | 'hard' => {
    const content = tip.content.toLowerCase();
    if (content.includes('simply') || content.includes('just') || content.includes('easy')) return 'easy';
    if (content.includes('install') || content.includes('invest') || content.includes('upgrade')) return 'hard';
    return 'medium';
  };

  // Calculate implementation timeframe
  const calculateTimeframe = (tip: Tip): string => {
    const difficulty = calculateDifficulty(tip);
    if (difficulty === 'easy') return 'Today';
    if (difficulty === 'medium') return 'This week';
    return 'This month';
  };

  // Get smart-sorted tips based on user's emission data
  const smartSortedTips = React.useMemo(() => {
    if (topCategories.length === 0 || Object.keys(categoryEmissions).length === 0) {
      // No emission data, return tips sorted by impact level
      return [...tips].sort((a, b) => {
        const impactOrder = { high: 3, medium: 2, low: 1 };
        return (impactOrder[b.impactLevel as keyof typeof impactOrder] || 0) - 
               (impactOrder[a.impactLevel as keyof typeof impactOrder] || 0);
      });
    }
    
    // Score each tip based on user's emission pattern
    const scoredTips = tips.map(tip => {
      const tipCategory = tip.category.toLowerCase();
      const categoryEmission = categoryEmissions[tipCategory] || 0;
      const categoryRank = topCategories.indexOf(tipCategory);
      
      // Calculate relevance score
      let score = 0;
      
      // Higher score for categories with more emissions
      if (categoryEmission > 0) {
        score += categoryEmission / totalUserEmissions * 1000; // Weight by % of total emissions
      }
      
      // Bonus for top categories
      if (categoryRank >= 0 && categoryRank < 3) {
        score += (3 - categoryRank) * 100; // Top 3 categories get bonus
      }
      
      // Impact level bonus
      const impactBonus = { high: 50, medium: 30, low: 10 };
      score += impactBonus[tip.impactLevel as keyof typeof impactBonus] || 0;
      
      // Bonus for high savings
      score += (tip.estimatedSavings || 0) / 10;
      
      return { ...tip, relevanceScore: score };
    });
    
    // Sort by relevance score
    const sorted = scoredTips.sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    console.log('🎯 Smart-sorted tips:', sorted.slice(0, 5).map(t => ({
      title: t.title,
      category: t.category,
      score: t.relevanceScore,
      emission: categoryEmissions[t.category.toLowerCase()]
    })));
    
    return sorted;
  }, [tips, topCategories, categoryEmissions, totalUserEmissions]);

  // Get top priority tips for user's highest emission categories
  const priorityTips = React.useMemo(() => {
    if (topCategories.length === 0) return [];
    
    // Get tips for top 3 emission categories
    const topThreeCategories = topCategories.slice(0, 3);
    
    const matched = tips.filter(tip => 
      topThreeCategories.includes(tip.category.toLowerCase())
    );
    
    // Sort by impact level and estimated savings
    const sorted = matched.sort((a, b) => {
      const impactOrder = { high: 3, medium: 2, low: 1 };
      const impactDiff = (impactOrder[b.impactLevel as keyof typeof impactOrder] || 0) - 
                        (impactOrder[a.impactLevel as keyof typeof impactOrder] || 0);
      
      if (impactDiff !== 0) return impactDiff;
      return (b.estimatedSavings || 0) - (a.estimatedSavings || 0);
    });
    
    console.log('💡 Priority tips for top categories:', topThreeCategories, 'Count:', sorted.length);
    return sorted;
  }, [tips, topCategories]);

  // Calculate achieved savings from completed tips
  const achievedSavings = React.useMemo(() => {
    return completedTips.reduce((sum, ct) => sum + ct.estimatedSavings, 0);
  }, [completedTips]);

  // Calculate completion percentage
  const completionRate = React.useMemo(() => {
    if (tips.length === 0) return 0;
    return Math.round((completedTips.length / tips.length) * 100);
  }, [completedTips.length, tips.length]);

  const filteredTips = tips.filter(tip => {
    const categoryMatch = categoryFilter === 'all' || tip.category === categoryFilter;
    const impactMatch = impactFilter === 'all' || tip.impactLevel === impactFilter;
    return categoryMatch && impactMatch;
  });

  // Smart sorting: Use emission data to show most relevant tips first
  const tipsToShow = React.useMemo(() => {
    if (activeTab === 'smart' && topCategories.length > 0) {
      // In smart tab, show tips sorted by relevance to user's emissions
      return smartSortedTips.filter(tip => {
        const categoryMatch = categoryFilter === 'all' || tip.category === categoryFilter;
        const impactMatch = impactFilter === 'all' || tip.impactLevel === impactFilter;
        return categoryMatch && impactMatch;
      });
    } else if (activeTab === 'priority' && priorityTips.length > 0) {
      // In priority tab, show only tips for top 3 categories
      return priorityTips.filter(tip => {
        const categoryMatch = categoryFilter === 'all' || tip.category === categoryFilter;
        const impactMatch = impactFilter === 'all' || tip.impactLevel === impactFilter;
        return categoryMatch && impactMatch;
      });
    } else {
      // In other tabs, show filtered tips
      return filteredTips;
    }
  }, [activeTab, smartSortedTips, priorityTips, filteredTips, categoryFilter, impactFilter, topCategories]);

  const displayedTips = tipsToShow.slice(0, visibleTips);
  const hasMoreTips = tipsToShow.length > visibleTips;

  const loadMoreTips = () => {
    setVisibleTips(prev => prev + 12);
  };

  const showAllTips = () => {
    setVisibleTips(filteredTips.length);
  };

  const handleRefresh = async () => {
    setLoading(true);
    setLoadingEmissions(true);
    await Promise.all([
      fetchTips(),
      fetchUserEmissions()
    ]);
    setLoading(false);
    setLoadingEmissions(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <PageHeader
          icon={<Lightbulb className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />}
          title="Climate Action Hub"
          description={isIndividual() 
            ? "Turn insights into action - Track, implement, and measure your impact"
            : "Drive organizational sustainability with data-driven initiatives"
          }
          actions={
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={loading || loadingEmissions}
              className="hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${(loading || loadingEmissions) ? 'animate-spin' : ''}`} />
              {(loading || loadingEmissions) ? 'Loading...' : 'Refresh'}
            </Button>
          }
        />

        {/* Hero Impact Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Your Impact Card */}
          <Card className="lg:col-span-2 bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Trophy className="w-7 h-7" />
                Your Climate Impact
              </CardTitle>
              <CardDescription className="text-emerald-50">
                Making a difference, one action at a time
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <p className="text-emerald-100 text-sm font-medium">Actions Completed</p>
                  <p className="text-5xl font-bold">{completedTips.length}</p>
                  <div className="flex items-center gap-2 text-emerald-100">
                    <Progress value={completionRate} className="h-2 bg-emerald-700" />
                    <span className="text-sm font-medium">{completionRate}%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-emerald-100 text-sm font-medium">CO₂ Reduced</p>
                  <p className="text-5xl font-bold">{achievedSavings.toFixed(0)}</p>
                  <p className="text-emerald-100 text-sm">kg/year saved</p>
                </div>
              </div>
              
              {achievedSavings > 0 && (
                <Alert className="bg-white/10 border-white/20 backdrop-blur">
                  <Leaf className="w-4 h-4" />
                  <AlertDescription className="text-white">
                    <strong>Equivalent to:</strong> {(achievedSavings / 411).toFixed(1)} trees planted or {(achievedSavings / 8.89).toFixed(0)} gallons of gas saved
                  </AlertDescription>
                </Alert>
              )}
              
              {completedTips.length === 0 && (
                <Alert className="bg-white/10 border-white/20 backdrop-blur">
                  <Target className="w-4 h-4" />
                  <AlertDescription className="text-white">
                    <strong>Get Started:</strong> Complete your first action below to start tracking your impact!
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Potential Savings Card */}
          <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="w-6 h-6" />
                Potential Impact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-blue-100 text-sm mb-2">Available Actions</p>
                <p className="text-4xl font-bold mb-1">{tips.length - completedTips.length}</p>
                <p className="text-blue-100 text-sm">tips to explore</p>
              </div>
              
              <div className="pt-4 border-t border-white/20">
                <p className="text-blue-100 text-sm mb-2">Possible Reduction</p>
                <p className="text-3xl font-bold mb-1">{(potentialSavings - achievedSavings).toFixed(0)}</p>
                <p className="text-blue-100 text-sm">kg CO₂/year more</p>
              </div>

              <Button 
                className="w-full bg-white text-blue-600 hover:bg-blue-50 font-semibold"
                onClick={() => setActiveTab("all")}
              >
                Explore Actions <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Your Emission Breakdown - Smart Analysis */}
        {!loadingEmissions && topCategories.length > 0 && Object.keys(categoryEmissions).length > 0 && (
          <Card className="border-2 border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-amber-900 dark:text-amber-400">
                    <Flame className="w-6 h-6 fill-current" />
                    Your Emission Hotspots
                  </CardTitle>
                  <CardDescription className="text-amber-700 dark:text-amber-300 mt-2">
                    We've analyzed your carbon footprint - here's where you can make the biggest impact
                  </CardDescription>
                </div>
                <Badge className="bg-amber-500 text-white border-0">
                  <BarChart3 className="w-3 h-3 mr-1" />
                  AI Analysis
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Top 3 Emission Categories with Bars */}
              <div className="space-y-3">
                {topCategories.slice(0, 3).map((category, index) => {
                  const emission = categoryEmissions[category] || 0;
                  const percentage = (emission / totalUserEmissions) * 100;
                  const categoryTips = tips.filter(t => t.category.toLowerCase() === category).length;
                  
                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Badge className={`${
                            index === 0 ? 'bg-red-500' : index === 1 ? 'bg-orange-500' : 'bg-amber-500'
                          } text-white border-0`}>
                            #{index + 1}
                          </Badge>
                          <span className="font-semibold capitalize">{category}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-amber-900 dark:text-amber-300">
                            {emission.toFixed(1)} kg CO₂
                          </span>
                          <span className="text-amber-700 dark:text-amber-400">
                            ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={percentage} 
                          className="h-3 flex-1 bg-amber-200 dark:bg-amber-900/30" 
                        />
                        <span className="text-xs text-amber-700 dark:text-amber-400 whitespace-nowrap">
                          {categoryTips} tips
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Alert className="bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700">
                <Info className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <AlertDescription className="text-amber-900 dark:text-amber-300">
                  <strong>Impact Insight:</strong> We've prioritized {priorityTips.length} actions targeting your top emission areas. Following these tips could reduce up to <strong>{priorityTips.reduce((sum, tip) => sum + (tip.estimatedSavings || 0), 0).toFixed(0)} kg CO₂/year</strong> - that's equivalent to <strong>{(priorityTips.reduce((sum, tip) => sum + (tip.estimatedSavings || 0), 0) / totalUserEmissions * 100).toFixed(1)}%</strong> of your total emissions!
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}

        {/* Info Card - Show when no emission data yet */}
        {!loadingEmissions && userEmissions.length === 0 && (
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                <BarChart3 className="w-6 h-6" />
                Unlock Personalized Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className="bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700">
                <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <AlertDescription className="text-blue-900 dark:text-blue-300">
                  <p className="font-semibold mb-2">Start tracking to get tailored advice!</p>
                  <p className="text-sm">Log your emissions to receive personalized recommendations based on your actual carbon footprint. We'll identify your biggest impact areas and suggest the most effective actions for you.</p>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}

        {/* Tabbed View with Filters */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <Card className="bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl border-white/30 dark:border-slate-700/30">
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <TabsList className="grid grid-cols-3 w-full sm:w-auto">
                  <TabsTrigger value="all" className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    All Tips
                    <Badge variant="secondary" className="ml-1">{tips.length}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="priority" className="flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    High Impact
                    <Badge variant="secondary" className="ml-1">{priorityTips.length}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="completed" className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Completed
                    <Badge variant="secondary" className="ml-1">{completedTips.length}</Badge>
                  </TabsTrigger>
                </TabsList>
                
                <div className="flex flex-wrap gap-2">
                  <Select value={categoryFilter} onValueChange={(value) => {
                    setCategoryFilter(value);
                    setVisibleTips(12);
                  }}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="energy">⚡ Energy</SelectItem>
                      <SelectItem value="electricity">� Electricity</SelectItem>
                      <SelectItem value="transport">🚗 Transport</SelectItem>
                      <SelectItem value="travel">✈️ Travel</SelectItem>
                      <SelectItem value="fuel">🔥 Fuel</SelectItem>
                      <SelectItem value="waste">♻️ Waste</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={impactFilter} onValueChange={(value) => {
                    setImpactFilter(value);
                    setVisibleTips(12);
                  }}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Impact" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Impact</SelectItem>
                      <SelectItem value="high">🔴 High</SelectItem>
                      <SelectItem value="medium">🟡 Medium</SelectItem>
                      <SelectItem value="low">🟢 Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mt-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Tips Grid with Tabs */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
          ) : (
            <>
              {/* All Tips Tab */}
              <TabsContent value="all" className="mt-6">
                {tips.length > 0 ? (
                  <>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {displayedTips.map((tip, index) => {
                        const IconComponent = categoryIcons[tip.category as keyof typeof categoryIcons] || Leaf;
                        const isCompleted = completedTips.some(ct => ct.tipId === tip.id);
                        const isPriority = priorityTips.find((p: Tip) => p.id === tip.id);
                        const tipCategoryEmission = categoryEmissions[tip.category.toLowerCase()] || 0;
                        const isHighEmissionCategory = topCategories.indexOf(tip.category.toLowerCase()) < 3;
                        const emissionPercentage = totalUserEmissions > 0 ? (tipCategoryEmission / totalUserEmissions * 100).toFixed(1) : '0';
                        
                        return (
                          <Card 
                            key={tip.id} 
                            className={`backdrop-blur-xl hover:shadow-xl transition-all duration-300 ${
                              isCompleted 
                                ? 'bg-emerald-50/50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700' 
                                : isHighEmissionCategory
                                ? 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-400 dark:border-amber-600'
                                : 'bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-700'
                            } ${!isCompleted && 'hover:scale-[1.02]'}`}
                          >
                            <CardHeader className="space-y-3">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-3 flex-1">
                                  <Checkbox
                                    checked={isCompleted}
                                    onCheckedChange={() => toggleTipCompletion(tip.id, tip.estimatedSavings || 0)}
                                    className="mt-1"
                                  />
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                                      <div className={`p-2 rounded-lg ${
                                        isHighEmissionCategory 
                                          ? 'bg-amber-100 dark:bg-amber-900/50' 
                                          : 'bg-emerald-100 dark:bg-emerald-900/30'
                                      }`}>
                                        <IconComponent className={`w-4 h-4 ${
                                          isHighEmissionCategory 
                                            ? 'text-amber-600 dark:text-amber-400' 
                                            : 'text-emerald-600 dark:text-emerald-400'
                                        }`} />
                                      </div>
                                      {index < 5 && isHighEmissionCategory && (
                                        <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                                          <Star className="w-3 h-3 mr-1 fill-current" />
                                          Top Match
                                        </Badge>
                                      )}
                                      {tipCategoryEmission > 0 && (
                                        <Badge variant="outline" className="text-xs border-amber-400 text-amber-700 dark:text-amber-300">
                                          {emissionPercentage}% of your emissions
                                        </Badge>
                                      )}
                                    </div>
                                    <CardTitle className={`text-base ${isCompleted && 'line-through text-slate-400'}`}>
                                      {tip.title}
                                    </CardTitle>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex flex-wrap gap-2">
                                <Badge className={`${impactColors[tip.impactLevel as keyof typeof impactColors]} border-0 text-xs`}>
                                  {tip.impactLevel} impact
                                </Badge>
                                <Badge className={`${difficultyColors[tip.difficulty as keyof typeof difficultyColors]} border-0 text-xs`}>
                                  {tip.difficulty}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {tip.timeframe}
                                </Badge>
                              </div>
                            </CardHeader>
                            
                            <CardContent className="space-y-4">
                              <p className={`text-sm leading-relaxed ${
                                isCompleted 
                                  ? 'text-slate-400 dark:text-slate-500' 
                                  : 'text-slate-600 dark:text-slate-300'
                              }`}>
                                {tip.content}
                              </p>
                              
                              <div className={`p-3 rounded-lg ${
                                isHighEmissionCategory 
                                  ? 'bg-amber-100 dark:bg-amber-900/30' 
                                  : 'bg-slate-100 dark:bg-slate-800'
                              }`}>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                                    {isHighEmissionCategory ? 'High-Priority Impact' : 'Potential Impact'}
                                  </span>
                                  <TrendingDown className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                  {tip.estimatedSavings} <span className="text-sm font-normal">kg CO₂/year</span>
                                </p>
                                {tipCategoryEmission > 0 && (
                                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    Could reduce your {tip.category} emissions by {((tip.estimatedSavings || 0) / tipCategoryEmission * 100).toFixed(1)}%
                                  </p>
                                )}
                              </div>

                              {isCompleted && (
                                <Alert className="bg-emerald-100 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-700">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                  <AlertDescription className="text-emerald-700 dark:text-emerald-300 text-sm">
                                    <strong>Completed!</strong> You're saving {tip.estimatedSavings} kg CO₂/year
                                  </AlertDescription>
                                </Alert>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <Card className="bg-white/70 dark:bg-slate-900/80">
                    <CardContent className="text-center py-12">
                      <Lightbulb className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Tips Available</h3>
                      <p className="text-slate-500 dark:text-slate-400 mb-4">
                        Start logging emissions to receive personalized sustainability tips
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="priority" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayedTips.map((tip) => {
                    const IconComponent = categoryIcons[tip.category as keyof typeof categoryIcons] || Leaf;
                    const isCompleted = completedTips.some(ct => ct.tipId === tip.id);
                    const isPriority = priorityTips.find((p: Tip) => p.id === tip.id);
                    const tipCategoryEmission = categoryEmissions[tip.category.toLowerCase()] || 0;
                    const isHighEmissionCategory = topCategories.indexOf(tip.category.toLowerCase()) < 3;
                    
                    return (
                      <Card 
                        key={tip.id} 
                        className={`backdrop-blur-xl hover:shadow-xl transition-all duration-300 ${
                          isCompleted 
                            ? 'bg-emerald-50/50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700' 
                            : isPriority 
                            ? 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-300 dark:border-amber-700'
                            : 'bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-700'
                        } ${!isCompleted && 'hover:scale-[1.02]'}`}
                      >
                        <CardHeader className="space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 flex-1">
                              <Checkbox
                                checked={isCompleted}
                                onCheckedChange={() => toggleTipCompletion(tip.id, tip.estimatedSavings || 0)}
                                className="mt-1"
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className={`p-2 rounded-lg ${
                                    isPriority 
                                      ? 'bg-amber-100 dark:bg-amber-900/50' 
                                      : 'bg-emerald-100 dark:bg-emerald-900/30'
                                  }`}>
                                    <IconComponent className={`w-4 h-4 ${
                                      isPriority 
                                        ? 'text-amber-600 dark:text-amber-400' 
                                        : 'text-emerald-600 dark:text-emerald-400'
                                    }`} />
                                  </div>
                                  {isPriority && (
                                    <Badge className="bg-amber-500 text-white border-0">
                                      <Star className="w-3 h-3 mr-1 fill-current" />
                                      Priority
                                    </Badge>
                                  )}
                                </div>
                                <CardTitle className={`text-base ${isCompleted && 'line-through text-slate-400'}`}>
                                  {tip.title}
                                </CardTitle>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-2">
                            <Badge className={`${impactColors[tip.impactLevel as keyof typeof impactColors]} border-0 text-xs`}>
                              {tip.impactLevel} impact
                            </Badge>
                            <Badge className={`${difficultyColors[tip.difficulty as keyof typeof difficultyColors]} border-0 text-xs`}>
                              {tip.difficulty}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              <Clock className="w-3 h-3 mr-1" />
                              {tip.timeframe}
                            </Badge>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="space-y-4">
                          <p className={`text-sm leading-relaxed ${
                            isCompleted 
                              ? 'text-slate-400 dark:text-slate-500' 
                              : 'text-slate-600 dark:text-slate-300'
                          }`}>
                            {tip.content}
                          </p>
                          
                          {/* Impact Metrics */}
                          <div className={`p-3 rounded-lg ${
                            isPriority 
                              ? 'bg-amber-100 dark:bg-amber-900/30' 
                              : 'bg-slate-100 dark:bg-slate-800'
                          }`}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                                Potential Impact
                              </span>
                              <TrendingDown className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                              {tip.estimatedSavings} <span className="text-sm font-normal">kg CO₂/year</span>
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              ≈ {(tip.estimatedSavings! / 411).toFixed(1)} trees planted annually
                            </p>
                          </div>

                          {isCompleted && (
                            <Alert className="bg-emerald-100 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-700">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                              <AlertDescription className="text-emerald-700 dark:text-emerald-300 text-sm">
                                <strong>Completed!</strong> You're saving {tip.estimatedSavings} kg CO₂/year
                              </AlertDescription>
                            </Alert>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="priority" className="mt-6">
                {priorityTips.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {priorityTips.map((tip: Tip) => {
                      const IconComponent = categoryIcons[tip.category as keyof typeof categoryIcons] || Leaf;
                      const isCompleted = completedTips.some(ct => ct.tipId === tip.id);
                      
                      return (
                        <Card 
                          key={tip.id}
                          className={`backdrop-blur-xl hover:shadow-xl transition-all duration-300 border-2 ${
                            isCompleted
                              ? 'bg-emerald-50/50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700'
                              : 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-300 dark:border-amber-700 hover:scale-[1.02]'
                          }`}
                        >
                          <CardHeader className="space-y-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3 flex-1">
                                <Checkbox
                                  checked={isCompleted}
                                  onCheckedChange={() => toggleTipCompletion(tip.id, tip.estimatedSavings || 0)}
                                  className="mt-1"
                                />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/50">
                                      <IconComponent className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                    </div>
                                    <Badge className="bg-amber-500 text-white border-0">
                                      <Flame className="w-3 h-3 mr-1 fill-current" />
                                      High Priority
                                    </Badge>
                                  </div>
                                  <CardTitle className={`text-base ${isCompleted && 'line-through text-slate-400'}`}>
                                    {tip.title}
                                  </CardTitle>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-2">
                              <Badge className={`${impactColors[tip.impactLevel as keyof typeof impactColors]} border-0 text-xs`}>
                                {tip.impactLevel} impact
                              </Badge>
                              <Badge className={`${difficultyColors[tip.difficulty as keyof typeof difficultyColors]} border-0 text-xs`}>
                                {tip.difficulty}
                              </Badge>
                            </div>
                          </CardHeader>
                          
                          <CardContent className="space-y-4">
                            <p className={`text-sm leading-relaxed ${
                              isCompleted 
                                ? 'text-slate-400 dark:text-slate-500' 
                                : 'text-slate-600 dark:text-slate-300'
                            }`}>
                              {tip.content}
                            </p>
                            
                            <div className="p-3 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium text-amber-900 dark:text-amber-300">
                                  Your Category Impact
                                </span>
                                <Target className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                              </div>
                              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                                {tip.estimatedSavings} <span className="text-sm font-normal">kg CO₂/year</span>
                              </p>
                            </div>

                            {isCompleted && (
                              <Alert className="bg-emerald-100 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-700">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                <AlertDescription className="text-emerald-700 dark:text-emerald-300 text-sm">
                                  <strong>Amazing!</strong> You're tackling your priority area
                                </AlertDescription>
                              </Alert>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <Card className="bg-white/70 dark:bg-slate-900/80">
                    <CardContent className="text-center py-12">
                      <Target className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Priority Actions Yet</h3>
                      <p className="text-slate-500 dark:text-slate-400">
                        Log your emissions to get personalized priority recommendations
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="completed" className="mt-6">
                {completedTips.length > 0 ? (
                  <>
                    <div className="mb-6 p-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-2xl font-bold mb-2">🎉 Great Progress!</h3>
                          <p className="text-emerald-50">You've completed {completedTips.length} actions and saved {achievedSavings.toFixed(0)} kg CO₂/year</p>
                        </div>
                        <Button
                          variant="secondary"
                          className="bg-white text-emerald-600 hover:bg-emerald-50"
                        >
                          <Share2 className="w-4 h-4 mr-2" />
                          Share Progress
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {completedTips.map((completedTip) => {
                        const tip = tips.find(t => t.id === completedTip.tipId);
                        if (!tip) return null;
                        
                        const IconComponent = categoryIcons[tip.category as keyof typeof categoryIcons] || Leaf;
                        const completedDate = new Date(completedTip.completedAt).toLocaleDateString();
                        
                        return (
                          <Card 
                            key={tip.id}
                            className="bg-emerald-50/80 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700"
                          >
                            <CardHeader>
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-3 flex-1">
                                  <Checkbox
                                    checked={true}
                                    onCheckedChange={() => toggleTipCompletion(tip.id, tip.estimatedSavings || 0)}
                                    className="mt-1"
                                  />
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/50">
                                        <IconComponent className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                      </div>
                                      <Badge className="bg-emerald-500 text-white border-0">
                                        <CheckCircle2 className="w-3 h-3 mr-1" />
                                        Done
                                      </Badge>
                                    </div>
                                    <CardTitle className="text-base line-through text-slate-500">
                                      {tip.title}
                                    </CardTitle>
                                  </div>
                                </div>
                              </div>
                            </CardHeader>
                            
                            <CardContent className="space-y-3">
                              <div className="p-3 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs font-medium text-emerald-900 dark:text-emerald-300">
                                    Your Saving
                                  </span>
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                  {completedTip.estimatedSavings} <span className="text-sm font-normal">kg CO₂/year</span>
                                </p>
                                <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">
                                  Completed on {completedDate}
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <Card className="bg-white/70 dark:bg-slate-900/80">
                    <CardContent className="text-center py-12">
                      <Award className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Completed Actions Yet</h3>
                      <p className="text-slate-500 dark:text-slate-400 mb-4">
                        Start checking off actions to track your progress
                      </p>
                      <Button onClick={() => setActiveTab("all")} className="bg-emerald-600 hover:bg-emerald-700">
                        <Target className="w-4 h-4 mr-2" />
                        Browse Actions
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Load More Button - Only for "All" tab */}
              {activeTab === "all" && hasMoreTips && (
                <div className="flex flex-col items-center gap-4 mt-8">
                  <p className="text-slate-600 dark:text-slate-400">
                    Showing {displayedTips.length} of {filteredTips.length} actions
                  </p>
                  <div className="flex gap-3">
                    <Button
                      onClick={loadMoreTips}
                      size="lg"
                      className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
                    >
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Load More Actions
                    </Button>
                    <Button
                      onClick={showAllTips}
                      variant="outline"
                      size="lg"
                    >
                      Show All {filteredTips.length}
                    </Button>
                  </div>
                </div>
              )}

              {/* All Loaded Message */}
              {activeTab === "all" && !hasMoreTips && filteredTips.length > 12 && (
                <div className="text-center mt-8">
                  <Badge variant="outline" className="text-base py-2 px-4">
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    All {filteredTips.length} actions loaded!
                  </Badge>
                </div>
              )}

              {/* Empty State for All Tab */}
              {activeTab === "all" && !loading && filteredTips.length === 0 && (
                <Card className="bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl border-white/30 dark:border-slate-700/30 mt-6">
                  <CardContent className="text-center py-12">
                    <Lightbulb className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-300 mb-2">
                      No actions found
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400">
                      Try adjusting your filters to see more options.
                    </p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </Tabs>
      </div>
    </div>
  );
}