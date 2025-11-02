import React, { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Eye, EyeOff, Loader2, LogIn, UserPlus, Mail, Lock, User, Building, ArrowLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function Auth() {
  const [, setLocation] = useLocation();
  const { login, signup, loginWithGoogle, isAuthenticated } = useAuth();
  
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: '' as 'individual' | 'company' | 'admin' | '',
    companyName: '',
    companyDepartment: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      setLocation('/dashboard');
    }
  }, [isAuthenticated, setLocation]);

  // Handle error from URL params (e.g., from failed OAuth)
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const errorParam = params.get('error');
    
    if (errorParam) {
      const errorMessages: Record<string, string> = {
        'google_auth_failed': 'Google authentication failed. Please try again.',
        'no_code': 'Authentication code not received.',
        'failed': 'Authentication failed. Please try again.',
        'invalid_data': 'Invalid authentication data. Please try again.',
        'missing_data': 'Authentication incomplete. Please try again.',
        'token_generation_failed': 'Failed to complete authentication. Please try again.',
      };
      
      setError(errorMessages[errorParam] || 'An error occurred. Please try again.');
      
      // Clear the error param from URL after short delay
      setTimeout(() => {
        window.history.replaceState({}, '', '/auth');
      }, 100);
    }
  }, []);

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError('');
    // Reset form when switching modes
    setFormData({
      email: formData.email, // Keep email
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      role: '',
      companyName: '',
      companyDepartment: '',
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        toast({
          title: "Login Successful",
          description: "Welcome back to CarbonSense!"
        });
        setLocation('/dashboard');
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (!formData.role) {
      setError('Please select a role');
      return;
    }

    if (formData.role === 'company' && !formData.companyName) {
      setError('Company name is required for company accounts');
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...signupData } = formData;
      const result = await signup(signupData as any);
      
      if (result.success) {
        toast({
          title: "Account Created",
          description: "Welcome to CarbonSense!"
        });
        setLocation('/dashboard');
      } else {
        setError(result.error || 'Signup failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError('');
    
    try {
      const result = await loginWithGoogle();
      
      if (result.success) {
        toast({
          title: "Login Successful",
          description: "Welcome to CarbonSense!"
        });
        setLocation('/dashboard');
      } else {
        setError(result.error || 'Google login failed');
      }
    } catch (err) {
      setError('Google authentication failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRoleChange = (role: 'individual' | 'company' | 'admin') => {
    setFormData(prev => ({
      ...prev,
      role,
      companyName: role === 'individual' ? '' : prev.companyName,
      companyDepartment: role === 'individual' ? '' : prev.companyDepartment,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-teal-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-br from-cyan-400/10 to-emerald-400/10 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>
      
      <div className="w-full max-w-md relative z-10">
        {/* Back to Home */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 p-0 border border-emerald-200 dark:border-emerald-800">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        <Card className="shadow-2xl border border-white/20 dark:border-slate-700/50 bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl">
          <CardHeader className="space-y-4 text-center pb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl mb-4 shadow-lg mx-auto">
              {mode === 'login' ? (
                <LogIn className="w-8 h-8 text-white" />
              ) : (
                <UserPlus className="w-8 h-8 text-white" />
              )}
            </div>
            <div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                {mode === 'login' ? 'Welcome Back' : 'Get Started'}
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400 text-lg">
                {mode === 'login' 
                  ? 'Access your carbon footprint dashboard' 
                  : 'Create your account to track and reduce emissions'}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 px-8">
            {/* Google OAuth Button */}
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 border-2 hover:bg-slate-50 dark:hover:bg-slate-800"
              onClick={handleGoogleLogin}
              disabled={googleLoading || loading}
            >
              {googleLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </>
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-slate-900 px-2 text-slate-500 dark:text-slate-400">
                  Or continue with email
                </span>
              </div>
            </div>

            {error && (
              <Alert variant="destructive" className="bg-red-50/80 dark:bg-red-900/20 backdrop-blur-sm border-red-200 dark:border-red-800 shadow-lg">
                <AlertDescription className="text-red-700 dark:text-red-300">{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={mode === 'login' ? handleLogin : handleSignup} autoComplete="on" method="post">
              <div className="space-y-4">
                {/* Register-only fields */}
                {mode === 'register' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                          <User className="h-4 w-4 text-emerald-500" />
                          First Name
                        </Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          type="text"
                          placeholder="Enter your first name"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                          className="h-11 bg-white/80 dark:bg-slate-800/80"
                          disabled={loading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Last Name
                        </Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          type="text"
                          placeholder="Enter your last name"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required
                          className="h-11 bg-white/80 dark:bg-slate-800/80"
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="role" className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <Building className="h-4 w-4 text-emerald-500" />
                        Account Type
                      </Label>
                      <Select
                        value={formData.role}
                        onValueChange={handleRoleChange}
                        required
                        disabled={loading}
                      >
                        <SelectTrigger className="h-11 bg-white/80 dark:bg-slate-800/80">
                          <SelectValue placeholder="Select account type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="individual">Individual</SelectItem>
                          <SelectItem value="company">Company</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {formData.role === 'company' && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="companyName" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Company Name
                          </Label>
                          <Input
                            id="companyName"
                            name="companyName"
                            type="text"
                            placeholder="Enter your company name"
                            value={formData.companyName}
                            onChange={handleInputChange}
                            required
                            className="h-11 bg-white/80 dark:bg-slate-800/80"
                            disabled={loading}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="companyDepartment" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Department (Optional)
                          </Label>
                          <Input
                            id="companyDepartment"
                            name="companyDepartment"
                            type="text"
                            placeholder="Enter your department"
                            value={formData.companyDepartment}
                            onChange={handleInputChange}
                            className="h-11 bg-white/80 dark:bg-slate-800/80"
                            disabled={loading}
                          />
                        </div>
                      </>
                    )}
                  </>
                )}

                {/* Common fields */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-blue-500" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    autoComplete="username email"
                    className="h-11 bg-white/80 dark:bg-slate-800/80"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Lock className="h-4 w-4 text-teal-500" />
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder={mode === 'register' ? 'At least 6 characters' : 'Enter your password'}
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                      className="h-11 pr-10 bg-white/80 dark:bg-slate-800/80"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {mode === 'register' && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Re-enter password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required
                        autoComplete="new-password"
                        className="h-11 pr-10 bg-white/80 dark:bg-slate-800/80"
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                  disabled={loading || googleLoading}
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : mode === 'login' ? (
                    <>
                      <LogIn className="h-5 w-5 mr-2" />
                      Sign In
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-5 w-5 mr-2" />
                      Create Account
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 px-8 pb-8">
            <Separator />
            <div className="text-center text-sm">
              <span className="text-slate-600 dark:text-slate-400">
                {mode === 'login' ? "New to CarbonSense?" : "Already have an account?"}
              </span>{' '}
              <button
                type="button"
                onClick={toggleMode}
                className="text-emerald-600 dark:text-emerald-400 font-semibold hover:text-emerald-700 dark:hover:text-emerald-300 hover:underline"
                disabled={loading || googleLoading}
              >
                {mode === 'login' ? 'Create an account' : 'Sign in'}
              </button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
