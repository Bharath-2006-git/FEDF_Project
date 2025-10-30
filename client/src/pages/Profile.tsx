import React, { useState, useEffect } from "react";
import { useAuth, useRoleAccess } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  User, 
  Shield, 
  Mail,
  Calendar,
  BarChart3,
  Target,
  Leaf,
  Clock,
  Info
} from "lucide-react";
import { apiService } from "@/services/api";

export default function Profile() {
  const { user } = useAuth();
  const { isIndividual, isCompany } = useRoleAccess();
  
  const [stats, setStats] = useState({
    totalEmissions: 0,
    totalEntries: 0,
    goalsCompleted: 0,
    memberSince: ""
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfileStats();
  }, []);

  const loadProfileStats = async () => {
    try {
      const emissionHistory = await apiService.getEmissionHistory();
      const goals = await apiService.getGoals();
      
      const totalEmissions = emissionHistory.reduce((sum: number, item: any) => 
        sum + (item.emissions || 0), 0
      );
      
      const completedGoals = goals.filter((g: any) => g.status === 'completed').length;
      
      setStats({
        totalEmissions: Math.round(totalEmissions * 100) / 100,
        totalEntries: emissionHistory.length,
        goalsCompleted: completedGoals,
        memberSince: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }) : 'N/A'
      });
    } catch (error) {
      console.error('Failed to load profile stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 dark:from-emerald-500/5 dark:to-emerald-600/5 rounded-3xl blur-3xl opacity-75 dark:opacity-100"></div>
          <div className="relative bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-white/30 dark:border-slate-700/30">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-3">
                  <User className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                  Profile
                </h1>
                <p className="text-lg font-medium text-slate-600 dark:text-slate-300">
                  View your account information and statistics
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Note about read-only profile */}
        <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-800 dark:text-blue-200">
            Profile information is currently read-only. Profile editing features will be available in a future update.
          </AlertDescription>
        </Alert>

        {/* Profile Information */}
        <Card className="bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl border-white/30 dark:border-slate-700/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Full Name
                </p>
                <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {user?.firstName} {user?.lastName || ''}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </p>
                <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {user?.email}
                </p>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Account Type
                </p>
                <Badge variant="secondary" className="text-sm">
                  {isIndividual() ? '👤 Individual Account' : isCompany() ? '🏢 Company Account' : 'Account'}
                </Badge>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Member Since
                </p>
                <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {stats.memberSince}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card className="bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl border-white/30 dark:border-slate-700/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Your Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Loading statistics...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Leaf className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <p className="text-sm font-medium">Total Emissions</p>
                  </div>
                  <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                    {stats.totalEmissions.toFixed(1)} <span className="text-sm font-normal text-slate-600 dark:text-slate-400">kg CO2e</span>
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <p className="text-sm font-medium">Total Entries</p>
                  </div>
                  <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                    {stats.totalEntries}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <p className="text-sm font-medium">Goals Completed</p>
                  </div>
                  <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                    {stats.goalsCompleted}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Future Features Info */}
        <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border-amber-200 dark:border-amber-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-900 dark:text-amber-100">
              <Clock className="w-5 h-5" />
              Coming Soon
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
              The following features will be available in future updates:
            </p>
            <ul className="space-y-2 text-sm text-amber-700 dark:text-amber-300">
              <li className="flex items-center gap-2">
                <span className="text-amber-500">•</span>
                Edit profile information (name, email)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-amber-500">•</span>
                Change password
              </li>
              <li className="flex items-center gap-2">
                <span className="text-amber-500">•</span>
                Upload profile picture
              </li>
              <li className="flex items-center gap-2">
                <span className="text-amber-500">•</span>
                Notification preferences
              </li>
              <li className="flex items-center gap-2">
                <span className="text-amber-500">•</span>
                Privacy settings
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
