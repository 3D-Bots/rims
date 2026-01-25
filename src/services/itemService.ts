import { Item, ItemFormData } from '../types/Item';
import { STORAGE_KEYS, getFromStorage, saveToStorage } from './storage';

function getItems(): Item[] {
  return getFromStorage<Item[]>(STORAGE_KEYS.ITEMS) || [];
}

function saveItems(items: Item[]): void {
  saveToStorage(STORAGE_KEYS.ITEMS, items);
}

export function getAllItems(): Item[] {
  return getItems();
}

export function getItemById(id: number): Item | null {
  const items = getItems();
  return items.find((item) => item.id === id) || null;
}

export function createItem(data: ItemFormData): Item {
  const items = getItems();
  const newItem: Item = {
    ...data,
    id: Math.max(0, ...items.map((i) => i.id)) + 1,
    value: data.quantity * data.unitValue,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  saveItems([...items, newItem]);
  return newItem;
}

export function updateItem(id: number, data: Partial<ItemFormData>): Item | null {
  const items = getItems();
  const itemIndex = items.findIndex((item) => item.id === id);

  if (itemIndex === -1) {
    return null;
  }

  const existingItem = items[itemIndex];
  const quantity = data.quantity ?? existingItem.quantity;
  const unitValue = data.unitValue ?? existingItem.unitValue;

  const updatedItem: Item = {
    ...existingItem,
    ...data,
    value: quantity * unitValue,
    updatedAt: new Date().toISOString(),
  };

  const updatedItems = [...items];
  updatedItems[itemIndex] = updatedItem;
  saveItems(updatedItems);

  return updatedItem;
}

export function deleteItem(id: number): boolean {
  const items = getItems();
  const updatedItems = items.filter((item) => item.id !== id);

  if (updatedItems.length === items.length) {
    return false;
  }

  saveItems(updatedItems);
  return true;
}

export function getTotalQuantity(): number {
  const items = getItems();
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function getTotalValue(): number {
  const items = getItems();
  return items.reduce((sum, item) => sum + item.value, 0);
}
