import React, { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Loader2, Mail, Lock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function Login() {
  const [, setLocation] = useLocation();
  const { login, isAuthenticated } = useAuth();
  
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (isAuthenticated) setLocation('/dashboard');
  }, [isAuthenticated, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        toast({ title: "Login Successful", description: "Welcome back!" });
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
    const fieldName = name === 'username' ? 'email' : name;
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleGoogleLogin = () => {
    toast({ title: "Coming Soon", description: "Google Sign-In will be available soon!" });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 flex flex-col lg:flex-row">
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-16">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <Link href="/"><h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent cursor-pointer hover:opacity-80 transition-opacity">CarbonSense</h1></Link>
          </div>
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Welcome Back</h2>
            <p className="text-slate-600 dark:text-slate-400">Sign in to continue your sustainability journey</p>
          </div>
          <form onSubmit={handleSubmit} autoComplete="on" className="space-y-5">
            {error && (<Alert variant="destructive" className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"><AlertDescription className="text-red-700 dark:text-red-300">{error}</AlertDescription></Alert>)}
            <Button type="button" variant="outline" className="w-full h-12 border-2 rounded-xl" onClick={handleGoogleLogin} disabled={loading}>
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Continue with Google
            </Button>
            <div className="relative"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-700"></div></div><div className="relative flex justify-center text-sm"><span className="px-4 bg-white dark:bg-slate-900 text-slate-500">Or continue with email</span></div></div>
            <div className="space-y-2"><Label htmlFor="email" className="text-sm font-medium">Email Address</Label><div className="relative"><Mail className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" /><Input id="email" name="username" type="email" placeholder="you@example.com" value={formData.email} onChange={handleInputChange} required autoComplete="username email" className="pl-11 h-12 rounded-xl" disabled={loading} /></div></div>
            <div className="space-y-2"><Label htmlFor="password" className="text-sm font-medium">Password</Label><div className="relative"><Lock className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" /><Input id="password" name="password" type={showPassword ? 'text' : 'password'} placeholder="Enter your password" value={formData.password} onChange={handleInputChange} required autoComplete="current-password" className="pl-11 pr-11 h-12 rounded-xl" disabled={loading} /><Button type="button" variant="ghost" size="sm" className="absolute right-1 top-1 h-10 w-10 p-0 rounded-lg" onClick={() => setShowPassword(!showPassword)} disabled={loading}>{showPassword ? <EyeOff className="h-5 w-5 text-slate-400" /> : <Eye className="h-5 w-5 text-slate-400" />}</Button></div></div>
            <Button type="submit" className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg" disabled={loading}>{loading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Signing In...</> : 'Sign In'}</Button>
            <p className="text-center text-sm text-slate-600 dark:text-slate-400">Don't have an account? <Link href="/signup"><span className="font-semibold text-emerald-600 hover:text-emerald-700 cursor-pointer">Create an account</span></Link></p>
          </form>
        </div>
      </div>
      <div className="hidden lg:flex flex-1 items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950 dark:via-teal-950 dark:to-cyan-950 p-16 relative overflow-hidden">
        <div className="absolute inset-0"><div className="absolute top-20 right-20 w-64 h-64 bg-emerald-200/30 dark:bg-emerald-800/20 rounded-full blur-3xl animate-pulse"></div><div className="absolute bottom-20 left-20 w-80 h-80 bg-teal-200/30 dark:bg-teal-800/20 rounded-full blur-3xl animate-pulse"></div></div>
        <div className="relative z-10 text-center">
          <div className="mb-8 relative"><div className="w-80 h-80 mx-auto relative"><div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 animate-pulse shadow-2xl"></div><div className="absolute inset-0 rounded-full bg-gradient-to-tl from-emerald-500/40 via-transparent to-white/20"></div><div className="absolute inset-8 rounded-full bg-gradient-to-br from-emerald-300 via-teal-400 to-cyan-500 opacity-80"></div><div className="absolute inset-16 rounded-full bg-gradient-to-br from-emerald-200 via-teal-300 to-cyan-400 opacity-60"></div><div className="absolute inset-0 flex items-center justify-center"><svg className="w-64 h-64 opacity-30" viewBox="0 0 100 100"><path d="M30,25 Q35,20 40,25 L45,30 Q50,35 45,40 L40,45 Q35,50 30,45 Z" fill="currentColor" className="text-emerald-700"/><path d="M55,35 Q60,30 65,35 L70,40 Q75,45 70,50 L65,55 Q60,60 55,55 Z" fill="currentColor" className="text-emerald-700"/><path d="M25,60 Q30,55 35,60 L40,65 Q45,70 40,75 L35,80 Q30,85 25,80 Z" fill="currentColor" className="text-emerald-700"/></svg></div></div></div>
          <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Track Your Impact</h3>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-md mx-auto">Join thousands making a difference in the fight against climate change. Every action counts towards a sustainable future.</p>
        </div>
      </div>
    </div>
  );
}
