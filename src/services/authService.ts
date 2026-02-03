import { User, UserWithoutPassword, LoginCredentials, RegisterData } from '../types/User';
import { STORAGE_KEYS, getFromStorage, saveToStorage, removeFromStorage } from './storage';
import { userRepository } from './db/repositories';

function stripPassword(user: User): UserWithoutPassword {
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export interface LoginResult {
  user: UserWithoutPassword | null;
  error?: 'invalid_credentials' | 'email_not_verified';
}

export async function login(credentials: LoginCredentials): Promise<LoginResult> {
  // Always try to sync from server to get latest role/status
  await syncUserFromServer(credentials.email, credentials.password);

  const user = userRepository.findByEmail(credentials.email);

  if (!user || user.password !== credentials.password) {
    return { user: null, error: 'invalid_credentials' };
  }

  // Check if email is verified
  if (!user.emailVerified) {
    return { user: null, error: 'email_not_verified' };
  }

  // Update sign-in tracking
  const updatedUser = userRepository.updateSignIn(user.id, {
    signInCount: user.signInCount + 1,
    lastSignInAt: new Date().toISOString(),
    lastSignInIp: '127.0.0.1',
    updatedAt: new Date().toISOString(),
  });

  if (!updatedUser) {
    return { user: null, error: 'invalid_credentials' };
  }

  const userWithoutPassword = stripPassword(updatedUser);
  saveToStorage(STORAGE_KEYS.CURRENT_USER, userWithoutPassword);
  return { user: userWithoutPassword };
}

async function syncUserFromServer(email: string, password: string): Promise<boolean> {
  try {
    const response = await fetch('/api/auth/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      return false;
    }

    const result = await response.json();
    if (result.user) {
      const existingUser = userRepository.findByEmail(result.user.email);
      if (existingUser) {
        // Update existing user's role and verification status
        userRepository.updateRole(existingUser.id, result.user.role, new Date().toISOString());
        if (result.user.emailVerified && !existingUser.emailVerified) {
          userRepository.markEmailVerified(existingUser.id);
        }
      } else {
        // Create new user
        userRepository.create({
          email: result.user.email,
          password: result.user.password,
          role: result.user.role || 'user',
          signInCount: 0,
          lastSignInAt: null,
          lastSignInIp: null,
          emailVerified: result.user.emailVerified,
          emailVerificationToken: null,
          emailVerificationTokenExpiresAt: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
      return true;
    }
  } catch (error) {
    console.error('Failed to sync user from server:', error);
  }
  return false;
}

export function isEmailVerified(email: string): boolean {
  const user = userRepository.findByEmail(email);
  return user?.emailVerified ?? false;
}

export function logout(): void {
  removeFromStorage(STORAGE_KEYS.CURRENT_USER);
}

export function getCurrentUser(): UserWithoutPassword | null {
  return getFromStorage<UserWithoutPassword>(STORAGE_KEYS.CURRENT_USER);
}

export interface RegisterResult {
  success: boolean;
  message: string;
  userId?: number;
}

export async function register(data: RegisterData): Promise<RegisterResult> {
  if (data.password !== data.passwordConfirmation) {
    throw new Error('Password confirmation does not match');
  }

  if (data.password.length < 8) {
    throw new Error('Password must be at least 8 characters');
  }

  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Registration failed');
  }

  return {
    success: true,
    message: result.message,
    userId: result.userId,
  };
}

export async function resendVerificationEmail(email: string): Promise<{ success: boolean; message: string }> {
  const response = await fetch('/api/auth/resend-verification', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Failed to resend verification email');
  }

  return {
    success: true,
    message: result.message,
  };
}

export async function verifyEmail(token: string): Promise<{ success: boolean; message: string }> {
  const response = await fetch('/api/auth/verify-email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Email verification failed');
  }

  // Sync user to frontend database if user data is returned
  if (result.user) {
    const existingUser = userRepository.findByEmail(result.user.email);
    if (!existingUser) {
      userRepository.create({
        email: result.user.email,
        password: result.user.password,
        role: result.user.role || 'user',
        signInCount: 0,
        lastSignInAt: null,
        lastSignInIp: null,
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationTokenExpiresAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } else if (!existingUser.emailVerified) {
      // Update existing user to verified
      userRepository.markEmailVerified(existingUser.id);
    }
  }

  return {
    success: true,
    message: result.message,
  };
}

export function updateProfile(
  userId: number,
  data: { email?: string; password?: string; currentPassword?: string }
): UserWithoutPassword | null {
  const user = userRepository.getById(userId);

  if (!user) {
    throw new Error('User not found');
  }

  if (data.currentPassword && data.currentPassword !== user.password) {
    throw new Error('Current password is incorrect');
  }

  if (data.email && data.email.toLowerCase() !== user.email.toLowerCase()) {
    if (userRepository.emailExistsForOther(data.email, userId)) {
      throw new Error('Email has already been taken');
    }
  }

  const updatedAt = new Date().toISOString();
  let updatedUser = user;

  if (data.email) {
    updatedUser = userRepository.updateEmail(userId, data.email, updatedAt) || user;
  }

  if (data.password) {
    updatedUser = userRepository.updatePassword(userId, data.password, updatedAt) || updatedUser;
  }

  const userWithoutPassword = stripPassword(updatedUser);
  saveToStorage(STORAGE_KEYS.CURRENT_USER, userWithoutPassword);
  return userWithoutPassword;
}

export function deleteAccount(userId: number): boolean {
  const result = userRepository.delete(userId);
  if (result) {
    removeFromStorage(STORAGE_KEYS.CURRENT_USER);
  }
  return result;
}
