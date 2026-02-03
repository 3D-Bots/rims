import { User, UserWithoutPassword, LoginCredentials, RegisterData } from '../types/User';
import { STORAGE_KEYS, getFromStorage, saveToStorage, removeFromStorage } from './storage';
import { userRepository } from './db/repositories';

function stripPassword(user: User): UserWithoutPassword {
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export function login(credentials: LoginCredentials): UserWithoutPassword | null {
  const user = userRepository.findByEmail(credentials.email);

  if (!user || user.password !== credentials.password) {
    return null;
  }

  // Update sign-in tracking
  const updatedUser = userRepository.updateSignIn(user.id, {
    signInCount: user.signInCount + 1,
    lastSignInAt: new Date().toISOString(),
    lastSignInIp: '127.0.0.1',
    updatedAt: new Date().toISOString(),
  });

  if (!updatedUser) {
    return null;
  }

  const userWithoutPassword = stripPassword(updatedUser);
  saveToStorage(STORAGE_KEYS.CURRENT_USER, userWithoutPassword);
  return userWithoutPassword;
}

export function logout(): void {
  removeFromStorage(STORAGE_KEYS.CURRENT_USER);
}

export function getCurrentUser(): UserWithoutPassword | null {
  return getFromStorage<UserWithoutPassword>(STORAGE_KEYS.CURRENT_USER);
}

export function register(data: RegisterData): UserWithoutPassword | null {
  if (data.password !== data.passwordConfirmation) {
    throw new Error('Password confirmation does not match');
  }

  if (data.password.length < 8) {
    throw new Error('Password must be at least 8 characters');
  }

  const existingUser = userRepository.findByEmail(data.email);
  if (existingUser) {
    throw new Error('Email has already been taken');
  }

  const newUser = userRepository.create({
    email: data.email,
    password: data.password,
    role: 'user',
    signInCount: 1,
    lastSignInAt: new Date().toISOString(),
    lastSignInIp: '127.0.0.1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const userWithoutPassword = stripPassword(newUser);
  saveToStorage(STORAGE_KEYS.CURRENT_USER, userWithoutPassword);
  return userWithoutPassword;
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
