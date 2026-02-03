import { VendorPriceResult } from '../../../types/Vendor';
import { execQuery, execStatement, getNextId, persistDatabase } from '../db';
import { mapRowToEntity, mapRowsToEntities } from '../mapper';

// Internal type for database representation
interface VendorPriceCacheEntry extends VendorPriceResult {
  id: number;
  cacheKey: string;
}

export class VendorPriceCacheRepository {
  private tableName = 'vendor_price_cache';

  /**
   * Get all cached entries
   */
  getAll(): Map<string, VendorPriceResult> {
    const rows = execQuery<Record<string, unknown>>(`SELECT * FROM ${this.tableName}`);
    const entries = mapRowsToEntities<VendorPriceCacheEntry>(rows);
    const cache = new Map<string, VendorPriceResult>();

    for (const entry of entries) {
      const { id: _id, cacheKey, ...priceResult } = entry;
      // Convert inStock from number to boolean
      cache.set(cacheKey, {
        ...priceResult,
        inStock: Boolean(priceResult.inStock),
      });
    }

    return cache;
  }

  /**
   * Find a cached price by cache key
   */
  findByCacheKey(cacheKey: string): VendorPriceResult | null {
    const rows = execQuery<Record<string, unknown>>(
      `SELECT * FROM ${this.tableName} WHERE cache_key = ?`,
      [cacheKey]
    );
    if (rows.length === 0) {
      return null;
    }
    const entry = mapRowToEntity<VendorPriceCacheEntry>(rows[0]);
    const { id: _id, cacheKey: _key, ...priceResult } = entry;
    return {
      ...priceResult,
      inStock: Boolean(priceResult.inStock),
    };
  }

  /**
   * Upsert a price cache entry
   */
  upsert(cacheKey: string, data: VendorPriceResult): void {
    const existing = this.findByCacheKey(cacheKey);

    if (existing) {
      execStatement(
        `UPDATE ${this.tableName} SET
          vendor = ?,
          part_number = ?,
          price = ?,
          in_stock = ?,
          stock_quantity = ?,
          vendor_url = ?,
          last_checked = ?
        WHERE cache_key = ?`,
        [
          data.vendor,
          data.partNumber,
          data.price,
          data.inStock ? 1 : 0,
          data.stockQuantity ?? null,
          data.vendorUrl ?? null,
          data.lastChecked,
          cacheKey,
        ]
      );
    } else {
      const id = getNextId(this.tableName);
      execStatement(
        `INSERT INTO ${this.tableName}
          (id, cache_key, vendor, part_number, price, in_stock, stock_quantity, vendor_url, last_checked)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          cacheKey,
          data.vendor,
          data.partNumber,
          data.price,
          data.inStock ? 1 : 0,
          data.stockQuantity ?? null,
          data.vendorUrl ?? null,
          data.lastChecked,
        ]
      );
    }
  }

  /**
   * Delete expired cache entries
   */
  deleteExpired(maxAgeMs: number): number {
    const cutoff = new Date(Date.now() - maxAgeMs).toISOString();
    return execStatement(
      `DELETE FROM ${this.tableName} WHERE last_checked < ?`,
      [cutoff]
    );
  }

  /**
   * Clear all cache entries
   */
  clearAll(): void {
    execStatement(`DELETE FROM ${this.tableName}`);
  }
}

// Singleton instance
export const vendorPriceCacheRepository = new VendorPriceCacheRepository();
