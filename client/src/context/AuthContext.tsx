import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@shared/schema';
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (userData: SignupData) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}
interface SignupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'individual' | 'company' | 'admin';
  companyName?: string;
  companyDepartment?: string;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
interface AuthProviderProps {
  children: ReactNode;
}
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });
  useEffect(() => {
    const token = localStorage.getItem('carbonSense_token');
    const userData = localStorage.getItem('carbonSense_user');
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        setAuthState({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('carbonSense_token');
        localStorage.removeItem('carbonSense_user');
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        const { token, user } = data;
        localStorage.setItem('carbonSense_token', token);
        localStorage.setItem('carbonSense_user', JSON.stringify(user));
        setAuthState({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
        return { success: true };
      } else {
        return { success: false, error: data.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };
  const signup = async (userData: SignupData): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      const data = await response.json();
      if (response.ok) {
        const { token, user } = data;
        localStorage.setItem('carbonSense_token', token);
        localStorage.setItem('carbonSense_user', JSON.stringify(user));
        setAuthState({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
        return { success: true };
      } else {
        return { success: false, error: data.message || 'Signup failed' };
      }
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      // Redirect to Google OAuth endpoint
      window.location.href = '/api/auth/google';
      return { success: true };
    } catch (error) {
      console.error('Google login error:', error);
      return { success: false, error: 'Failed to initiate Google login' };
    }
  };

  const logout = () => {
    localStorage.removeItem('carbonSense_token');
    localStorage.removeItem('carbonSense_user');
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };
  const updateUser = (userData: Partial<User>) => {
    if (authState.user) {
      const updatedUser = { ...authState.user, ...userData };
      localStorage.setItem('carbonSense_user', JSON.stringify(updatedUser));
      setAuthState(prev => ({
        ...prev,
        user: updatedUser,
      }));
    }
  };
  const value: AuthContextType = {
    ...authState,
    login,
    signup,
    loginWithGoogle,
    logout,
    updateUser,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
export const withAuth = <P extends object>(Component: React.ComponentType<P>) => {
  return (props: P) => {
    const { isAuthenticated, isLoading } = useAuth();
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading...</p>
          </div>
        </div>
      );
    }
    if (!isAuthenticated) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
            <p className="text-muted-foreground">Please log in to access this page.</p>
          </div>
        </div>
      );
    }
    return <Component {...props} />;
  };
};
export const useRoleAccess = () => {
  const { user } = useAuth();
  const hasRole = (requiredRole: string | string[]) => {
    if (!user) return false;
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(user.role);
    }
    return user.role === requiredRole;
  };
  const isIndividual = () => hasRole('individual');
  const isCompany = () => hasRole('company');
  const isAdmin = () => hasRole('admin');
  return {
    hasRole,
    isIndividual,
    isCompany,
    isAdmin,
    userRole: user?.role,
  };
};
