import { User } from '../../../types/User';
import { BaseRepository } from '../BaseRepository';
import { execQuery, execStatement } from '../db';
import { mapRowToEntity } from '../mapper';

export class UserRepository extends BaseRepository<User> {
  protected tableName = 'users';

  /**
   * Find a user by email (case-insensitive)
   */
  findByEmail(email: string): User | null {
    const rows = execQuery<Record<string, unknown>>(
      `SELECT * FROM ${this.tableName} WHERE LOWER(email) = LOWER(?)`,
      [email]
    );
    if (rows.length === 0) {
      return null;
    }
    return mapRowToEntity<User>(rows[0]);
  }

  /**
   * Update sign-in tracking fields
   */
  updateSignIn(id: number, signInData: {
    signInCount: number;
    lastSignInAt: string;
    lastSignInIp: string;
    updatedAt: string;
  }): User | null {
    execStatement(
      `UPDATE ${this.tableName} SET
        sign_in_count = ?,
        last_sign_in_at = ?,
        last_sign_in_ip = ?,
        updated_at = ?
      WHERE id = ?`,
      [
        signInData.signInCount,
        signInData.lastSignInAt,
        signInData.lastSignInIp,
        signInData.updatedAt,
        id,
      ]
    );
    return this.getById(id);
  }

  /**
   * Update user role
   */
  updateRole(id: number, role: string, updatedAt: string): User | null {
    execStatement(
      `UPDATE ${this.tableName} SET role = ?, updated_at = ? WHERE id = ?`,
      [role, updatedAt, id]
    );
    return this.getById(id);
  }

  /**
   * Update user email
   */
  updateEmail(id: number, email: string, updatedAt: string): User | null {
    execStatement(
      `UPDATE ${this.tableName} SET email = ?, updated_at = ? WHERE id = ?`,
      [email, updatedAt, id]
    );
    return this.getById(id);
  }

  /**
   * Update user password
   */
  updatePassword(id: number, password: string, updatedAt: string): User | null {
    execStatement(
      `UPDATE ${this.tableName} SET password = ?, updated_at = ? WHERE id = ?`,
      [password, updatedAt, id]
    );
    return this.getById(id);
  }

  /**
   * Check if email exists for a different user
   */
  emailExistsForOther(email: string, excludeId: number): boolean {
    const rows = execQuery<Record<string, unknown>>(
      `SELECT id FROM ${this.tableName} WHERE LOWER(email) = LOWER(?) AND id != ?`,
      [email, excludeId]
    );
    return rows.length > 0;
  }
}

// Singleton instance
export const userRepository = new UserRepository();
