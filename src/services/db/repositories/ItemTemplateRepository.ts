import { ItemTemplate } from '../../../types/ItemTemplate';
import { BaseRepository } from '../BaseRepository';

export class ItemTemplateRepository extends BaseRepository<ItemTemplate> {
  protected tableName = 'item_templates';
  protected jsonFields = ['defaultFields'];

  /**
   * Find templates by category
   */
  findByCategory(category: string): ItemTemplate[] {
    return this.query(
      `SELECT * FROM ${this.tableName} WHERE category = ?`,
      [category]
    );
  }

  /**
   * Get all templates sorted by name
   */
  getAllSorted(): ItemTemplate[] {
    return this.query(`SELECT * FROM ${this.tableName} ORDER BY name ASC`);
  }
}

// Singleton instance
export const itemTemplateRepository = new ItemTemplateRepository();
