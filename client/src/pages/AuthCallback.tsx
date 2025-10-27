import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/context/AuthContext';

export default function AuthCallback() {
  const [, setLocation] = useLocation();
  const { updateUser } = useAuth();

  useEffect(() => {
    // Parse URL parameters
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const userParam = params.get('user');
    const error = params.get('error');

    if (error) {
      console.error('OAuth error:', error);
      setLocation('/auth?error=' + error);
      return;
    }

    if (token && userParam) {
      try {
        const user = JSON.parse(decodeURIComponent(userParam));
        
        // Store token and user data
        localStorage.setItem('carbonSense_token', token);
        localStorage.setItem('carbonSense_user', JSON.stringify(user));
        
        // Update auth context
        updateUser(user);
        
        // Redirect to dashboard
        window.location.href = '/dashboard';
      } catch (err) {
        console.error('Failed to parse user data:', err);
        setLocation('/auth?error=invalid_data');
      }
    } else {
      setLocation('/auth?error=missing_data');
    }
  }, [setLocation, updateUser]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
        <p className="text-lg text-slate-600 dark:text-slate-400">Completing sign in...</p>
      </div>
    </div>
  );
}
