import React, { useState, useEffect } from "react";
import { useAuth, useRoleAccess } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Lightbulb, 
  Leaf, 
  Zap, 
  Car, 
  Factory, 
  Trash2,
  Filter,
  TrendingUp,
  Star,
  RefreshCw
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
      setTips(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredTips = tips.filter(tip => 
    categoryFilter === 'all' || tip.category === categoryFilter
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-emerald-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 dark:from-emerald-500/5 dark:to-emerald-600/5 rounded-3xl blur-3xl opacity-75 dark:opacity-100"></div>
          <div className="relative bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-white/30 dark:border-slate-700/30">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-3">
                  <Lightbulb className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                  Eco Tips
                </h1>
                <p className="text-lg font-medium text-slate-600 dark:text-slate-300">
                  {isIndividual() 
                    ? "Discover actionable tips to reduce your carbon footprint"
                    : "Implement sustainable practices in your organization"
                  }
                </p>
              </div>
              
              <div className="flex items-center gap-4">
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
              </div>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <Card className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-white/30 dark:border-slate-700/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filter Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="energy">Energy</SelectItem>
                    <SelectItem value="transport">Transport</SelectItem>
                    <SelectItem value="industrial">Industrial</SelectItem>
                    <SelectItem value="waste">Waste</SelectItem>
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

        {/* Tips Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTips.map((tip) => {
              const IconComponent = categoryIcons[tip.category as keyof typeof categoryIcons] || Leaf;
              
              return (
                <Card 
                  key={tip.id} 
                  className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-white/30 dark:border-slate-700/30 hover:shadow-lg transition-all duration-300 hover:scale-105"
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
        )}

        {/* Empty State */}
        {!loading && filteredTips.length === 0 && (
          <Card className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-white/30 dark:border-slate-700/30">
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