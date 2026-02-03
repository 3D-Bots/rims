import { StockHistoryEntry, StockHistoryFilter, StockChangeType } from '../types/StockHistory';
import { Item } from '../types/Item';
import { STORAGE_KEYS, getFromStorage } from './storage';
import { stockHistoryRepository } from './db/repositories';

function getCurrentUser(): { id: number; email: string } | null {
  const user = getFromStorage<{ id: number; email: string }>(STORAGE_KEYS.CURRENT_USER);
  return user;
}

function getDefaultNotes(
  changeType: StockChangeType,
  options: {
    previousQuantity?: number | null;
    newQuantity?: number | null;
    previousCategory?: string | null;
    newCategory?: string | null;
  }
): string {
  switch (changeType) {
    case 'created':
      return `Item created with quantity ${options.newQuantity ?? 0}`;
    case 'deleted':
      return `Item deleted`;
    case 'updated':
      if (options.previousQuantity !== options.newQuantity) {
        const diff = (options.newQuantity ?? 0) - (options.previousQuantity ?? 0);
        return diff > 0 ? `Stock increased by ${diff}` : `Stock decreased by ${Math.abs(diff)}`;
      }
      return 'Item updated';
    case 'adjusted':
      const diff = (options.newQuantity ?? 0) - (options.previousQuantity ?? 0);
      return diff > 0 ? `Stock adjusted +${diff}` : `Stock adjusted ${diff}`;
    case 'category_changed':
      return `Category changed from "${options.previousCategory}" to "${options.newCategory}"`;
    default:
      return '';
  }
}

export function recordStockChange(
  changeType: StockChangeType,
  itemId: number,
  itemName: string,
  options: {
    previousQuantity?: number | null;
    newQuantity?: number | null;
    previousValue?: number | null;
    newValue?: number | null;
    previousCategory?: string | null;
    newCategory?: string | null;
    notes?: string;
  } = {}
): StockHistoryEntry {
  const user = getCurrentUser();

  const entry = stockHistoryRepository.create({
    itemId,
    itemName,
    changeType,
    previousQuantity: options.previousQuantity ?? null,
    newQuantity: options.newQuantity ?? null,
    previousValue: options.previousValue ?? null,
    newValue: options.newValue ?? null,
    previousCategory: options.previousCategory ?? null,
    newCategory: options.newCategory ?? null,
    notes: options.notes || getDefaultNotes(changeType, options),
    userId: user?.id ?? null,
    userEmail: user?.email ?? null,
    timestamp: new Date().toISOString(),
  });

  return entry;
}

export function recordItemCreated(item: Item): void {
  recordStockChange('created', item.id, item.name, {
    newQuantity: item.quantity,
    newValue: item.value,
    newCategory: item.category,
  });
}

export function recordItemUpdated(oldItem: Item, newItem: Item): void {
  // Check if quantity changed
  if (oldItem.quantity !== newItem.quantity) {
    recordStockChange('updated', newItem.id, newItem.name, {
      previousQuantity: oldItem.quantity,
      newQuantity: newItem.quantity,
      previousValue: oldItem.value,
      newValue: newItem.value,
    });
  }

  // Check if category changed
  if (oldItem.category !== newItem.category) {
    recordStockChange('category_changed', newItem.id, newItem.name, {
      previousCategory: oldItem.category,
      newCategory: newItem.category,
    });
  }
}

export function recordItemDeleted(item: Item): void {
  recordStockChange('deleted', item.id, item.name, {
    previousQuantity: item.quantity,
    previousValue: item.value,
    previousCategory: item.category,
  });
}

export function recordBulkCategoryChange(
  items: Item[],
  oldCategories: Map<number, string>,
  newCategory: string
): void {
  items.forEach((item) => {
    const oldCategory = oldCategories.get(item.id);
    if (oldCategory && oldCategory !== newCategory) {
      recordStockChange('category_changed', item.id, item.name, {
        previousCategory: oldCategory,
        newCategory: newCategory,
      });
    }
  });
}

export function getAllHistory(): StockHistoryEntry[] {
  return stockHistoryRepository.getAll();
}

export function getFilteredHistory(filter: StockHistoryFilter): StockHistoryEntry[] {
  return stockHistoryRepository.findFiltered(filter);
}

export function getRecentHistory(limit: number = 10): StockHistoryEntry[] {
  return stockHistoryRepository.findRecent(limit);
}

export function getHistoryByItem(itemId: number): StockHistoryEntry[] {
  return stockHistoryRepository.findByItemId(itemId);
}

export function getHistoryStats(startDate?: string, endDate?: string) {
  return stockHistoryRepository.getStats(startDate, endDate);
}

export function clearHistory(): void {
  stockHistoryRepository.clearAll();
}
