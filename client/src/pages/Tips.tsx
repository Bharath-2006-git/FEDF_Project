import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/shared/PageHeader";
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
  ArrowUpDown,
  ExternalLink
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
    color: "amber",
    bgClass: "bg-amber-50 dark:bg-amber-900/20",
    iconClass: "text-amber-600 dark:text-amber-400",
    borderClass: "border-amber-200 dark:border-amber-800",
  },
  transport: {
    icon: Car,
    label: "Transport",
    color: "blue",
    bgClass: "bg-blue-50 dark:bg-blue-900/20",
    iconClass: "text-blue-600 dark:text-blue-400",
    borderClass: "border-blue-200 dark:border-blue-800",
  },
  food: {
    icon: Utensils,
    label: "Food",
    color: "green",
    bgClass: "bg-green-50 dark:bg-green-900/20",
    iconClass: "text-green-600 dark:text-green-400",
    borderClass: "border-green-200 dark:border-green-800",
  },
  waste: {
    icon: Trash2,
    label: "Waste",
    color: "red",
    bgClass: "bg-red-50 dark:bg-red-900/20",
    iconClass: "text-red-600 dark:text-red-400",
    borderClass: "border-red-200 dark:border-red-800",
  },
  water: {
    icon: Droplets,
    label: "Water",
    color: "cyan",
    bgClass: "bg-cyan-50 dark:bg-cyan-900/20",
    iconClass: "text-cyan-600 dark:text-cyan-400",
    borderClass: "border-cyan-200 dark:border-cyan-800",
  },
};

