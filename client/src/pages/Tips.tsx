import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { 
  Zap, 
  Car, 
  Trash2,
  Droplets,
  Utensils,
  ChevronDown,
  ChevronUp,
  Info,
  Filter,
  Search,
  ExternalLink,
  Target,
  TrendingUp,
  Award,
  Sparkles,
  Check,
  X,
  Lightbulb,
  Leaf
} from "lucide-react";
import { tipsAPI, emissionsAPI, CompletedTip as ApiCompletedTip, Tip as ApiTip } from "@/services/api";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface Tip extends ApiTip {
  estimatedSavings?: number;
  difficulty?: string;
  explanation?: string;
  source?: string;
}

interface CompletedTip extends ApiCompletedTip {}

interface CategoryBreakdown {
  category: string;
  emissions: number;
  percentage: number;
}

const categoryConfig = {
  energy: {
    icon: Zap,
    label: "Energy",
    color: "blue",
    gradient: "from-blue-500 to-cyan-600",
    bgClass: "bg-blue-50 dark:bg-blue-950/30",
    iconBg: "bg-blue-500/10 dark:bg-blue-400/20",
    iconClass: "text-blue-600 dark:text-blue-400",
    borderClass: "border-blue-200 dark:border-blue-800",
    dotClass: "bg-blue-500",
  },
  transport: {
    icon: Car,
    label: "Transport",
    color: "cyan",
    gradient: "from-cyan-500 to-teal-600",
    bgClass: "bg-cyan-50 dark:bg-cyan-950/30",
    iconBg: "bg-cyan-500/10 dark:bg-cyan-400/20",
    iconClass: "text-cyan-600 dark:text-cyan-400",
    borderClass: "border-cyan-200 dark:border-cyan-800",
    dotClass: "bg-cyan-500",
  },
  food: {
    icon: Utensils,
    label: "Food",
    color: "green",
    gradient: "from-green-500 to-emerald-600",
    bgClass: "bg-green-50 dark:bg-green-950/30",
    iconBg: "bg-green-500/10 dark:bg-green-400/20",
    iconClass: "text-green-600 dark:text-green-400",
    borderClass: "border-green-200 dark:border-green-800",
    dotClass: "bg-green-500",
  },
  waste: {
    icon: Trash2,
    label: "Waste",
    color: "orange",
    gradient: "from-orange-500 to-red-600",
    bgClass: "bg-orange-50 dark:bg-orange-950/30",
    iconBg: "bg-orange-500/10 dark:bg-orange-400/20",
    iconClass: "text-orange-600 dark:text-orange-400",
    borderClass: "border-orange-200 dark:border-orange-800",
    dotClass: "bg-orange-500",
  },
  water: {
    icon: Droplets,
    label: "Water",
    color: "teal",
    gradient: "from-teal-500 to-blue-600",
    bgClass: "bg-teal-50 dark:bg-teal-950/30",
    iconBg: "bg-teal-500/10 dark:bg-teal-400/20",
    iconClass: "text-teal-600 dark:text-teal-400",
    borderClass: "border-teal-200 dark:border-teal-800",
    dotClass: "bg-teal-500",
  },
};

const difficultyConfig = {
  easy: { 
    label: "Easy", 
    class: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    icon: "🌱"
  },
  medium: { 
    label: "Medium", 
    class: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    icon: "⚡"
  },
  hard: { 
    label: "Hard", 
    class: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    icon: "🎯"
  },
};

