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
  low: "bg-chart-2/20 text-chart-2 dark:bg-chart-2/30 dark:text-chart-2",
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

  useEffect(() => {
    fetchTips();
  }, [user?.role, categoryFilter]);

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

  const filteredTips = tips.filter(tip => {
    const categoryMatch = categoryFilter === 'all' || tip.category === categoryFilter;
    const impactMatch = impactFilter === 'all' || tip.impactLevel === impactFilter;
    return categoryMatch && impactMatch;
  });

  const displayedTips = filteredTips.slice(0, visibleTips);
  const hasMoreTips = filteredTips.length > visibleTips;

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

        {/* Filter Section */}
        <Card className="bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl border-white/30 dark:border-slate-700/30">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
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
            <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/20 border-emerald-200 dark:border-emerald-800">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-400">{filteredTips.length}</p>
                  <p className="text-sm text-emerald-600 dark:text-emerald-300 mt-1">Total Tips</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-chart-1/10 to-chart-1/5 dark:from-chart-1/20 dark:to-chart-1/10 border-chart-1/30">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-chart-1">{filteredTips.filter(t => t.impactLevel === 'high').length}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">High Impact</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 border-primary/30">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">{filteredTips.filter(t => t.impactLevel === 'medium').length}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">Medium Impact</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-chart-2/10 to-chart-2/5 dark:from-chart-2/20 dark:to-chart-2/10 border-chart-2/30">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-chart-2">{filteredTips.filter(t => t.impactLevel === 'low').length}</p>
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
              {displayedTips.map((tip) => {
                const IconComponent = categoryIcons[tip.category as keyof typeof categoryIcons] || Leaf;
              
              return (
                <Card 
                  key={tip.id} 
                  className="bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl border-white/30 dark:border-slate-700/30 hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                  <CardHeader className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                          <IconComponent className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{tip.title}</CardTitle>
                        </div>
                      </div>
                      <Badge 
                        className={`${impactColors[tip.impactLevel as keyof typeof impactColors]} border-0`}
                      >
                        {tip.impactLevel} impact
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
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-primary fill-current" />
                        <span className="text-sm text-slate-500 dark:text-slate-400">Recommended</span>
                      </div>
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