const difficultyConfig = {
  easy: { label: "Easy", class: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  medium: { label: "Medium", class: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
  hard: { label: "Hard", class: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
};

const TipCard: React.FC<{
  tip: Tip;
  isCompleted: boolean;
  onToggle: () => void;
}> = ({ tip, isCompleted, onToggle }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const config = categoryConfig[tip.category as keyof typeof categoryConfig];

  return (
    <Card className={`border-l-4 transition-all ${isCompleted 
      ? 'border-l-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10' 
      : config?.borderClass || 'border-l-slate-200'
    }`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Checkbox
            checked={isCompleted}
            onCheckedChange={onToggle}
            className="mt-1"
          />
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                {tip.title}
              </h4>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge variant="outline" className="text-xs">
                  {config?.label || tip.category}
                </Badge>
                {tip.difficulty && (
                  <Badge variant="secondary" className={`text-xs ${difficultyConfig[tip.difficulty as keyof typeof difficultyConfig]?.class || ''}`}>
                    {difficultyConfig[tip.difficulty as keyof typeof difficultyConfig]?.label || tip.difficulty}
                  </Badge>
                )}
              </div>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-400">
              {tip.content}
            </p>

            {tip.estimatedSavings && (
              <p className={`text-sm font-medium ${config?.iconClass || 'text-slate-600'}`}>
                Potential savings: ~{tip.estimatedSavings} kg CO₂/year
              </p>
            )}

            {(tip.explanation || tip.source) && (
              <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
                    <Info className="w-3 h-3 mr-1" />
                    Learn More
                    {isExpanded ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2 space-y-2">
                  {tip.explanation && (
                    <div className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                      <p className="font-medium mb-1">Why this matters:</p>
                      <p>{tip.explanation}</p>
                    </div>
                  )}
                  {tip.source && (
                    <a
                      href={tip.source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Source Reference
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const CategorySection: React.FC<{
  category: string;
  tips: Tip[];
  completedTips: CompletedTip[];
  onToggleTip: (tipId: number, estimatedSavings: number) => void;
  potentialSavings: number;
}> = ({ category, tips, completedTips, onToggleTip, potentialSavings }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const config = categoryConfig[category as keyof typeof categoryConfig];
  const Icon = config?.icon || Zap;

  const completedCount = tips.filter(tip => 
    completedTips.some(ct => ct.tipId === tip.id)
  ).length;

  return (
    <div className="space-y-3">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <div className={`flex items-center justify-between p-4 rounded-xl ${config?.bgClass || 'bg-slate-50'}`}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/70 dark:bg-slate-800/70">
              <Icon className={`w-5 h-5 ${config?.iconClass || 'text-slate-600'}`} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {config?.label || category}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {completedCount} of {tips.length} implemented • Potential: {potentialSavings} kg CO₂/year
              </p>
            </div>
          </div>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </CollapsibleTrigger>
        </div>
        
        <CollapsibleContent className="space-y-2 mt-2">
          {tips.map(tip => {
            const isCompleted = completedTips.some(ct => ct.tipId === tip.id);
            return (
              <TipCard
                key={tip.id}
                tip={tip}
                isCompleted={isCompleted}
                onToggle={() => onToggleTip(tip.id, tip.estimatedSavings || 0)}
              />
            );
          })}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default function Tips() {
  const { user } = useAuth();
  const [tips, setTips] = useState<Tip[]>([]);
  const [completedTips, setCompletedTips] = useState<CompletedTip[]>([]);
  const [userEmissions, setUserEmissions] = useState<CategoryBreakdown[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<string>("impact");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tipsData, completedData, emissionsData] = await Promise.all([
        tipsAPI.get(),
        tipsAPI.getCompleted().catch(() => []),
        emissionsAPI.summary().catch(() => ({ categories: {} }))
      ]);

      setTips(tipsData);
      setCompletedTips(completedData);

      const totalEmissions = Object.values(emissionsData.categories || {}).reduce(
        (sum: number, val) => sum + Number(val), 
        0
      );

      const breakdown: CategoryBreakdown[] = Object.entries(emissionsData.categories || {})
        .map(([category, emissions]) => ({
          category: category.toLowerCase(),
          emissions: Number(emissions),
          percentage: totalEmissions > 0 ? (Number(emissions) / totalEmissions) * 100 : 0
        }))
        .sort((a, b) => b.emissions - a.emissions);

      setUserEmissions(breakdown);
    } catch (error) {
      console.error("Failed to load tips data:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTipCompletion = async (tipId: number, estimatedSavings: number) => {
    const isCompleted = completedTips.some(ct => ct.tipId === tipId);

    try {
      if (isCompleted) {
        await tipsAPI.unmarkCompleted(tipId);
        setCompletedTips(prev => prev.filter(ct => ct.tipId !== tipId));
      } else {
        const completed = await tipsAPI.markCompleted(tipId, estimatedSavings);
        setCompletedTips(prev => [...prev, completed]);
      }
    } catch (error) {
      console.error("Failed to toggle tip completion:", error);
    }
  };

  const recommendedTips = useMemo(() => {
    if (userEmissions.length === 0) return [];

    const topCategories = userEmissions
      .filter(e => e.percentage > 15)
      .map(e => e.category);

    return tips
      .filter(tip => 
        topCategories.includes(tip.category.toLowerCase()) &&
        !completedTips.some(ct => ct.tipId === tip.id)
      )
      .sort((a, b) => (b.estimatedSavings || 0) - (a.estimatedSavings || 0))
      .slice(0, 6);
  }, [tips, completedTips, userEmissions]);

  const filteredAndSortedTips = useMemo(() => {
    let filtered = filterCategory === "all" 
      ? tips 
      : tips.filter(tip => tip.category.toLowerCase() === filterCategory);

    switch (sortBy) {
      case "impact":
        return filtered.sort((a, b) => (b.estimatedSavings || 0) - (a.estimatedSavings || 0));
      case "difficulty":
        const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
        return filtered.sort((a, b) => 
          (difficultyOrder[a.difficulty as keyof typeof difficultyOrder] || 2) - 
          (difficultyOrder[b.difficulty as keyof typeof difficultyOrder] || 2)
        );
      case "category":
        return filtered.sort((a, b) => a.category.localeCompare(b.category));
      default:
        return filtered;
    }
  }, [tips, sortBy, filterCategory]);

  const tipsByCategory = useMemo(() => {
    const grouped: Record<string, Tip[]> = {};
    filteredAndSortedTips.forEach(tip => {
      const cat = tip.category.toLowerCase();
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(tip);
    });
    return grouped;
  }, [filteredAndSortedTips]);

  const totalSavingsPotential = useMemo(() => {
    return completedTips.reduce((sum, ct) => sum + ct.estimatedSavings, 0);
  }, [completedTips]);

  const implementationProgress = useMemo(() => {
    if (tips.length === 0) return 0;
    return Math.round((completedTips.length / tips.length) * 100);
  }, [completedTips.length, tips.length]);

  const categorySavings = useMemo(() => {
    const savings: Record<string, number> = {};
    Object.keys(tipsByCategory).forEach(category => {
      savings[category] = tipsByCategory[category].reduce(
        (sum, tip) => sum + (tip.estimatedSavings || 0), 
        0
      );
    });
    return savings;
  }, [tipsByCategory]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <PageHeader
          title="Carbon Reduction Tips"
          description="Data-driven recommendations to reduce your carbon footprint"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-slate-600 dark:text-slate-400">Tips Implemented</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                {completedTips.length} of {tips.length}
              </div>
              <Progress value={implementationProgress} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-slate-600 dark:text-slate-400">Estimated Annual Reduction</div>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {totalSavingsPotential} kg CO₂
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">Based on completed tips</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-slate-600 dark:text-slate-400">Available Tips</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                {tips.length - completedTips.length}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">Ready to implement</p>
            </CardContent>
          </Card>
        </div>

        {recommendedTips.length > 0 && (
          <Card className="border-emerald-200 dark:border-emerald-800 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-900 dark:text-emerald-100">
                <Zap className="w-5 h-5" />
                Recommended for You
              </CardTitle>
              <p className="text-sm text-emerald-700 dark:text-emerald-300">
                Based on your emission patterns, these actions will have the most impact
              </p>
            </CardHeader>
            <CardContent className="space-y-2">
              {recommendedTips.map(tip => {
                const isCompleted = completedTips.some(ct => ct.tipId === tip.id);
                return (
                  <TipCard
                    key={tip.id}
                    tip={tip}
                    isCompleted={isCompleted}
                    onToggle={() => toggleTipCompletion(tip.id, tip.estimatedSavings || 0)}
                  />
                );
              })}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>All Tips</CardTitle>
              <div className="flex items-center gap-2">
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-40">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {Object.entries(categoryConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>{config.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <ArrowUpDown className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="impact">Highest Impact</SelectItem>
                    <SelectItem value="difficulty">Easiest First</SelectItem>
                    <SelectItem value="category">By Category</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(tipsByCategory).map(([category, categoryTips]) => (
              <CategorySection
                key={category}
                category={category}
                tips={categoryTips}
                completedTips={completedTips}
                onToggleTip={toggleTipCompletion}
                potentialSavings={categorySavings[category] || 0}
              />
            ))}

            {Object.keys(tipsByCategory).length === 0 && (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                <p>No tips available for the selected filters.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