export default function Tips() {
  const { user } = useAuth();
  const [tips, setTips] = useState<Tip[]>([]);
  const [completedTips, setCompletedTips] = useState<CompletedTip[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedTips, setExpandedTips] = useState<Set<number>>(new Set());
  const [emissionBreakdown, setEmissionBreakdown] = useState<CategoryBreakdown[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [allTips, completed, personalizedTips] = await Promise.all([
        tipsAPI.get(),
        tipsAPI.getCompleted(),
        tipsAPI.getPersonalized().catch(() => [])
      ]);

      const tipsToUse = personalizedTips.length > 0 ? personalizedTips : allTips;
      setTips(tipsToUse);
      setCompletedTips(completed);

      // Get emission breakdown for personalization
      try {
        const summary = await emissionsAPI.summary();
        const breakdown: CategoryBreakdown[] = Object.entries(summary.byCategory || {})
          .map(([category, emissions]) => ({
            category,
            emissions: emissions as number,
            percentage: 0
          }));
        
        const total = breakdown.reduce((sum, item) => sum + item.emissions, 0);
        breakdown.forEach(item => {
          item.percentage = total > 0 ? (item.emissions / total) * 100 : 0;
        });
        
        setEmissionBreakdown(breakdown);
      } catch (err) {
        console.error("Failed to load emission breakdown:", err);
      }
    } catch (err) {
      console.error("Failed to load tips:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async (tipId: number) => {
    try {
      const isCompleted = completedTips.some(ct => ct.tipId === tipId);
      
      if (isCompleted) {
        await tipsAPI.unmarkCompleted(tipId);
        setCompletedTips(prev => prev.filter(ct => ct.tipId !== tipId));
      } else {
        const tip = tips.find(t => t.id === tipId);
        await tipsAPI.markCompleted(tipId, tip?.estimatedSavings || 0);
        await loadData();
      }
    } catch (err) {
      console.error("Failed to toggle tip completion:", err);
    }
  };

  const toggleExpanded = (tipId: number) => {
    setExpandedTips(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tipId)) {
        newSet.delete(tipId);
      } else {
        newSet.add(tipId);
      }
      return newSet;
    });
  };

  const filteredAndSortedTips = useMemo(() => {
    let filtered = tips;

    // Filter by category
    if (categoryFilter !== "all") {
      filtered = filtered.filter(tip => tip.category === categoryFilter);
    }

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(tip =>
        tip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tip.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [tips, categoryFilter, searchQuery]);

  const tipsByCategory = useMemo(() => {
    const grouped: Record<string, Tip[]> = {};
    filteredAndSortedTips.forEach(tip => {
      if (!grouped[tip.category]) {
        grouped[tip.category] = [];
      }
      grouped[tip.category].push(tip);
    });
    return grouped;
  }, [filteredAndSortedTips]);

  const completionStats = useMemo(() => {
    const total = tips.length;
    const completed = completedTips.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    const totalSavings = completedTips.reduce((sum, ct) => sum + (ct.estimatedSavings || 0), 0);
    
    return { total, completed, percentage, totalSavings };
  }, [tips, completedTips]);

  const topCategory = useMemo(() => {
    if (emissionBreakdown.length === 0) return null;
    return emissionBreakdown.reduce((max, item) => 
      item.emissions > max.emissions ? item : max
    );
  }, [emissionBreakdown]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="p-6 max-w-7xl mx-auto space-y-8">
        
        {/* Enhanced Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 dark:from-blue-600 dark:to-cyan-700 rounded-2xl shadow-lg mb-4">
            <Lightbulb className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent mb-3">
            Sustainability Tips
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            Personalized recommendations to reduce your carbon footprint and make a positive environmental impact
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white/80 dark:bg-slate-800/90 backdrop-blur-xl border-white/40 dark:border-slate-600/40 shadow-lg hover:shadow-xl transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Completed Tips</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{completionStats.completed}</p>
                  <p className="text-xs text-green-600 dark:text-green-400 font-medium">of {completionStats.total} total</p>
                </div>
                <div className="p-3 bg-green-500/10 dark:bg-green-400/20 rounded-xl group-hover:bg-green-500/20 dark:group-hover:bg-green-400/30 transition-colors">
                  <Check className="h-7 w-7 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-slate-800/90 backdrop-blur-xl border-white/40 dark:border-slate-600/40 shadow-lg hover:shadow-xl transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Progress</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{completionStats.percentage}%</p>
                  <Progress value={completionStats.percentage} className="mt-2 h-2" />
                </div>
                <div className="p-3 bg-blue-500/10 dark:bg-blue-400/20 rounded-xl group-hover:bg-blue-500/20 dark:group-hover:bg-blue-400/30 transition-colors">
                  <Target className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-slate-800/90 backdrop-blur-xl border-white/40 dark:border-slate-600/40 shadow-lg hover:shadow-xl transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">CO₂ Saved</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{Math.round(completionStats.totalSavings)}</p>
                  <p className="text-xs text-teal-600 dark:text-teal-400 font-medium">kg this month</p>
                </div>
                <div className="p-3 bg-teal-500/10 dark:bg-teal-400/20 rounded-xl group-hover:bg-teal-500/20 dark:group-hover:bg-teal-400/30 transition-colors">
                  <TrendingUp className="h-7 w-7 text-teal-600 dark:text-teal-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-slate-800/90 backdrop-blur-xl border-white/40 dark:border-slate-600/40 shadow-lg hover:shadow-xl transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Focus Area</p>
                  {topCategory && (
                    <>
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 capitalize">{topCategory.category}</p>
                      <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">{Math.round(topCategory.percentage)}% of emissions</p>
                    </>
                  )}
                </div>
                <div className="p-3 bg-purple-500/10 dark:bg-purple-400/20 rounded-xl group-hover:bg-purple-500/20 dark:group-hover:bg-purple-400/30 transition-colors">
                  <Award className="h-7 w-7 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="bg-white/80 dark:bg-slate-800/90 backdrop-blur-xl border-white/40 dark:border-slate-600/40 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search tips..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                />
              </div>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-48 h-11 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="energy">⚡ Energy</SelectItem>
                  <SelectItem value="transport">🚗 Transport</SelectItem>
                  <SelectItem value="food">🍽️ Food</SelectItem>
                  <SelectItem value="waste">🗑️ Waste</SelectItem>
                  <SelectItem value="water">💧 Water</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tips by Category */}
        {Object.entries(tipsByCategory).map(([category, categoryTips]) => {
          const config = categoryConfig[category as keyof typeof categoryConfig];
          if (!config) return null;

          const CategoryIcon = config.icon;

          return (
            <Card key={category} className={`bg-white/80 dark:bg-slate-800/90 backdrop-blur-xl border-white/40 dark:border-slate-600/40 shadow-lg`}>
              <CardHeader className={`${config.bgClass} border-b ${config.borderClass}`}>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className={`p-2 ${config.iconBg} rounded-lg`}>
                    <CategoryIcon className={`w-5 h-5 ${config.iconClass}`} />
                  </div>
                  <span className="text-slate-900 dark:text-slate-100">{config.label}</span>
                  <Badge variant="secondary" className="ml-auto">
                    {categoryTips.length} tips
                  </Badge>
                </CardTitle>
              </CardHeader>

              <CardContent className="p-6 space-y-4">
                {categoryTips.map((tip) => {
                  const isCompleted = completedTips.some(ct => ct.tipId === tip.id);
                  const isExpanded = expandedTips.has(tip.id);
                  const difficulty = difficultyConfig[tip.difficulty as keyof typeof difficultyConfig];

                  return (
                    <Card key={tip.id} className={`border ${config.borderClass} ${isCompleted ? 'opacity-60' : ''} transition-all duration-300 hover:shadow-md`}>
                      <CardContent className="p-5">
                        <div className="flex items-start gap-4">
                          <Checkbox
                            checked={isCompleted}
                            onCheckedChange={() => handleToggleComplete(tip.id)}
                            className="mt-1"
                          />
                          
                          <div className="flex-1 space-y-3">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <h3 className={`font-semibold text-slate-900 dark:text-slate-100 ${isCompleted ? 'line-through' : ''}`}>
                                  {tip.title}
                                </h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                  {tip.content}
                                </p>
                              </div>
                              
                              <div className="flex flex-col items-end gap-2">
                                {tip.estimatedSavings && tip.estimatedSavings > 0 && (
                                  <Badge className={`bg-gradient-to-r ${config.gradient} text-white`}>
                                    -{tip.estimatedSavings} kg CO₂
                                  </Badge>
                                )}
                                {difficulty && (
                                  <Badge className={difficulty.class}>
                                    {difficulty.icon} {difficulty.label}
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {(tip.explanation || tip.source) && (
                              <Collapsible open={isExpanded} onOpenChange={() => toggleExpanded(tip.id)}>
                                <CollapsibleTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 text-xs">
                                    <Info className="h-3 w-3 mr-1" />
                                    Learn More
                                    {isExpanded ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
                                  </Button>
                                </CollapsibleTrigger>
                                <CollapsibleContent className="mt-3">
                                  <div className={`p-4 rounded-lg ${config.bgClass} space-y-2`}>
                                    {tip.explanation && (
                                      <p className="text-sm text-slate-700 dark:text-slate-300">
                                        {tip.explanation}
                                      </p>
                                    )}
                                    {tip.source && (
                                      <a 
                                        href={tip.source} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className={`text-xs ${config.iconClass} hover:underline flex items-center gap-1`}
                                      >
                                        Source <ExternalLink className="h-3 w-3" />
                                      </a>
                                    )}
                                  </div>
                                </CollapsibleContent>
                              </Collapsible>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}

        {filteredAndSortedTips.length === 0 && (
          <Card className="bg-white/80 dark:bg-slate-800/90 backdrop-blur-xl border-white/40 dark:border-slate-600/40 shadow-lg">
            <CardContent className="p-12 text-center">
              <Sparkles className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                No tips found
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Try adjusting your filters or search query
              </p>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}
