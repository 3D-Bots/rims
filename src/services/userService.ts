import { User, UserWithoutPassword, UserRole } from '../types/User';
import { userRepository } from './db/repositories';

function stripPassword(user: User): UserWithoutPassword {
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export function getAllUsers(): UserWithoutPassword[] {
  const users = userRepository.getAll();
  return users.map(stripPassword);
}

export function getUserById(id: number): UserWithoutPassword | null {
  const user = userRepository.getById(id);
  return user ? stripPassword(user) : null;
}

export function updateUserRole(id: number, role: UserRole): UserWithoutPassword | null {
  const updatedUser = userRepository.updateRole(id, role, new Date().toISOString());
  return updatedUser ? stripPassword(updatedUser) : null;
}

export function deleteUser(id: number, currentUserId: number): boolean {
  if (id === currentUserId) {
    throw new Error("Can't delete yourself.");
  }

  return userRepository.delete(id);
}
