import { CostHistoryEntry } from '../../../types/CostHistory';
import { BaseRepository } from '../BaseRepository';
import { execStatement } from '../db';

export class CostHistoryRepository extends BaseRepository<CostHistoryEntry> {
  protected tableName = 'cost_history';

  /**
   * Find cost history entries by item ID, sorted by timestamp ascending
   */
  findByItemId(itemId: number): CostHistoryEntry[] {
    return this.query(
      `SELECT * FROM ${this.tableName} WHERE item_id = ? ORDER BY timestamp ASC`,
      [itemId]
    );
  }

  /**
   * Delete all cost history entries for an item
   */
  deleteByItemId(itemId: number): number {
    return execStatement(
      `DELETE FROM ${this.tableName} WHERE item_id = ?`,
      [itemId]
    );
  }

  /**
   * Get the most recent cost history entry for an item
   */
  getLatestForItem(itemId: number): CostHistoryEntry | null {
    return this.queryOne(
      `SELECT * FROM ${this.tableName} WHERE item_id = ? ORDER BY timestamp DESC LIMIT 1`,
      [itemId]
    );
  }

  /**
   * Get all cost history entries sorted by timestamp
   */
  override getAll(): CostHistoryEntry[] {
    return this.query(`SELECT * FROM ${this.tableName} ORDER BY timestamp ASC`);
  }
}

// Singleton instance
export const costHistoryRepository = new CostHistoryRepository();
