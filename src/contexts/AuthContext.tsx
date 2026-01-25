import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserWithoutPassword, LoginCredentials, RegisterData } from '../types/User';
import * as authService from '../services/authService';
import { initializeData } from '../data/seed';

interface AuthContextType {
  user: UserWithoutPassword | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (credentials: LoginCredentials) => UserWithoutPassword | null;
  logout: () => void;
  register: (data: RegisterData) => UserWithoutPassword | null;
  updateProfile: (data: { email?: string; password?: string; currentPassword?: string }) => UserWithoutPassword | null;
  deleteAccount: () => boolean;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserWithoutPassword | null>(null);

  useEffect(() => {
    initializeData();
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  const login = (credentials: LoginCredentials): UserWithoutPassword | null => {
    const loggedInUser = authService.login(credentials);
    if (loggedInUser) {
      setUser(loggedInUser);
    }
    return loggedInUser;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const register = (data: RegisterData): UserWithoutPassword | null => {
    const newUser = authService.register(data);
    if (newUser) {
      setUser(newUser);
    }
    return newUser;
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
    login,
    logout,
    register,
    updateProfile,
    deleteAccount,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
