import { User, UserWithoutPassword, UserRole } from '../types/User';
import { STORAGE_KEYS, getFromStorage, saveToStorage } from './storage';

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

export function getAllUsers(): UserWithoutPassword[] {
  const users = getUsers();
  return users.map(stripPassword);
}

export function getUserById(id: number): UserWithoutPassword | null {
  const users = getUsers();
  const user = users.find((u) => u.id === id);
  return user ? stripPassword(user) : null;
}

export function updateUserRole(id: number, role: UserRole): UserWithoutPassword | null {
  const users = getUsers();
  const userIndex = users.findIndex((u) => u.id === id);

  if (userIndex === -1) {
    return null;
  }

  const updatedUser: User = {
    ...users[userIndex],
    role,
    updatedAt: new Date().toISOString(),
  };

  const updatedUsers = [...users];
  updatedUsers[userIndex] = updatedUser;
  saveUsers(updatedUsers);

  return stripPassword(updatedUser);
}

export function deleteUser(id: number, currentUserId: number): boolean {
  if (id === currentUserId) {
    throw new Error("Can't delete yourself.");
  }

  const users = getUsers();
  const updatedUsers = users.filter((u) => u.id !== id);

  if (updatedUsers.length === users.length) {
    return false;
  }

  saveUsers(updatedUsers);
  return true;
}
