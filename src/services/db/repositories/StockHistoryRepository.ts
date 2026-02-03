import { StockHistoryEntry, StockHistoryFilter } from '../../../types/StockHistory';
import { BaseRepository } from '../BaseRepository';
import { execQuery } from '../db';
import { mapRowsToEntities } from '../mapper';

export class StockHistoryRepository extends BaseRepository<StockHistoryEntry> {
  protected tableName = 'stock_history';

  /**
   * Get all history entries, sorted by timestamp descending (newest first)
   */
  override getAll(): StockHistoryEntry[] {
    return this.query(`SELECT * FROM ${this.tableName} ORDER BY timestamp DESC`);
  }

  /**
   * Find history entries by item ID
   */
  findByItemId(itemId: number): StockHistoryEntry[] {
    return this.query(
      `SELECT * FROM ${this.tableName} WHERE item_id = ? ORDER BY timestamp DESC`,
      [itemId]
    );
  }

  /**
   * Find history entries with filters
   */
  findFiltered(filter: StockHistoryFilter): StockHistoryEntry[] {
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (filter.itemId !== undefined) {
      conditions.push('item_id = ?');
      params.push(filter.itemId);
    }

    if (filter.changeType) {
      conditions.push('change_type = ?');
      params.push(filter.changeType);
    }

    if (filter.startDate) {
      conditions.push('timestamp >= ?');
      params.push(filter.startDate);
    }

    if (filter.endDate) {
      // Include entire end date
      const endDate = new Date(filter.endDate);
      endDate.setHours(23, 59, 59, 999);
      conditions.push('timestamp <= ?');
      params.push(endDate.toISOString());
    }

    if (filter.userId !== undefined) {
      conditions.push('user_id = ?');
      params.push(filter.userId);
    }

    let sql = `SELECT * FROM ${this.tableName}`;
    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }
    sql += ' ORDER BY timestamp DESC';

    return this.query(sql, params);
  }

  /**
   * Get recent history entries
   */
  findRecent(limit: number = 10): StockHistoryEntry[] {
    return this.query(
      `SELECT * FROM ${this.tableName} ORDER BY timestamp DESC LIMIT ?`,
      [limit]
    );
  }

  /**
   * Clear all history
   */
  clearAll(): void {
    execQuery(`DELETE FROM ${this.tableName}`);
  }

  /**
   * Get history statistics
   */
  getStats(startDate?: string, endDate?: string): {
    totalChanges: number;
    created: number;
    updated: number;
    deleted: number;
    categoryChanged: number;
    netQuantityChange: number;
  } {
    const history = this.findFiltered({ startDate, endDate });

    return {
      totalChanges: history.length,
      created: history.filter((h) => h.changeType === 'created').length,
      updated: history.filter((h) => h.changeType === 'updated').length,
      deleted: history.filter((h) => h.changeType === 'deleted').length,
      categoryChanged: history.filter((h) => h.changeType === 'category_changed').length,
      netQuantityChange: history.reduce((sum, h) => {
        if (h.changeType === 'created') return sum + (h.newQuantity ?? 0);
        if (h.changeType === 'deleted') return sum - (h.previousQuantity ?? 0);
        if (h.changeType === 'updated') return sum + ((h.newQuantity ?? 0) - (h.previousQuantity ?? 0));
        return sum;
      }, 0),
    };
  }
}

// Singleton instance
export const stockHistoryRepository = new StockHistoryRepository();
