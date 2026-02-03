import { Item, ItemFormData } from '../types/Item';
import { itemRepository } from './db/repositories';
import * as stockHistoryService from './stockHistoryService';
import * as costHistoryService from './costHistoryService';

export function getAllItems(): Item[] {
  return itemRepository.getAll();
}

export function getItemById(id: number): Item | null {
  return itemRepository.getById(id);
}

export function createItem(data: ItemFormData): Item {
  const newItem = itemRepository.createWithValue({
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  stockHistoryService.recordItemCreated(newItem);
  return newItem;
}

export function updateItem(id: number, data: Partial<ItemFormData>, costSource?: 'manual' | 'vendor_lookup' | 'import'): Item | null {
  const existingItem = itemRepository.getById(id);
  if (!existingItem) {
    return null;
  }

  const updatedItem = itemRepository.updateWithValue(
    id,
    data,
    new Date().toISOString()
  );

  if (!updatedItem) {
    return null;
  }

  stockHistoryService.recordItemUpdated(existingItem, updatedItem);

  // Record cost change if unitValue changed
  const newUnitValue = data.unitValue ?? existingItem.unitValue;
  if (existingItem.unitValue !== newUnitValue) {
    costHistoryService.recordCostChange(id, existingItem.unitValue, newUnitValue, costSource || 'manual');
  }

  return updatedItem;
}

export function deleteItem(id: number): boolean {
  const itemToDelete = itemRepository.getById(id);
  if (!itemToDelete) {
    return false;
  }

  const result = itemRepository.delete(id);
  if (result) {
    stockHistoryService.recordItemDeleted(itemToDelete);
  }
  return result;
}

export function getTotalQuantity(): number {
  return itemRepository.getTotalQuantity();
}

export function getTotalValue(): number {
  return itemRepository.getTotalValue();
}

export function deleteItems(ids: number[]): number {
  const itemsToDelete = ids
    .map((id) => itemRepository.getById(id))
    .filter((item): item is Item => item !== null);

  const deletedCount = itemRepository.deleteMany(ids);

  itemsToDelete.forEach((item) => {
    stockHistoryService.recordItemDeleted(item);
  });

  return deletedCount;
}

export function updateItemsCategory(ids: number[], category: string): number {
  const oldCategories = new Map<number, string>();

  // Get existing categories before update
  ids.forEach((id) => {
    const item = itemRepository.getById(id);
    if (item) {
      oldCategories.set(id, item.category);
    }
  });

  const updatedCount = itemRepository.updateCategoryBulk(ids, category, new Date().toISOString());

  // Get updated items for history
  const affectedItems = ids
    .map((id) => itemRepository.getById(id))
    .filter((item): item is Item => item !== null);

  stockHistoryService.recordBulkCategoryChange(affectedItems, oldCategories, category);

  return updatedCount;
}

export function getLowStockItems(threshold: number): Item[] {
  return itemRepository.getLowStock(threshold);
}

export function getItemsNeedingReorder(): Item[] {
  return itemRepository.getItemsNeedingReorder();
}
