import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/PageHeader";
import { toast } from "@/hooks/use-toast";
import { goalsAPI } from "@/services/api";
import { apiService } from "@/services/api";
import { 
  Target, 
  Plus, 
  TrendingDown, 
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Edit,
  Trash2,
  RefreshCw,
  Trophy,
  Zap,
  Award,
  TrendingUp,
  Flame,
  CheckCircle2,
  XCircle,
  Sparkles,
  BarChart3,
  ArrowRight,
  Star,
  Activity
} from "lucide-react";
interface Goal {
  id: number;
  goalName: string;
  goalType: string;
  targetValue: string;
  currentValue: string | null;
  targetDate: string;
  status: string | null;
  category: string | null;
  createdAt: string;
  completedAt: string | null;
}
interface GoalFormData {
  goalName: string;
  goalType: string;
  targetValue: string;
  targetDate: string;
  category: string;
}

interface GoalStats {
  totalGoals: number;
  activeGoals: number;
  completedGoals: number;
  expiredGoals: number;
  averageProgress: number;
  totalReduction: number;
}
export default function Goals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<number | null>(null);
  const [deleteGoalId, setDeleteGoalId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<string>("active");
  const [userEmissions, setUserEmissions] = useState<any[]>([]);
  const [currentEmissions, setCurrentEmissions] = useState<number>(0);
  const [formData, setFormData] = useState<GoalFormData>({
    goalName: "",
    goalType: "reduction_percentage",
    targetValue: "",
    targetDate: "",
    category: "all"
  });
  useEffect(() => {
    if (user) {
      loadAllData();
    }
  }, [user]);

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchGoals(),
      fetchUserEmissions()
    ]);
    setLoading(false);
  };

  const fetchUserEmissions = async () => {
    try {
      const response: any = await apiService.getEmissionHistory();
      const emissions = response.emissions || response || [];
      setUserEmissions(emissions);
      
      // Calculate current total emissions
      const total = emissions.reduce((sum: number, e: any) => sum + (e.co2Emissions || 0), 0);
      setCurrentEmissions(total);
    } catch (err) {
      console.error('Failed to fetch emissions:', err);
    }
  };
  const fetchGoals = async () => {
    try {
      const data = await goalsAPI.list();
      
      // Convert API response to match local interface and calculate current progress
      const mappedGoals = data.map((goal: any) => {
        const mappedGoal = {
          id: goal.id,
          goalName: goal.goalName || goal.goal_name,
          goalType: goal.goalType || goal.goal_type,
          targetValue: String(goal.targetValue || goal.target_value || 0),
          currentValue: String(goal.currentValue || goal.current_value || 0),
          targetDate: goal.targetDate || goal.target_date,
          status: goal.status,
          category: goal.category,
          createdAt: goal.createdAt || goal.created_at || new Date().toISOString(),
          completedAt: goal.completedAt || goal.completed_at || null
        };

        // Auto-calculate current progress from emissions
        const updatedGoal = calculateGoalProgress(mappedGoal);
        return updatedGoal;
      });
      
      setGoals(mappedGoals);
      setError("");
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Calculate goal progress based on actual emission data
  const calculateGoalProgress = (goal: Goal): Goal => {
    if (!userEmissions.length) return goal;

    const goalCreatedDate = new Date(goal.createdAt);
    const targetDate = new Date(goal.targetDate);
    const now = new Date();

    // Filter emissions for this goal's category and timeframe
    let relevantEmissions = userEmissions.filter((e: any) => {
      const emissionDate = new Date(e.date);
      return emissionDate >= goalCreatedDate && emissionDate <= targetDate;
    });

    // Filter by category if not "all"
    if (goal.category && goal.category !== 'all') {
      relevantEmissions = relevantEmissions.filter((e: any) => 
        e.category.toLowerCase() === goal.category?.toLowerCase()
      );
    }

    const currentTotal = relevantEmissions.reduce((sum: number, e: any) => 
      sum + (e.co2Emissions || 0), 0
    );

    // Calculate initial baseline (emissions before goal was created)
    const baselineEmissions = userEmissions.filter((e: any) => {
      const emissionDate = new Date(e.date);
      const thirtyDaysBeforeGoal = new Date(goalCreatedDate);
      thirtyDaysBeforeGoal.setDate(thirtyDaysBeforeGoal.getDate() - 30);
      return emissionDate >= thirtyDaysBeforeGoal && emissionDate < goalCreatedDate;
    });

    let baselineCategory = baselineEmissions;
    if (goal.category && goal.category !== 'all') {
      baselineCategory = baselineEmissions.filter((e: any) => 
        e.category.toLowerCase() === goal.category?.toLowerCase()
      );
    }

    const baselineTotal = baselineCategory.reduce((sum: number, e: any) => 
      sum + (e.co2Emissions || 0), 0
    );

    let currentValue = "0";
    let status = goal.status;

    if (goal.goalType === 'reduction_percentage') {
      // Calculate percentage reduction from baseline
      if (baselineTotal > 0) {
        const reduction = ((baselineTotal - currentTotal) / baselineTotal) * 100;
        currentValue = Math.max(0, reduction).toFixed(1);
      }
    } else {
      // Absolute target - current emissions should be below target
      currentValue = currentTotal.toFixed(1);
    }

    // Update status
    if (now > targetDate) {
      const target = parseFloat(goal.targetValue);
      const current = parseFloat(currentValue);
      
      if (goal.goalType === 'reduction_percentage') {
        status = current >= target ? 'completed' : 'expired';
      } else {
        status = current <= target ? 'completed' : 'expired';
      }
    } else {
      status = 'active';
    }

    return {
      ...goal,
      currentValue,
      status
    };
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const goalData = {
        ...formData,
        targetValue: parseFloat(formData.targetValue)
      };

      if (isEditMode && editingGoalId) {
        await goalsAPI.update(editingGoalId, goalData);
        toast({
          title: "Goal Updated",
          description: "Your emission reduction goal has been updated successfully.",
        });
      } else {
        await goalsAPI.create(goalData);
        toast({
          title: "Goal Created",
          description: "Your emission reduction goal has been set successfully.",
        });
      }
      
      setIsDialogOpen(false);
      setIsEditMode(false);
      setEditingGoalId(null);
      setFormData({
        goalName: "",
        goalType: "reduction_percentage", 
        targetValue: "",
        targetDate: "",
        category: "all"
      });
      fetchGoals();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive"
      });
    }
  };

  const handleEdit = (goal: Goal) => {
    setIsEditMode(true);
    setEditingGoalId(goal.id);
    setFormData({
      goalName: goal.goalName,
      goalType: goal.goalType,
      targetValue: goal.targetValue,
      targetDate: new Date(goal.targetDate).toISOString().split('T')[0],
      category: goal.category || "all"
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteGoalId) return;
    
    try {
      await goalsAPI.delete(deleteGoalId);
      toast({
        title: "Goal Deleted",
        description: "Your goal has been deleted successfully.",
      });
      setDeleteGoalId(null);
      fetchGoals();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive"
      });
    }
  };

  const handleRefreshProgress = async (goalId?: number) => {
    try {
      await fetchUserEmissions();
      await fetchGoals();
      toast({
        title: "Progress Updated",
        description: goalId ? "Goal progress has been recalculated." : "All goals have been updated with latest emission data.",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive"
      });
    }
  };

  const openNewGoalDialog = () => {
    setIsEditMode(false);
    setEditingGoalId(null);
    setFormData({
      goalName: "",
      goalType: "reduction_percentage",
      targetValue: "",
      targetDate: "",
      category: "all"
    });
    setIsDialogOpen(true);
  };
  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-primary" />;
      case 'expired':
        return <AlertCircle className="w-5 h-5 text-destructive" />;
      default:
        return <Clock className="w-5 h-5 text-chart-2" />;
    }
  };
  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'expired':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    }
  };

  // Filter goals by tab
  const filteredGoals = React.useMemo(() => {
    switch (activeTab) {
      case 'active':
        return goals.filter(g => g.status === 'active' || !g.status);
      case 'completed':
        return goals.filter(g => g.status === 'completed');
      case 'expired':
        return goals.filter(g => g.status === 'expired');
      default:
        return goals;
    }
  }, [goals, activeTab]);
  const calculateProgress = (goal: Goal) => {
    if (!goal.currentValue || !goal.targetValue) return 0;
    const current = parseFloat(goal.currentValue);
    const target = parseFloat(goal.targetValue);
    return Math.min((current / target) * 100, 100);
  };

  // Calculate overall statistics
  const stats: GoalStats = React.useMemo(() => {
    const totalGoals = goals.length;
    const activeGoals = goals.filter(g => g.status === 'active' || !g.status).length;
    const completedGoals = goals.filter(g => g.status === 'completed').length;
    const expiredGoals = goals.filter(g => g.status === 'expired').length;
    
    const totalProgress = goals.reduce((sum, goal) => sum + calculateProgress(goal), 0);
    const averageProgress = totalGoals > 0 ? totalProgress / totalGoals : 0;
    
    // Calculate total CO2 reduction achieved
    const totalReduction = goals
      .filter(g => g.goalType === 'reduction_percentage')
      .reduce((sum, goal) => {
        const current = parseFloat(goal.currentValue || '0');
        return sum + current;
      }, 0);

    return {
      totalGoals,
      activeGoals,
      completedGoals,
      expiredGoals,
      averageProgress,
      totalReduction
    };
  }, [goals]);
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <PageHeader
          icon={<Target className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />}
          title="Emission Goals Tracker"
          description="Set targets, track progress, and achieve your carbon reduction ambitions"
          actions={
            <div className="flex gap-3">
              <Button
                onClick={() => handleRefreshProgress()}
                variant="outline"
                size="sm"
                disabled={loading}
                className="hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Update All
              </Button>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={openNewGoalDialog} className="bg-emerald-600 hover:bg-emerald-700">
                    <Plus className="w-4 h-4 mr-2" />
                    New Goal
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[550px]">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      {isEditMode ? (
                        <>
                          <Edit className="w-5 h-5 text-emerald-600" />
                          Edit Goal
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 text-emerald-600" />
                          Create New Goal
                        </>
                      )}
                    </DialogTitle>
                    <DialogDescription>
                      {isEditMode 
                        ? "Update your emission reduction goal details" 
                        : "Set a new target to reduce your carbon footprint"
                      }
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="goalName">Goal Name</Label>
                      <Input
                        id="goalName"
                        value={formData.goalName}
                        onChange={(e) => setFormData({...formData, goalName: e.target.value})}
                        placeholder="e.g., Reduce home energy consumption"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="goalType">Goal Type</Label>
                      <Select value={formData.goalType} onValueChange={(value) => setFormData({...formData, goalType: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="reduction_percentage">Percentage Reduction</SelectItem>
                          <SelectItem value="absolute_target">Absolute Target</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="targetValue">
                        Target Value {formData.goalType === 'reduction_percentage' ? '(%)' : '(kg CO2)'}
                      </Label>
                      <Input
                        id="targetValue"
                        type="number"
                        value={formData.targetValue}
                        onChange={(e) => setFormData({...formData, targetValue: e.target.value})}
                        placeholder={formData.goalType === 'reduction_percentage' ? "25" : "1000"}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          <SelectItem value="electricity">Electricity</SelectItem>
                          <SelectItem value="travel">Travel</SelectItem>
                          <SelectItem value="fuel">Fuel</SelectItem>
                          <SelectItem value="waste">Waste</SelectItem>
                          <SelectItem value="production">Production</SelectItem>
                          <SelectItem value="logistics">Logistics</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="targetDate">Target Date</Label>
                      <Input
                        id="targetDate"
                        type="date"
                        value={formData.targetDate}
                        onChange={(e) => setFormData({...formData, targetDate: e.target.value})}
                        required
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                        {isEditMode ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Update Goal
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-2" />
                            Create Goal
                          </>
                        )}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          }
        />

        {/* Hero Statistics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Goals */}
          <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-0 shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="w-5 h-5" />
                Total Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-5xl font-bold mb-2">{stats.totalGoals}</p>
              <p className="text-blue-100 text-sm">Goals tracking progress</p>
            </CardContent>
          </Card>

          {/* Active Goals */}
          <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0 shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="w-5 h-5" />
                Active Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-5xl font-bold mb-2">{stats.activeGoals}</p>
              <p className="text-emerald-100 text-sm">Currently in progress</p>
            </CardContent>
          </Card>

          {/* Completed Goals */}
          <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white border-0 shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Trophy className="w-5 h-5" />
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-5xl font-bold mb-2">{stats.completedGoals}</p>
              <p className="text-amber-100 text-sm">Goals achieved</p>
            </CardContent>
          </Card>

          {/* Average Progress */}
          <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white border-0 shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="w-5 h-5" />
                Avg Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-5xl font-bold mb-2">{stats.averageProgress.toFixed(0)}%</p>
              <p className="text-purple-100 text-sm">Overall completion</p>
            </CardContent>
          </Card>
        </div>
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Tabbed Goals View */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <Card className="bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl border-white/30 dark:border-slate-700/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <TabsList className="grid grid-cols-4 w-full sm:w-auto">
                  <TabsTrigger value="all" className="flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    All
                    <Badge variant="secondary" className="ml-1">{goals.length}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="active" className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Active
                    <Badge variant="secondary" className="ml-1">{stats.activeGoals}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="completed" className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Done
                    <Badge variant="secondary" className="ml-1">{stats.completedGoals}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="expired" className="flex items-center gap-2">
                    <XCircle className="w-4 h-4" />
                    Expired
                    <Badge variant="secondary" className="ml-1">{stats.expiredGoals}</Badge>
                  </TabsTrigger>
                </TabsList>
              </div>
            </CardHeader>
          </Card>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
          ) : (
            <>
              {['all', 'active', 'completed', 'expired'].map(tab => (
                <TabsContent key={tab} value={tab} className="mt-6">
                  {filteredGoals.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredGoals.map((goal) => {
                        const progress = calculateProgress(goal);
                        const isExpired = goal.status === 'expired';
                        const isCompleted = goal.status === 'completed';
                        const daysRemaining = Math.ceil((new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                        
                        return (
                          <Card 
                            key={goal.id} 
                            className={`backdrop-blur-xl hover:shadow-xl transition-all duration-300 ${
                              isCompleted 
                                ? 'bg-emerald-50/50 dark:bg-emerald-900/20 border-2 border-emerald-300 dark:border-emerald-700' 
                                : isExpired
                                ? 'bg-red-50/50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700'
                                : 'bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-700 hover:scale-[1.02]'
                            }`}
                          >
                            <CardHeader className="space-y-4">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className={`p-2 rounded-lg ${
                                      isCompleted 
                                        ? 'bg-emerald-100 dark:bg-emerald-900/50' 
                                        : isExpired
                                        ? 'bg-red-100 dark:bg-red-900/50'
                                        : 'bg-blue-100 dark:bg-blue-900/50'
                                    }`}>
                                      {getStatusIcon(goal.status)}
                                    </div>
                                    <Badge className={getStatusColor(goal.status)}>
                                      {goal.status || 'active'}
                                    </Badge>
                                    {goal.category && goal.category !== 'all' && (
                                      <Badge variant="outline" className="capitalize">
                                        {goal.category}
                                      </Badge>
                                    )}
                                  </div>
                                  <CardTitle className="text-lg flex items-center gap-2">
                                    <TrendingDown className={`w-5 h-5 ${
                                      isCompleted 
                                        ? 'text-emerald-600 dark:text-emerald-400' 
                                        : isExpired
                                        ? 'text-red-600 dark:text-red-400'
                                        : 'text-blue-600 dark:text-blue-400'
                                    }`} />
                                    {goal.goalName}
                                  </CardTitle>
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => handleRefreshProgress(goal.id)}
                                    title="Refresh progress"
                                    className="h-8 w-8"
                                  >
                                    <RefreshCw className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => handleEdit(goal)}
                                    title="Edit goal"
                                    className="h-8 w-8"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => setDeleteGoalId(goal.id)}
                                    title="Delete goal"
                                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardHeader>
                            
                            <CardContent className="space-y-4">
                              {/* Progress Bar */}
                              <div>
                                <div className="flex justify-between text-sm mb-2">
                                  <span className="font-medium text-slate-700 dark:text-slate-300">Progress</span>
                                  <span className={`font-bold ${
                                    progress >= 100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'
                                  }`}>
                                    {progress.toFixed(1)}%
                                  </span>
                                </div>
                                <Progress 
                                  value={progress} 
                                  className={`h-3 ${
                                    isCompleted ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-slate-200 dark:bg-slate-700'
                                  }`}
                                />
                              </div>

                              {/* Goal Metrics */}
                              <div className={`p-4 rounded-lg ${
                                isCompleted 
                                  ? 'bg-emerald-100 dark:bg-emerald-900/30' 
                                  : isExpired
                                  ? 'bg-red-100 dark:bg-red-900/30'
                                  : 'bg-blue-100 dark:bg-blue-900/30'
                              }`}>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                  <div>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Target</p>
                                    <p className="text-lg font-bold">
                                      {goal.targetValue}{goal.goalType === 'reduction_percentage' ? '%' : ' kg'}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Current</p>
                                    <p className="text-lg font-bold">
                                      {goal.currentValue || '0'}{goal.goalType === 'reduction_percentage' ? '%' : ' kg'}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Timeline Info */}
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-slate-500" />
                                  <span className="text-slate-600 dark:text-slate-400">
                                    {isExpired ? 'Expired' : daysRemaining > 0 ? `${daysRemaining} days left` : 'Due today'}
                                  </span>
                                </div>
                                <span className={`font-medium ${isExpired ? 'text-red-600' : 'text-slate-700 dark:text-slate-300'}`}>
                                  {new Date(goal.targetDate).toLocaleDateString()}
                                </span>
                              </div>

                              {/* Success/Failure Alert */}
                              {isCompleted && (
                                <Alert className="bg-emerald-100 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-700">
                                  <Trophy className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                  <AlertDescription className="text-emerald-700 dark:text-emerald-300 text-sm">
                                    <strong>Goal Achieved!</strong> Congratulations on reaching your target!
                                  </AlertDescription>
                                </Alert>
                              )}
                              
                              {isExpired && !isCompleted && (
                                <Alert className="bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700">
                                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                                  <AlertDescription className="text-red-700 dark:text-red-300 text-sm">
                                    <strong>Target Missed</strong> - Consider setting a new goal
                                  </AlertDescription>
                                </Alert>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  ) : (
                    <Card className="bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl">
                      <CardContent className="text-center py-12">
                        {tab === 'completed' && (
                          <>
                            <Trophy className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No Completed Goals Yet</h3>
                            <p className="text-slate-500 dark:text-slate-400 mb-4">
                              Keep working towards your active goals!
                            </p>
                          </>
                        )}
                        {tab === 'expired' && (
                          <>
                            <XCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No Expired Goals</h3>
                            <p className="text-slate-500 dark:text-slate-400">
                              All your goals are on track or completed!
                            </p>
                          </>
                        )}
                        {(tab === 'active' || tab === 'all') && (
                          <>
                            <Target className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No Goals Set Yet</h3>
                            <p className="text-slate-500 dark:text-slate-400 mb-6">
                              Create your first emission reduction goal to start tracking progress
                            </p>
                            <Button onClick={openNewGoalDialog} className="bg-emerald-600 hover:bg-emerald-700">
                              <Plus className="w-4 h-4 mr-2" />
                              Create Your First Goal
                            </Button>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              ))}
            </>
          )}
        </Tabs>
        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteGoalId} onOpenChange={() => setDeleteGoalId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your goal and remove all associated progress data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
