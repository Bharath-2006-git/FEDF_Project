import React, { useState, useEffect } from "react";
import { useAuth, useRoleAccess } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PageHeader } from "@/components/shared/PageHeader";
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
  TrendingUp
} from "lucide-react";

interface Tip {
  id: number;
  title: string;
  content: string;
  category: string;
  targetRole: string;
  impactLevel: string;
  isActive: string;
}

const categoryIcons = {
  energy: Zap,
  transport: Car,
  industrial: Factory,
  waste: Trash2,
  all: Leaf
};

const impactColors = {
  low: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  medium: "bg-primary/20 text-primary dark:bg-primary/30 dark:text-primary", 
  high: "bg-chart-1/20 text-chart-1 dark:bg-chart-1/30 dark:text-chart-1"
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
  const [showPersonalized, setShowPersonalized] = useState(true);

  useEffect(() => {
    fetchTips();
    fetchUserEmissions();
  }, [user?.role, categoryFilter]);

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
          // Calculate top emission categories
          const categoryTotals: Record<string, number> = {};
          emissions.forEach((emission: any) => {
            const cat = emission.category?.toLowerCase() || 'other';
            categoryTotals[cat] = (categoryTotals[cat] || 0) + (emission.co2Emissions || 0);
          });

          console.log('📈 Category totals:', categoryTotals);

          // Get top 3 categories
          const sorted = Object.entries(categoryTotals)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([cat]) => cat);
          
          console.log('🎯 Top categories:', sorted);
          setTopCategories(sorted);
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
      setLoading(true);
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
      setTips(data.tips || data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Get personalized tips based on user's top emission categories
  const personalizedTips = React.useMemo(() => {
    if (topCategories.length === 0) return [];
    
    const matched = tips.filter(tip => 
      topCategories.includes(tip.category.toLowerCase())
    ).slice(0, 6);
    
    console.log('💡 Personalized tips matched:', matched.length, 'from categories:', topCategories);
    return matched;
  }, [tips, topCategories]);

  const filteredTips = tips.filter(tip => {
    const categoryMatch = categoryFilter === 'all' || tip.category === categoryFilter;
    const impactMatch = impactFilter === 'all' || tip.impactLevel === impactFilter;
    return categoryMatch && impactMatch;
  });

  // Show personalized tips first if enabled, otherwise show filtered tips
  const tipsToShow = showPersonalized && personalizedTips.length > 0 && categoryFilter === 'all' 
    ? [...personalizedTips, ...filteredTips.filter(t => !personalizedTips.find(p => p.id === t.id))]
    : filteredTips;

  const displayedTips = tipsToShow.slice(0, visibleTips);
  const hasMoreTips = tipsToShow.length > visibleTips;

  const loadMoreTips = () => {
    setVisibleTips(prev => prev + 12);
  };

  const showAllTips = () => {
    setVisibleTips(filteredTips.length);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <PageHeader
          icon={<Lightbulb className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />}
          title="Eco Tips"
          description={isIndividual() 
            ? "Discover actionable tips to reduce your carbon footprint"
            : "Implement sustainable practices in your organization"
          }
          actions={
            <Button
              onClick={fetchTips}
              variant="outline"
              size="sm"
              disabled={loading}
              className="hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Loading...' : 'Refresh'}
            </Button>
          }
        />

        {/* Personalized Recommendations - Show when user has data */}
        {personalizedTips.length > 0 && topCategories.length > 0 && categoryFilter === 'all' && (
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                <Star className="w-5 h-5 fill-current" />
                Recommended For You
              </CardTitle>
              <p className="text-sm text-blue-600 dark:text-blue-300">
                Based on your highest emission areas: <span className="font-semibold">{topCategories.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(', ')}</span>
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                <Button
                  variant={showPersonalized ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowPersonalized(true)}
                  className={showPersonalized ? "bg-blue-600 hover:bg-blue-700" : ""}
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Personalized
                </Button>
                <Button
                  variant={!showPersonalized ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowPersonalized(false)}
                >
                  All Tips
                </Button>
              </div>
              <Alert className="bg-blue-100/50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700">
                <Lightbulb className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <AlertDescription className="text-blue-700 dark:text-blue-300">
                  ✨ We've analyzed your carbon footprint and selected <strong>{personalizedTips.length} tips</strong> specifically for your top emission categories
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}

        {/* Info Card - Show when no emission data yet */}
        {userEmissions.length === 0 && !loading && categoryFilter === 'all' && (
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                <TrendingUp className="w-5 h-5" />
                Get Personalized Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className="bg-blue-100/50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700">
                <Lightbulb className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <AlertDescription className="text-blue-700 dark:text-blue-300">
                  <p className="font-semibold mb-2">Start logging your emissions to unlock personalized recommendations!</p>
                  <p className="text-sm">Once you log emissions data, we'll analyze your carbon footprint and recommend tips specifically for your highest emission areas (electricity, transport, waste, etc.)</p>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}

        {/* Filter Section */}
        <Card className="bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl border-white/30 dark:border-slate-700/30">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                Filter Tips
              </div>
              <Badge variant="outline" className="text-base">
                {filteredTips.length} {filteredTips.length === 1 ? 'tip' : 'tips'} available
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <Select value={categoryFilter} onValueChange={(value) => {
                  setCategoryFilter(value);
                  setVisibleTips(12);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="energy">⚡ Energy</SelectItem>
                    <SelectItem value="transport">🚗 Transport</SelectItem>
                    <SelectItem value="industrial">🏭 Industrial</SelectItem>
                    <SelectItem value="waste">♻️ Waste</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Impact Level</label>
                <Select value={impactFilter} onValueChange={(value) => {
                  setImpactFilter(value);
                  setVisibleTips(12);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select impact" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Impact Levels</SelectItem>
                    <SelectItem value="high">🔴 High Impact</SelectItem>
                    <SelectItem value="medium">🟡 Medium Impact</SelectItem>
                    <SelectItem value="low">🟢 Low Impact</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Section */}
        {!loading && filteredTips.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-cyan-100/50 dark:from-blue-900/20 dark:to-cyan-800/20 border-blue-200 dark:border-blue-800">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-700 dark:text-blue-400">{filteredTips.length}</p>
                  <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">Total Tips</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-red-50/80 to-orange-100/50 dark:from-red-900/20 dark:to-orange-800/20 border-red-200 dark:border-red-800">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-red-600 dark:text-red-400">{filteredTips.filter(t => t.impactLevel === 'high').length}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">High Impact</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-amber-50 to-yellow-100/50 dark:from-amber-900/20 dark:to-yellow-800/20 border-amber-200 dark:border-amber-800">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{filteredTips.filter(t => t.impactLevel === 'medium').length}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">Medium Impact</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-emerald-50 to-green-100/50 dark:from-emerald-900/20 dark:to-green-800/20 border-emerald-200 dark:border-emerald-800">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{filteredTips.filter(t => t.impactLevel === 'low').length}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">Low Impact</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tips Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedTips.map((tip, index) => {
                const IconComponent = categoryIcons[tip.category as keyof typeof categoryIcons] || Leaf;
                const isPersonalized = personalizedTips.find(p => p.id === tip.id) && showPersonalized;
                const cardBorderClass = isPersonalized 
                  ? "border-blue-300 dark:border-blue-700 bg-gradient-to-br from-blue-50/50 to-white dark:from-blue-900/10 dark:to-slate-900/80" 
                  : "bg-white/70 dark:bg-slate-900/80 border-white/30 dark:border-slate-700/30";
              
              return (
                <Card 
                  key={tip.id} 
                  className={`${cardBorderClass} backdrop-blur-xl hover:shadow-lg transition-all duration-300 hover:scale-105`}
                >
                  <CardHeader className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isPersonalized ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-emerald-100 dark:bg-emerald-900/30'}`}>
                          <IconComponent className={`w-5 h-5 ${isPersonalized ? 'text-blue-600 dark:text-blue-400' : 'text-emerald-600 dark:text-emerald-400'}`} />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg">{tip.title}</CardTitle>
                          {isPersonalized && (
                            <Badge className="mt-1 bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 border-0 text-xs">
                              <Star className="w-3 h-3 mr-1" />
                              For You
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Badge 
                        className={`${impactColors[tip.impactLevel as keyof typeof impactColors]} border-0`}
                      >
                        {tip.impactLevel}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      {tip.content}
                    </p>
                    <div className="flex items-center justify-between mt-4">
                      <Badge variant="outline" className="capitalize">
                        {tip.category}
                      </Badge>
                      {isPersonalized && (
                        <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                          <TrendingUp className="w-4 h-4" />
                          <span className="text-xs font-medium">High Priority</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Load More Button */}
          {hasMoreTips && (
            <div className="flex flex-col items-center gap-4 mt-8">
              <p className="text-slate-600 dark:text-slate-400">
                Showing {displayedTips.length} of {filteredTips.length} tips
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={loadMoreTips}
                  size="lg"
                  className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Load More Tips
                </Button>
                <Button
                  onClick={showAllTips}
                  variant="outline"
                  size="lg"
                >
                  Show All {filteredTips.length} Tips
                </Button>
              </div>
            </div>
          )}

          {/* All Loaded Message */}
          {!hasMoreTips && filteredTips.length > 12 && (
            <div className="text-center mt-8">
              <Badge variant="outline" className="text-base py-2 px-4">
                ✨ All {filteredTips.length} tips loaded!
              </Badge>
            </div>
          )}
        </>
        )}

        {/* Empty State */}
        {!loading && filteredTips.length === 0 && (
          <Card className="bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl border-white/30 dark:border-slate-700/30">
            <CardContent className="text-center py-12">
              <Lightbulb className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-300 mb-2">
                No tips found
              </h3>
              <p className="text-slate-500 dark:text-slate-400">
                Try changing your filter criteria or check back later for new tips.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}