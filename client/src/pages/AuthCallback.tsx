import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';

export default function AuthCallback() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');

  useEffect(() => {
    const processAuth = async () => {
      try {
        // Parse URL parameters
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        const userParam = params.get('user');
        const error = params.get('error');

        if (error) {
          setStatus('error');
          window.location.href = '/auth?error=' + error;
          return;
        }

        if (!token || !userParam) {
          setStatus('error');
          window.location.href = '/auth?error=missing_data';
          return;
        }

        // Parse user data
        const user = JSON.parse(decodeURIComponent(userParam));
        
        // Store token and user data
        localStorage.setItem('carbonSense_token', token);
        localStorage.setItem('carbonSense_user', JSON.stringify(user));
        
        setStatus('success');
        
        // Force a full page reload to ensure AuthContext picks up the new data
        window.location.href = '/dashboard';
      } catch (err) {
        console.error('[AuthCallback] Error:', err);
        setStatus('error');
        window.location.href = '/auth?error=invalid_data';
      }
    };

    processAuth();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          {status === 'processing' && 'Completing sign in...'}
          {status === 'success' && 'Success! Redirecting to dashboard...'}
          {status === 'error' && 'Authentication failed. Redirecting...'}
        </p>
      </div>
    </div>
  );
}
