import { execQuery, execStatement, getNextId, persistDatabase, getDatabase } from './db';
import { mapRowToEntity, mapRowsToEntities, buildInsertSQL, buildUpdateSQL } from './mapper';

/**
 * Base repository class providing generic CRUD operations
 */
export abstract class BaseRepository<T extends { id: number }> {
  protected abstract tableName: string;
  protected jsonFields: string[] = [];

  /**
   * Get all records from the table
   */
  getAll(): T[] {
    const rows = execQuery<Record<string, unknown>>(`SELECT * FROM ${this.tableName}`);
    return mapRowsToEntities<T>(rows, this.jsonFields);
  }

  /**
   * Get a record by ID
   */
  getById(id: number): T | null {
    const rows = execQuery<Record<string, unknown>>(
      `SELECT * FROM ${this.tableName} WHERE id = ?`,
      [id]
    );
    if (rows.length === 0) {
      return null;
    }
    return mapRowToEntity<T>(rows[0], this.jsonFields);
  }

  /**
   * Create a new record
   */
  create(data: Omit<T, 'id'>): T {
    const id = getNextId(this.tableName);
    const fullData = { ...data, id } as unknown as Record<string, unknown>;
    const { sql, params } = buildInsertSQL(this.tableName, fullData, this.jsonFields);
    execStatement(sql, params);
    return this.getById(id)!;
  }

  /**
   * Update an existing record
   */
  update(id: number, data: Partial<T>): T | null {
    const existing = this.getById(id);
    if (!existing) {
      return null;
    }

    // Remove id from update data
    const { id: _id, ...updateData } = data as Record<string, unknown>;

    if (Object.keys(updateData).length === 0) {
      return existing;
    }

    const { sql, params } = buildUpdateSQL(
      this.tableName,
      updateData,
      'id = ?',
      [id],
      this.jsonFields
    );
    execStatement(sql, params);
    return this.getById(id);
  }

  /**
   * Delete a record by ID
   */
  delete(id: number): boolean {
    const changes = execStatement(
      `DELETE FROM ${this.tableName} WHERE id = ?`,
      [id]
    );
    return changes > 0;
  }

  /**
   * Delete multiple records by IDs
   */
  deleteMany(ids: number[]): number {
    if (ids.length === 0) {
      return 0;
    }
    const placeholders = ids.map(() => '?').join(', ');
    const changes = execStatement(
      `DELETE FROM ${this.tableName} WHERE id IN (${placeholders})`,
      ids
    );
    return changes;
  }

  /**
   * Count all records
   */
  count(): number {
    const database = getDatabase();
    if (!database) {
      return 0;
    }

    const result = database.exec(`SELECT COUNT(*) as count FROM ${this.tableName}`);
    if (result.length > 0 && result[0].values.length > 0) {
      return result[0].values[0][0] as number;
    }
    return 0;
  }

  /**
   * Execute a raw query and return mapped entities
   */
  protected query(sql: string, params: unknown[] = []): T[] {
    const rows = execQuery<Record<string, unknown>>(sql, params);
    return mapRowsToEntities<T>(rows, this.jsonFields);
  }

  /**
   * Execute a raw query and return a single mapped entity
   */
  protected queryOne(sql: string, params: unknown[] = []): T | null {
    const results = this.query(sql, params);
    return results.length > 0 ? results[0] : null;
  }
}
