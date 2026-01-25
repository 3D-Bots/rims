import { StockHistoryEntry, StockHistoryFilter, StockChangeType } from '../types/StockHistory';
import { Item } from '../types/Item';
import { STORAGE_KEYS, getFromStorage, saveToStorage } from './storage';

function getHistory(): StockHistoryEntry[] {
  return getFromStorage<StockHistoryEntry[]>(STORAGE_KEYS.STOCK_HISTORY) || [];
}

function saveHistory(history: StockHistoryEntry[]): void {
  saveToStorage(STORAGE_KEYS.STOCK_HISTORY, history);
}

function getNextId(): number {
  const history = getHistory();
  return Math.max(0, ...history.map((h) => h.id)) + 1;
}

function getCurrentUser(): { id: number; email: string } | null {
  const user = getFromStorage<{ id: number; email: string }>(STORAGE_KEYS.CURRENT_USER);
  return user;
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
  const history = getHistory();
  const user = getCurrentUser();

  const entry: StockHistoryEntry = {
    id: getNextId(),
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
  };

  saveHistory([entry, ...history]);
  return entry;
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
  return getHistory();
}

export function getFilteredHistory(filter: StockHistoryFilter): StockHistoryEntry[] {
  let history = getHistory();

  if (filter.itemId !== undefined) {
    history = history.filter((h) => h.itemId === filter.itemId);
  }

  if (filter.changeType) {
    history = history.filter((h) => h.changeType === filter.changeType);
  }

  if (filter.startDate) {
    const start = new Date(filter.startDate);
    history = history.filter((h) => new Date(h.timestamp) >= start);
  }

  if (filter.endDate) {
    const end = new Date(filter.endDate);
    end.setHours(23, 59, 59, 999);
    history = history.filter((h) => new Date(h.timestamp) <= end);
  }

  if (filter.userId !== undefined) {
    history = history.filter((h) => h.userId === filter.userId);
  }

  return history;
}

export function getRecentHistory(limit: number = 10): StockHistoryEntry[] {
  return getHistory().slice(0, limit);
}

export function getHistoryByItem(itemId: number): StockHistoryEntry[] {
  return getHistory().filter((h) => h.itemId === itemId);
}

export function getHistoryStats(startDate?: string, endDate?: string) {
  const filter: StockHistoryFilter = { startDate, endDate };
  const history = getFilteredHistory(filter);

  const stats = {
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

  return stats;
}

export function clearHistory(): void {
  saveHistory([]);
}
