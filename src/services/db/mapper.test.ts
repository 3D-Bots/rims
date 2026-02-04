import { describe, it, expect } from 'vitest';
import {
  toSnakeCase,
  toCamelCase,
  mapRowToEntity,
  mapEntityToRow,
  buildInsertSQL,
  buildUpdateSQL,
} from './mapper';

describe('mapper utilities', () => {
  describe('toSnakeCase', () => {
    it('converts camelCase to snake_case', () => {
      expect(toSnakeCase('userId')).toBe('user_id');
      expect(toSnakeCase('createdAt')).toBe('created_at');
      expect(toSnakeCase('emailVerificationToken')).toBe('email_verification_token');
    });

    it('handles already lowercase strings', () => {
      expect(toSnakeCase('email')).toBe('email');
      expect(toSnakeCase('id')).toBe('id');
    });

    it('handles multiple uppercase letters', () => {
      expect(toSnakeCase('userIDNumber')).toBe('user_i_d_number');
    });
  });

  describe('toCamelCase', () => {
    it('converts snake_case to camelCase', () => {
      expect(toCamelCase('user_id')).toBe('userId');
      expect(toCamelCase('created_at')).toBe('createdAt');
      expect(toCamelCase('email_verification_token')).toBe('emailVerificationToken');
    });

    it('handles strings without underscores', () => {
      expect(toCamelCase('email')).toBe('email');
      expect(toCamelCase('id')).toBe('id');
    });
  });

  describe('mapRowToEntity', () => {
    it('converts database row to entity with camelCase keys', () => {
      const row = {
        id: 1,
        user_name: 'John',
        created_at: '2024-01-01',
      };

      const entity = mapRowToEntity<{ id: number; userName: string; createdAt: string }>(row);

      expect(entity).toEqual({
        id: 1,
        userName: 'John',
        createdAt: '2024-01-01',
      });
    });

    it('parses JSON fields when specified', () => {
      const row = {
        id: 1,
        settings: '{"theme":"dark"}',
      };

      const entity = mapRowToEntity<{ id: number; settings: object }>(row, ['settings']);

      expect(entity.settings).toEqual({ theme: 'dark' });
    });

    it('handles invalid JSON gracefully', () => {
      const row = {
        id: 1,
        settings: 'not-json',
      };

      const entity = mapRowToEntity<{ id: number; settings: string }>(row, ['settings']);

      expect(entity.settings).toBe('not-json');
    });
  });

  describe('mapEntityToRow', () => {
    it('converts entity to database row with snake_case keys', () => {
      const entity = {
        id: 1,
        userName: 'John',
        createdAt: '2024-01-01',
      };

      const row = mapEntityToRow(entity);

      expect(row).toEqual({
        id: 1,
        user_name: 'John',
        created_at: '2024-01-01',
      });
    });

    it('stringifies JSON fields when specified', () => {
      const entity = {
        id: 1,
        settings: { theme: 'dark' },
      };

      const row = mapEntityToRow(entity, ['settings']);

      expect(row.settings).toBe('{"theme":"dark"}');
    });
  });

  describe('buildInsertSQL', () => {
    it('builds correct INSERT statement', () => {
      const data = { id: 1, userName: 'John', email: 'john@example.com' };
      const { sql, params } = buildInsertSQL('users', data);

      expect(sql).toBe('INSERT INTO users (id, user_name, email) VALUES (?, ?, ?)');
      expect(params).toEqual([1, 'John', 'john@example.com']);
    });
  });

  describe('buildUpdateSQL', () => {
    it('builds correct UPDATE statement', () => {
      const data = { userName: 'Jane', email: 'jane@example.com' };
      const { sql, params } = buildUpdateSQL('users', data, 'id = ?', [1]);

      expect(sql).toBe('UPDATE users SET user_name = ?, email = ? WHERE id = ?');
      expect(params).toEqual(['Jane', 'jane@example.com', 1]);
    });
  });
});
