import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Mail, Lock, User, Building, Loader2 } from "lucide-react";

export default function Signup() {
  const [, navigate] = useLocation();
  const { signup, loginWithGoogle, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "individual" as "individual" | "company",
    companyName: "",
    companyDepartment: "",
  });

  useEffect(() => {
    if (isAuthenticated) navigate("/");
  }, [isAuthenticated, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRoleChange = (value: "individual" | "company") => {
    setFormData(prev => ({ ...prev, role: value }));
  };

  const handleGoogleLogin = () => {
    if (typeof loginWithGoogle === 'function') {
      loginWithGoogle();
      return;
    }
    if (typeof window !== 'undefined') {
      window.location.href = `${window.location.origin}/api/auth/google`;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.role === "company" && !formData.companyName.trim()) {
      setError("Company name is required for company accounts");
      return;
    }

    setLoading(true);
    try {
      await signup({
        password: formData.password,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role,
        companyName: formData.companyName || undefined,
        companyDepartment: formData.companyDepartment || undefined,
      });
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-slate-900">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Join Carbon Sense</h2>
            <p className="mt-2 text-slate-600 dark:text-slate-400">Track and reduce your carbon footprint</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="button" variant="outline" className="w-full h-12 border-2 rounded-xl" onClick={handleGoogleLogin} disabled={loading}>
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-slate-900 text-slate-500">Or continue with email</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium">First Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                  <Input id="firstName" name="firstName" type="text" placeholder="First name" value={formData.firstName} onChange={handleInputChange} required autoComplete="given-name" className="pl-11 h-12 rounded-xl" disabled={loading} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium">Last Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                  <Input id="lastName" name="lastName" type="text" placeholder="Last name" value={formData.lastName} onChange={handleInputChange} required autoComplete="family-name" className="pl-11 h-12 rounded-xl" disabled={loading} />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="text-sm font-medium">Account Type</Label>
              <Select onValueChange={handleRoleChange} disabled={loading}>
                <SelectTrigger className="h-12 rounded-xl">
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">🌱 Individual</SelectItem>
                  <SelectItem value="company">🏢 Company</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.role === "company" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="text-sm font-medium">Company Name</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                    <Input id="companyName" name="companyName" type="text" placeholder="Company name" value={formData.companyName} onChange={handleInputChange} required autoComplete="organization" className="pl-11 h-12 rounded-xl" disabled={loading} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyDepartment" className="text-sm font-medium">Department (Optional)</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                    <Input id="companyDepartment" name="companyDepartment" type="text" placeholder="Department" value={formData.companyDepartment} onChange={handleInputChange} autoComplete="organization-title" className="pl-11 h-12 rounded-xl" disabled={loading} />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                <Input id="email" name="email" type="email" placeholder="name@example.com" value={formData.email} onChange={handleInputChange} required autoComplete="email" className="pl-11 h-12 rounded-xl" disabled={loading} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                <Input id="password" name="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={formData.password} onChange={handleInputChange} required autoComplete="new-password" className="pl-11 pr-11 h-12 rounded-xl" disabled={loading} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600" disabled={loading}>
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                <Input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="••••••••" value={formData.confirmPassword} onChange={handleInputChange} required autoComplete="new-password" className="pl-11 pr-11 h-12 rounded-xl" disabled={loading} />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600" disabled={loading}>
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-medium" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              Create Account
            </Button>

            <p className="text-center text-sm text-slate-600 dark:text-slate-400">
              Already have an account?{" "}
              <a href="/login" className="font-medium text-emerald-600 hover:text-emerald-500">
                Sign in
              </a>
            </p>
          </form>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl"></div>
        </div>
        <div className="relative text-center">
          <div className="w-64 h-64 mx-auto mb-8 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-white/10 rounded-full backdrop-blur-sm"></div>
            <div className="absolute inset-4 bg-gradient-to-tr from-emerald-400/50 to-cyan-300/50 rounded-full animate-pulse"></div>
            <div className="absolute inset-8 bg-gradient-to-bl from-teal-300/60 to-emerald-400/60 rounded-full"></div>
          </div>
          <h3 className="text-3xl font-bold text-white mb-4">Start Your Sustainability Journey</h3>
          <p className="text-white/90 text-lg max-w-md">Track emissions, set goals, and make a real impact on our planet</p>
        </div>
      </div>
    </div>
  );
}
