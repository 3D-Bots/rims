import { BOM, BOMItem } from '../../../types/BOM';
import { BaseRepository } from '../BaseRepository';

export class BOMRepository extends BaseRepository<BOM> {
  protected tableName = 'boms';
  protected jsonFields = ['items'];

  /**
   * Find BOMs that contain a specific item
   */
  findContainingItem(itemId: number): BOM[] {
    // Get all BOMs and filter those containing the item
    // We need to do this in memory because items is stored as JSON
    const allBOMs = this.getAll();
    return allBOMs.filter((bom) =>
      bom.items.some((item: BOMItem) => item.itemId === itemId)
    );
  }

  /**
   * Get all BOMs sorted by name
   */
  getAllSorted(): BOM[] {
    return this.query(`SELECT * FROM ${this.tableName} ORDER BY name ASC`);
  }
}

// Singleton instance
export const bomRepository = new BOMRepository();
