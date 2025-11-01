import React, { useState, useEffect } from "react";
import { useAuth, useRoleAccess } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { 
  User, 
  Shield, 
  Mail,
  Calendar,
  BarChart3,
  Target,
  Leaf,
  Clock,
  Edit,
  Lock
} from "lucide-react";
import { apiService, userAPI } from "@/services/api";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { isIndividual, isCompany } = useRoleAccess();
  
  const [stats, setStats] = useState({
    totalEmissions: 0,
    totalEntries: 0,
    goalsCompleted: 0,
    memberSince: ""
  });
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    firstName: "",
    lastName: "",
    companyName: "",
    companyDepartment: ""
  });
  const [passwordFormData, setPasswordFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  useEffect(() => {
    loadProfileStats();
    if (user) {
      setEditFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        companyName: user.companyName || "",
        companyDepartment: user.companyDepartment || ""
      });
    }
  }, [user]);

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
      // Failed to load profile stats
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await userAPI.updateProfile(editFormData);
      
      // Update local user state
      updateUser({
        firstName: editFormData.firstName,
        lastName: editFormData.lastName,
        companyName: editFormData.companyName,
        companyDepartment: editFormData.companyDepartment
      });
      
      toast({
        title: "Profile Updated",
        description: "Your profile information has been updated successfully.",
      });
      setIsEditDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive"
      });
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive"
      });
      return;
    }

    if (passwordFormData.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive"
      });
      return;
    }

    try {
      await userAPI.updateProfile({
        currentPassword: passwordFormData.currentPassword,
        newPassword: passwordFormData.newPassword
      });
      
      toast({
        title: "Password Changed",
        description: "Your password has been changed successfully.",
      });
      setIsPasswordDialogOpen(false);
      setPasswordFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to change password",
        variant: "destructive"
      });
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
                  Manage your account information and settings
                </p>
              </div>
              <div className="flex gap-3">
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-emerald-600 hover:bg-emerald-700">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Edit Profile Information</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={editFormData.firstName}
                          onChange={(e) => setEditFormData({...editFormData, firstName: e.target.value})}
                          placeholder="Enter your first name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={editFormData.lastName}
                          onChange={(e) => setEditFormData({...editFormData, lastName: e.target.value})}
                          placeholder="Enter your last name"
                        />
                      </div>
                      {isCompany() && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="companyName">Company Name</Label>
                            <Input
                              id="companyName"
                              value={editFormData.companyName}
                              onChange={(e) => setEditFormData({...editFormData, companyName: e.target.value})}
                              placeholder="Enter company name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="companyDepartment">Department</Label>
                            <Input
                              id="companyDepartment"
                              value={editFormData.companyDepartment}
                              onChange={(e) => setEditFormData({...editFormData, companyDepartment: e.target.value})}
                              placeholder="Enter department"
                            />
                          </div>
                        </>
                      )}
                      <div className="flex gap-3">
                        <Button type="submit" className="flex-1">Save Changes</Button>
                        <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>

                <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Lock className="w-4 h-4 mr-2" />
                      Change Password
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Change Password</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleChangePassword} className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          value={passwordFormData.currentPassword}
                          onChange={(e) => setPasswordFormData({...passwordFormData, currentPassword: e.target.value})}
                          placeholder="Enter current password"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={passwordFormData.newPassword}
                          onChange={(e) => setPasswordFormData({...passwordFormData, newPassword: e.target.value})}
                          placeholder="Enter new password (min. 6 characters)"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={passwordFormData.confirmPassword}
                          onChange={(e) => setPasswordFormData({...passwordFormData, confirmPassword: e.target.value})}
                          placeholder="Confirm new password"
                          required
                        />
                      </div>
                      <div className="flex gap-3">
                        <Button type="submit" className="flex-1">Change Password</Button>
                        <Button type="button" variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </div>

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

            {isCompany() && (user?.companyName || user?.companyDepartment) && (
              <>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {user?.companyName && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        Company Name
                      </p>
                      <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        {user.companyName}
                      </p>
                    </div>
                  )}
                  {user?.companyDepartment && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        Department
                      </p>
                      <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        {user.companyDepartment}
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
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
                    <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
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
      </div>
    </div>
  );
}
