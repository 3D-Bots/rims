import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAllUsers, getUserById, updateUserRole, deleteUser } from './userService';
import { userRepository } from './db/repositories';

vi.mock('./db/repositories', () => ({
  userRepository: {
    getAll: vi.fn(),
    getById: vi.fn(),
    updateRole: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockUser = {
  id: 1,
  email: 'test@example.com',
  password: 'password123',
  role: 'user' as const,
  signInCount: 0,
  lastSignInAt: null,
  lastSignInIp: null,
  emailVerified: false,
  emailVerificationToken: null,
  emailVerificationTokenExpiresAt: null,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

describe('userService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllUsers', () => {
    it('returns all users without passwords', () => {
      const users = [mockUser, { ...mockUser, id: 2, email: 'user2@example.com' }];
      vi.mocked(userRepository.getAll).mockReturnValue(users);

      const result = getAllUsers();

      expect(result).toHaveLength(2);
      expect(result[0]).not.toHaveProperty('password');
      expect(result[1]).not.toHaveProperty('password');
      expect(result[0].email).toBe('test@example.com');
    });
  });

  describe('getUserById', () => {
    it('returns user without password when found', () => {
      vi.mocked(userRepository.getById).mockReturnValue(mockUser);

      const result = getUserById(1);

      expect(userRepository.getById).toHaveBeenCalledWith(1);
      expect(result).not.toHaveProperty('password');
      expect(result?.email).toBe('test@example.com');
    });

    it('returns null when user not found', () => {
      vi.mocked(userRepository.getById).mockReturnValue(null);

      const result = getUserById(999);

      expect(result).toBeNull();
    });
  });

  describe('updateUserRole', () => {
    it('updates user role and returns user without password', () => {
      const updatedUser = { ...mockUser, role: 'admin' as const };
      vi.mocked(userRepository.updateRole).mockReturnValue(updatedUser);

      const result = updateUserRole(1, 'admin');

      expect(userRepository.updateRole).toHaveBeenCalledWith(1, 'admin', expect.any(String));
      expect(result).not.toHaveProperty('password');
      expect(result?.role).toBe('admin');
    });

    it('returns null when user not found', () => {
      vi.mocked(userRepository.updateRole).mockReturnValue(null);

      const result = updateUserRole(999, 'admin');

      expect(result).toBeNull();
    });
  });

  describe('deleteUser', () => {
    it('throws error when trying to delete self', () => {
      expect(() => {
        deleteUser(1, 1);
      }).toThrow("Can't delete yourself.");
    });

    it('deletes user successfully', () => {
      vi.mocked(userRepository.delete).mockReturnValue(true);

      const result = deleteUser(2, 1);

      expect(userRepository.delete).toHaveBeenCalledWith(2);
      expect(result).toBe(true);
    });

    it('returns false when deletion fails', () => {
      vi.mocked(userRepository.delete).mockReturnValue(false);

      const result = deleteUser(2, 1);

      expect(result).toBe(false);
    });
  });
});
