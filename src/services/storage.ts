const STORAGE_KEYS = {
  USERS: 'rims_users',
  ITEMS: 'rims_items',
  CURRENT_USER: 'rims_current_user',
  INITIALIZED: 'rims_initialized',
} as const;

export function getFromStorage<T>(key: string): T | null {
  const data = localStorage.getItem(key);
  if (!data) return null;
  try {
    return JSON.parse(data) as T;
  } catch {
    return null;
  }
}

export function saveToStorage<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

export function removeFromStorage(key: string): void {
  localStorage.removeItem(key);
}

export function isInitialized(): boolean {
  return getFromStorage<boolean>(STORAGE_KEYS.INITIALIZED) === true;
}

export function setInitialized(): void {
  saveToStorage(STORAGE_KEYS.INITIALIZED, true);
}

export { STORAGE_KEYS };
