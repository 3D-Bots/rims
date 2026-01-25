import { User, UserWithoutPassword, LoginCredentials, RegisterData } from '../types/User';
import { STORAGE_KEYS, getFromStorage, saveToStorage, removeFromStorage } from './storage';

function getUsers(): User[] {
  return getFromStorage<User[]>(STORAGE_KEYS.USERS) || [];
}

function saveUsers(users: User[]): void {
  saveToStorage(STORAGE_KEYS.USERS, users);
}

function stripPassword(user: User): UserWithoutPassword {
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export function login(credentials: LoginCredentials): UserWithoutPassword | null {
  const users = getUsers();
  const user = users.find(
    (u) => u.email.toLowerCase() === credentials.email.toLowerCase() && u.password === credentials.password
  );

  if (!user) {
    return null;
  }

  // Update sign-in tracking
  const updatedUser: User = {
    ...user,
    signInCount: user.signInCount + 1,
    lastSignInAt: new Date().toISOString(),
    lastSignInIp: '127.0.0.1',
    updatedAt: new Date().toISOString(),
  };

  const updatedUsers = users.map((u) => (u.id === user.id ? updatedUser : u));
  saveUsers(updatedUsers);

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

  const users = getUsers();
  const existingUser = users.find((u) => u.email.toLowerCase() === data.email.toLowerCase());

  if (existingUser) {
    throw new Error('Email has already been taken');
  }

  const newUser: User = {
    id: Math.max(0, ...users.map((u) => u.id)) + 1,
    email: data.email,
    password: data.password,
    role: 'user',
    signInCount: 1,
    lastSignInAt: new Date().toISOString(),
    lastSignInIp: '127.0.0.1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  saveUsers([...users, newUser]);

  const userWithoutPassword = stripPassword(newUser);
  saveToStorage(STORAGE_KEYS.CURRENT_USER, userWithoutPassword);
  return userWithoutPassword;
}

export function updateProfile(
  userId: number,
  data: { email?: string; password?: string; currentPassword?: string }
): UserWithoutPassword | null {
  const users = getUsers();
  const user = users.find((u) => u.id === userId);

  if (!user) {
    throw new Error('User not found');
  }

  if (data.currentPassword && data.currentPassword !== user.password) {
    throw new Error('Current password is incorrect');
  }

  if (data.email && data.email.toLowerCase() !== user.email.toLowerCase()) {
    const existingUser = users.find(
      (u) => u.email.toLowerCase() === data.email!.toLowerCase() && u.id !== userId
    );
    if (existingUser) {
      throw new Error('Email has already been taken');
    }
  }

  const updatedUser: User = {
    ...user,
    email: data.email || user.email,
    password: data.password || user.password,
    updatedAt: new Date().toISOString(),
  };

  const updatedUsers = users.map((u) => (u.id === userId ? updatedUser : u));
  saveUsers(updatedUsers);

  const userWithoutPassword = stripPassword(updatedUser);
  saveToStorage(STORAGE_KEYS.CURRENT_USER, userWithoutPassword);
  return userWithoutPassword;
}

export function deleteAccount(userId: number): boolean {
  const users = getUsers();
  const updatedUsers = users.filter((u) => u.id !== userId);
  saveUsers(updatedUsers);
  removeFromStorage(STORAGE_KEYS.CURRENT_USER);
  return true;
}
