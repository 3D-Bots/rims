import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserWithoutPassword, LoginCredentials, RegisterData } from '../types/User';
import * as authService from '../services/authService';
import { initializeData } from '../data/seed';
import { LoginResult, RegisterResult } from '../services/authService';

interface AuthContextType {
  user: UserWithoutPassword | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<LoginResult>;
  logout: () => void;
  register: (data: RegisterData) => Promise<RegisterResult>;
  updateProfile: (data: { email?: string; password?: string; currentPassword?: string }) => UserWithoutPassword | null;
  deleteAccount: () => boolean;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserWithoutPassword | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        // Initialize database (async)
        await initializeData();

        // Get current user from session
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Failed to initialize database:', error);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<LoginResult> => {
    const result = await authService.login(credentials);
    if (result.user) {
      setUser(result.user);
    }
    return result;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const register = async (data: RegisterData): Promise<RegisterResult> => {
    // Registration now goes through the server API and doesn't auto-login
    return authService.register(data);
  };

  const updateProfile = (data: { email?: string; password?: string; currentPassword?: string }): UserWithoutPassword | null => {
    if (!user) return null;
    const updatedUser = authService.updateProfile(user.id, data);
    if (updatedUser) {
      setUser(updatedUser);
    }
    return updatedUser;
  };

  const deleteAccount = (): boolean => {
    if (!user) return false;
    const result = authService.deleteAccount(user.id);
    if (result) {
      setUser(null);
    }
    return result;
  };

  const refreshUser = () => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isLoading,
    login,
    logout,
    register,
    updateProfile,
    deleteAccount,
    refreshUser,
  };

  // Show loading state while initializing database
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Initializing database...</p>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
