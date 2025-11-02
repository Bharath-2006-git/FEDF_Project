import React, { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Loader2, LogIn, Mail, Lock, ArrowLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function Login() {
  const [, setLocation] = useLocation();
  const { login, isAuthenticated } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      setLocation('/dashboard');
    }
  }, [isAuthenticated, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const fieldName = name === 'username' ? 'email' : name; // Map username back to email for state
    setFormData(prev => ({
      ...prev,
      [fieldName]: value,
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
      
      <div className="w-full max-w-6xl relative z-10">
        {/* Back to Home */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 p-0 border border-emerald-200 dark:border-emerald-800">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        <Card className="shadow-2xl border border-white/20 dark:border-slate-700/50 bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">
            {/* Left Side - Login Form */}
            <div className="flex flex-col">
              <CardHeader className="space-y-4 pb-6">
                <div>
                  <CardTitle className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                    Welcome Back
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400 mt-2">
                    Access your carbon footprint dashboard
                  </CardDescription>
                </div>
              </CardHeader>

        <form onSubmit={handleSubmit} autoComplete="on" method="post">
          <CardContent className="space-y-6 px-8">
            {error && (
              <Alert variant="destructive" className="bg-red-50/80 dark:bg-red-900/20 backdrop-blur-sm border-red-200 dark:border-red-800 shadow-lg">
                <AlertDescription className="text-red-700 dark:text-red-300">{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-500" />
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-blue-500" />
                <Input
                  id="email"
                  name="username"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  autoComplete="username email"
                  className="pl-10 h-12 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-blue-200 dark:border-blue-700 focus:border-blue-400 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Lock className="h-4 w-4 text-teal-500" />
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-teal-500" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  autoComplete="current-password"
                  className="pl-10 pr-12 h-12 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-teal-200 dark:border-teal-700 focus:border-teal-400 dark:focus:border-teal-500 focus:ring-2 focus:ring-teal-200 dark:focus:ring-teal-800"
                  disabled={loading}
                  data-1p-ignore="true"
                  data-lpignore="true"
                  style={{ backgroundImage: 'none' }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-10 w-10 p-0 hover:bg-teal-50 dark:hover:bg-teal-900/30 text-teal-500"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-6 px-8 pb-8 mt-auto">
            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700 text-white font-semibold transition-all duration-300 shadow-xl shadow-emerald-500/25 hover:shadow-2xl hover:shadow-teal-500/30"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </>
              )}
            </Button>

            <div className="text-center text-sm text-slate-600 dark:text-slate-400">
              New to CarbonSense?{' '}
              <Link href="/signup">
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 underline cursor-pointer">
                  Create an account
                </span>
              </Link>
            </div>
          </CardFooter>
        </form>
            </div>

            {/* Right Side - Info Section */}
            <div className="hidden lg:flex flex-col justify-center p-12 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 text-white relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzBoLTJWMGgydjMwem0wIDMwdi0yaC0ydjJoMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
              
              <div className="relative z-10 space-y-8">
                <div>
                  <h2 className="text-4xl font-bold mb-4">Track. Reduce. Impact.</h2>
                  <p className="text-emerald-50 text-lg">
                    Join thousands of users making a real difference in the fight against climate change.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm flex-shrink-0">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Real-Time Analytics</h3>
                      <p className="text-emerald-50">Monitor your carbon footprint with comprehensive insights and detailed breakdowns</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm flex-shrink-0">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Actionable Tips</h3>
                      <p className="text-emerald-50">Get personalized recommendations based on your emission patterns</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm flex-shrink-0">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Track Progress</h3>
                      <p className="text-emerald-50">Set goals and watch your environmental impact decrease over time</p>
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-white/20">
                  <p className="text-emerald-50 italic">
                    "CarbonSense helped me reduce my emissions by 40% in just 3 months!"
                  </p>
                  <p className="text-sm text-emerald-100 mt-2">- Sarah J., Environmental Engineer</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}