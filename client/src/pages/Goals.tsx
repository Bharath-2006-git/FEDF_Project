import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import { 
  Target, 
  Plus, 
  TrendingDown, 
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Edit,
  Trash2
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
export default function Goals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<GoalFormData>({
    goalName: "",
    goalType: "reduction_percentage",
    targetValue: "",
    targetDate: "",
    category: "all"
  });
  useEffect(() => {
    if (user) {
      fetchGoals();
    }
  }, [user]);
  const fetchGoals = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/goals', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('carbonSense_token')}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch goals');
      }
      const data = await response.json();
      setGoals(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('carbonSense_token')}`
        },
        body: JSON.stringify({
          ...formData,
          userId: user?.id,
          targetValue: parseFloat(formData.targetValue)
        })
      });
      if (!response.ok) {
        throw new Error('Failed to create goal');
      }
      toast({
        title: "Goal Created",
        description: "Your emission reduction goal has been set successfully.",
      });
      setIsDialogOpen(false);
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
        return 'bg-primary/20 text-primary dark:bg-primary/30 dark:text-primary';
      case 'expired':
        return 'bg-destructive/20 text-destructive dark:bg-destructive/30 dark:text-destructive';
      default:
        return 'bg-chart-2/20 text-chart-2 dark:bg-chart-2/30 dark:text-chart-2';
    }
  };
  const calculateProgress = (goal: Goal) => {
    if (!goal.currentValue || !goal.targetValue) return 0;
    const current = parseFloat(goal.currentValue);
    const target = parseFloat(goal.targetValue);
    return Math.min((current / target) * 100, 100);
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 dark:from-emerald-500/5 dark:to-emerald-600/5 rounded-3xl blur-3xl opacity-75 dark:opacity-100"></div>
          <div className="relative bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-white/30 dark:border-slate-700/30">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-3">
                  <Target className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                  Emission Goals
                </h1>
                <p className="text-lg font-medium text-slate-600 dark:text-slate-300">
                  Set and track your carbon emission reduction targets
                </p>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-emerald-600 hover:bg-emerald-700">
                    <Plus className="w-4 h-4 mr-2" />
                    New Goal
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Create New Goal</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-6">
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
                      <Button type="submit" className="flex-1">Create Goal</Button>
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map((goal) => {
              const progress = calculateProgress(goal);
              const isExpired = new Date(goal.targetDate) < new Date() && goal.status !== 'completed';
              return (
                <Card 
                  key={goal.id} 
                  className="bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl border-white/30 dark:border-slate-700/30 hover:shadow-lg transition-all duration-300"
                >
                  <CardHeader className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <TrendingDown className="w-5 h-5 text-emerald-600" />
                          {goal.goalName}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          {getStatusIcon(goal.status)}
                          <Badge className={getStatusColor(goal.status)}>
                            {goal.status || 'active'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span>{progress.toFixed(1)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Target:</span>
                        <span className="font-medium">
                          {goal.targetValue} {goal.goalType === 'reduction_percentage' ? '%' : 'kg CO2'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Current:</span>
                        <span className="font-medium">
                          {goal.currentValue || '0'} {goal.goalType === 'reduction_percentage' ? '%' : 'kg CO2'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Due Date:</span>
                        <span className={`font-medium ${isExpired ? 'text-destructive' : ''}`}>
                          {new Date(goal.targetDate).toLocaleDateString()}
                        </span>
                      </div>
                      {goal.category && goal.category !== 'all' && (
                        <div className="flex justify-between">
                          <span className="text-slate-600 dark:text-slate-400">Category:</span>
                          <Badge variant="outline" className="capitalize">
                            {goal.category}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
        {!loading && goals.length === 0 && (
          <Card className="bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl border-white/30 dark:border-slate-700/30">
            <CardContent className="text-center py-12">
              <Target className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-300 mb-2">
                No goals set yet
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                Create your first emission reduction goal to start tracking your progress.
              </p>
              <Button onClick={() => setIsDialogOpen(true)} className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Goal
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
