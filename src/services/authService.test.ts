import { describe, it, expect, vi, beforeEach } from 'vitest';
import { login, logout, getCurrentUser, register, updateProfile, deleteAccount } from './authService';
import { userRepository } from './db/repositories';
import { STORAGE_KEYS, saveToStorage, getFromStorage, removeFromStorage } from './storage';

vi.mock('./db/repositories', () => ({
  userRepository: {
    findByEmail: vi.fn(),
    updateSignIn: vi.fn(),
    create: vi.fn(),
    getById: vi.fn(),
    emailExistsForOther: vi.fn(),
    updateEmail: vi.fn(),
    updatePassword: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('./storage', () => ({
  STORAGE_KEYS: {
    CURRENT_USER: 'rims_current_user',
    USERS: 'rims_users',
    ITEMS: 'rims_items',
    INITIALIZED: 'rims_initialized',
  },
  saveToStorage: vi.fn(),
  getFromStorage: vi.fn(),
  removeFromStorage: vi.fn(),
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

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('returns null when user not found', () => {
      vi.mocked(userRepository.findByEmail).mockReturnValue(null);

      const result = login({ email: 'notfound@example.com', password: 'password' });

      expect(result).toBeNull();
    });

    it('returns null when password is incorrect', () => {
      vi.mocked(userRepository.findByEmail).mockReturnValue(mockUser);

      const result = login({ email: 'test@example.com', password: 'wrongpassword' });

      expect(result).toBeNull();
    });

    it('logs in user successfully and updates sign-in tracking', () => {
      const updatedUser = { ...mockUser, signInCount: 1 };
      vi.mocked(userRepository.findByEmail).mockReturnValue(mockUser);
      vi.mocked(userRepository.updateSignIn).mockReturnValue(updatedUser);

      const result = login({ email: 'test@example.com', password: 'password123' });

      expect(userRepository.updateSignIn).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({
          signInCount: 1,
          lastSignInIp: '127.0.0.1',
        })
      );
      expect(saveToStorage).toHaveBeenCalledWith(
        STORAGE_KEYS.CURRENT_USER,
        expect.not.objectContaining({ password: expect.anything() })
      );
      expect(result).not.toHaveProperty('password');
      expect(result?.email).toBe('test@example.com');
    });
  });

  describe('logout', () => {
    it('removes current user from storage', () => {
      logout();

      expect(removeFromStorage).toHaveBeenCalledWith(STORAGE_KEYS.CURRENT_USER);
    });
  });

  describe('getCurrentUser', () => {
    it('returns user from storage', () => {
      const storedUser = { id: 1, email: 'test@example.com', role: 'user' };
      vi.mocked(getFromStorage).mockReturnValue(storedUser);

      const result = getCurrentUser();

      expect(getFromStorage).toHaveBeenCalledWith(STORAGE_KEYS.CURRENT_USER);
      expect(result).toEqual(storedUser);
    });

    it('returns null when no user in storage', () => {
      vi.mocked(getFromStorage).mockReturnValue(null);

      const result = getCurrentUser();

      expect(result).toBeNull();
    });
  });

  describe('register', () => {
    it('throws error when passwords do not match', () => {
      expect(() => {
        register({
          email: 'test@example.com',
          password: 'password123',
          passwordConfirmation: 'different',
        });
      }).toThrow('Password confirmation does not match');
    });

    it('throws error when password is too short', () => {
      expect(() => {
        register({
          email: 'test@example.com',
          password: 'short',
          passwordConfirmation: 'short',
        });
      }).toThrow('Password must be at least 8 characters');
    });

    it('throws error when email already exists', () => {
      vi.mocked(userRepository.findByEmail).mockReturnValue(mockUser);

      expect(() => {
        register({
          email: 'test@example.com',
          password: 'password123',
          passwordConfirmation: 'password123',
        });
      }).toThrow('Email has already been taken');
    });

    it('creates user and logs them in', () => {
      vi.mocked(userRepository.findByEmail).mockReturnValue(null);
      vi.mocked(userRepository.create).mockReturnValue(mockUser);

      const result = register({
        email: 'test@example.com',
        password: 'password123',
        passwordConfirmation: 'password123',
      });

      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
          password: 'password123',
          role: 'user',
        })
      );
      expect(result).not.toHaveProperty('password');
      expect(result?.email).toBe('test@example.com');
    });
  });

  describe('updateProfile', () => {
    it('throws error when user not found', () => {
      vi.mocked(userRepository.getById).mockReturnValue(null);

      expect(() => {
        updateProfile(999, { email: 'new@example.com' });
      }).toThrow('User not found');
    });

    it('throws error when current password is incorrect', () => {
      vi.mocked(userRepository.getById).mockReturnValue(mockUser);

      expect(() => {
        updateProfile(1, { currentPassword: 'wrongpassword', password: 'newpassword' });
      }).toThrow('Current password is incorrect');
    });

    it('throws error when email already taken by another user', () => {
      vi.mocked(userRepository.getById).mockReturnValue(mockUser);
      vi.mocked(userRepository.emailExistsForOther).mockReturnValue(true);

      expect(() => {
        updateProfile(1, { email: 'taken@example.com' });
      }).toThrow('Email has already been taken');
    });

    it('updates email successfully', () => {
      const updatedUser = { ...mockUser, email: 'new@example.com' };
      vi.mocked(userRepository.getById).mockReturnValue(mockUser);
      vi.mocked(userRepository.emailExistsForOther).mockReturnValue(false);
      vi.mocked(userRepository.updateEmail).mockReturnValue(updatedUser);

      const result = updateProfile(1, { email: 'new@example.com' });

      expect(userRepository.updateEmail).toHaveBeenCalled();
      expect(result?.email).toBe('new@example.com');
    });
  });

  describe('deleteAccount', () => {
    it('deletes user and removes from storage', () => {
      vi.mocked(userRepository.delete).mockReturnValue(true);

      const result = deleteAccount(1);

      expect(userRepository.delete).toHaveBeenCalledWith(1);
      expect(removeFromStorage).toHaveBeenCalledWith(STORAGE_KEYS.CURRENT_USER);
      expect(result).toBe(true);
    });

    it('returns false when deletion fails', () => {
      vi.mocked(userRepository.delete).mockReturnValue(false);

      const result = deleteAccount(1);

      expect(result).toBe(false);
      expect(removeFromStorage).not.toHaveBeenCalled();
    });
  });
});
