import React, { useState, useEffect } from "react";
import { useAuth, useRoleAccess } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Lightbulb, 
  Zap, 
  Car, 
  Factory, 
  Trash2,
  CheckCircle2,
  Flame,
  Leaf,
  Sparkles,
  ChevronDown,
  ChevronUp
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

const categoryColors = {
  energy: {
    icon: "text-yellow-600 dark:text-yellow-400",
    bg: "bg-yellow-50 dark:bg-yellow-900/20",
    border: "border-yellow-200 dark:border-yellow-800",
    hover: "hover:border-yellow-300 dark:hover:border-yellow-700"
  },
  transport: {
    icon: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-900/20",
    border: "border-blue-200 dark:border-blue-800",
    hover: "hover:border-blue-300 dark:hover:border-blue-700"
  },
  travel: {
    icon: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-900/20",
    border: "border-blue-200 dark:border-blue-800",
    hover: "hover:border-blue-300 dark:hover:border-blue-700"
  },
  electricity: {
    icon: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-900/20",
    border: "border-amber-200 dark:border-amber-800",
    hover: "hover:border-amber-300 dark:hover:border-amber-700"
  },
  fuel: {
    icon: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-50 dark:bg-orange-900/20",
    border: "border-orange-200 dark:border-orange-800",
    hover: "hover:border-orange-300 dark:hover:border-orange-700"
  },
  waste: {
    icon: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-900/20",
    border: "border-red-200 dark:border-red-800",
    hover: "hover:border-red-300 dark:hover:border-red-700"
  },
  industrial: {
    icon: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-900/20",
    border: "border-purple-200 dark:border-purple-800",
    hover: "hover:border-purple-300 dark:hover:border-purple-700"
  },
  other: {
    icon: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    border: "border-emerald-200 dark:border-emerald-800",
    hover: "hover:border-emerald-300 dark:hover:border-emerald-700"
  },
  all: {
    icon: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    border: "border-emerald-200 dark:border-emerald-800",
    hover: "hover:border-emerald-300 dark:hover:border-emerald-700"
  }
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

interface CategorySectionProps {
  category: string;
  categoryTips: Tip[];
  categoryLabels: Record<string, string>;
  categoryIcons: Record<string, any>;
  categoryColors: Record<string, any>;
  completedTips: CompletedTip[];
  toggleTipCompletion: (tipId: number, estimatedSavings: number) => void;
}

function CategorySection({ 
  category, 
  categoryTips, 
  categoryLabels, 
  categoryIcons, 
  categoryColors,
  completedTips, 
  toggleTipCompletion 
}: CategorySectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const Icon = categoryIcons[category] || Leaf;
  const colors = categoryColors[category] || categoryColors.all;
  const displayTips = isExpanded ? categoryTips : categoryTips.slice(0, 3);

  return (
    <div className="space-y-3">
      <div className={`flex items-center gap-3 p-3 rounded-lg ${colors.bg}`}>
        <div className={`p-2 rounded-lg bg-white/50 dark:bg-slate-800/50`}>
          <Icon className={`w-5 h-5 ${colors.icon}`} />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {categoryLabels[category] || category}
        </h3>
        <span className="text-sm text-slate-500 dark:text-slate-400">
          ({categoryTips.length})
        </span>
      </div>
      
      <div className="space-y-2">
        {displayTips.map(tip => {
          const isCompleted = completedTips.some(ct => ct.tipId === tip.id);
          
          return (
            <Card 
              key={tip.id}
              className={`bg-white dark:bg-slate-800 border-l-4 transition-all ${
                isCompleted 
                  ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-900/10'
                  : `${colors.border} ${colors.hover} border-t border-r border-b border-slate-200 dark:border-slate-700`
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={isCompleted}
                    onCheckedChange={() => toggleTipCompletion(tip.id, tip.estimatedSavings || 0)}
                    className="mt-1"
                  />
                  <div className="flex-1 space-y-1">
                    <h4 className="font-medium text-slate-900 dark:text-slate-100">
                      {tip.title}
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {tip.content}
                    </p>
                    {tip.estimatedSavings && (
                      <p className={`text-xs ${colors.icon} font-medium`}>
                        Potential savings: ~{tip.estimatedSavings} kg CO₂/year
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {categoryTips.length > 3 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className={`w-full ${colors.icon} ${colors.bg} hover:opacity-80 transition-opacity`}
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-4 h-4 mr-1" />
              Show less
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4 mr-1" />
              Show {categoryTips.length - 3} more
            </>
          )}
        </Button>
      )}
    </div>
  );
}

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
    
    console.log('Priority tips for top categories:', topThreeCategories, 'Count:', sorted.length);
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

  // Group tips by category
  const tipsByCategory = React.useMemo(() => {
    const grouped: Record<string, Tip[]> = {};
    tips.forEach(tip => {
      const category = tip.category || 'other';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(tip);
    });
    return grouped;
  }, [tips]);

  // Get recommended tips based on user emissions
  const recommendedTips = React.useMemo(() => {
    if (topCategories.length === 0 || Object.keys(categoryEmissions).length === 0) {
      return smartSortedTips.slice(0, 6);
    }
    return smartSortedTips.slice(0, 6);
  }, [smartSortedTips, topCategories, categoryEmissions]);

  const categoryLabels: Record<string, string> = {
    energy: 'Energy',
    transport: 'Transport',
    travel: 'Travel',
    electricity: 'Electricity',
    fuel: 'Fuel',
    waste: 'Waste',
    industrial: 'Industrial',
    other: 'Other'
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Lightbulb className="w-12 h-12 text-emerald-500 mx-auto mb-4 animate-pulse" />
          <p className="text-slate-600 dark:text-slate-400">Loading tips...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Sustainability Tips
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Discover practical ways to reduce your carbon footprint
          </p>
        </div>

        {/* Recommended Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              Recommended for You
            </h2>
          </div>
          
          {loadingEmissions ? (
            <Card className="bg-white dark:bg-slate-800 border-emerald-200 dark:border-emerald-800">
              <CardContent className="py-8 text-center">
                <p className="text-slate-600 dark:text-slate-400">Analyzing your emissions...</p>
              </CardContent>
            </Card>
          ) : recommendedTips.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendedTips.map(tip => {
                const Icon = categoryIcons[tip.category as keyof typeof categoryIcons] || Leaf;
                const colors = categoryColors[tip.category as keyof typeof categoryColors] || categoryColors.all;
                const isCompleted = completedTips.some(ct => ct.tipId === tip.id);
                
                return (
                  <Card 
                    key={tip.id}
                    className={`bg-white dark:bg-slate-800 border-l-4 transition-all hover:shadow-md ${
                      isCompleted 
                        ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-900/10'
                        : `${colors.border} border-t border-r border-b border-slate-200 dark:border-slate-700 ${colors.hover}`
                    }`}
                  >
                    <CardContent className="p-5 space-y-3">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${colors.bg}`}>
                          <Icon className={`w-5 h-5 ${colors.icon}`} />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-medium text-slate-900 dark:text-slate-100 leading-snug">
                              {tip.title}
                            </h3>
                            <Checkbox
                              checked={isCompleted}
                              onCheckedChange={() => toggleTipCompletion(tip.id, tip.estimatedSavings)}
                              className="mt-0.5"
                            />
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                            {tip.content}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className={`${colors.bg} ${colors.icon} text-xs border-0`}>
                              {categoryLabels[tip.category] || tip.category}
                            </Badge>
                            {tip.estimatedSavings && (
                              <span className={`text-xs ${colors.icon} font-medium`}>
                                ~{tip.estimatedSavings} kg CO₂/year
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <CardContent className="py-8 text-center">
                <Lightbulb className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-slate-600 dark:text-slate-400">
                  Start logging your emissions to get personalized recommendations
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Tips by Category */}
        <div className="space-y-6">
          {Object.entries(tipsByCategory).map(([category, categoryTips]) => (
            <CategorySection 
              key={category}
              category={category}
              categoryTips={categoryTips}
              categoryLabels={categoryLabels}
              categoryIcons={categoryIcons}
              categoryColors={categoryColors}
              completedTips={completedTips}
              toggleTipCompletion={toggleTipCompletion}
            />
          ))}
        </div>

        {/* Completion Stats */}
        {completedTips.length > 0 && (
          <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-200 dark:border-emerald-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                    You've completed
                  </p>
                  <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                    {completedTips.length} {completedTips.length === 1 ? 'tip' : 'tips'}
                  </p>
                </div>
                <CheckCircle2 className="w-12 h-12 text-emerald-500" />
              </div>
              {completedTips.reduce((sum, ct) => sum + ct.estimatedSavings, 0) > 0 && (
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-3">
                  Potential impact: ~{completedTips.reduce((sum, ct) => sum + ct.estimatedSavings, 0).toFixed(0)} kg CO₂/year saved
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
