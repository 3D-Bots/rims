import { CostHistoryEntry, CostStats } from '../types/CostHistory';
import { getFromStorage, saveToStorage, STORAGE_KEYS } from './storage';

function getCostHistory(): CostHistoryEntry[] {
  return getFromStorage<CostHistoryEntry[]>(STORAGE_KEYS.COST_HISTORY) || [];
}

function saveCostHistory(history: CostHistoryEntry[]): void {
  saveToStorage(STORAGE_KEYS.COST_HISTORY, history);
}

export function recordCostChange(
  itemId: number,
  oldValue: number,
  newValue: number,
  source: CostHistoryEntry['source'] = 'manual'
): CostHistoryEntry | null {
  // Don't record if values are the same
  if (oldValue === newValue) {
    return null;
  }

  const history = getCostHistory();
  const newEntry: CostHistoryEntry = {
    id: Math.max(0, ...history.map((h) => h.id)) + 1,
    itemId,
    oldValue,
    newValue,
    source,
    timestamp: new Date().toISOString(),
  };

  saveCostHistory([...history, newEntry]);
  return newEntry;
}

export function getCostHistoryForItem(itemId: number): CostHistoryEntry[] {
  const history = getCostHistory();
  return history
    .filter((h) => h.itemId === itemId)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

export function getCostStats(itemId: number, currentValue: number): CostStats {
  const history = getCostHistoryForItem(itemId);

  if (history.length === 0) {
    return {
      min: currentValue,
      max: currentValue,
      avg: currentValue,
      current: currentValue,
      changeCount: 0,
      trend: 'stable',
      firstRecorded: null,
      lastChanged: null,
    };
  }

  // Get all unique values (including current)
  const allValues = [...history.map((h) => h.newValue), currentValue];
  const uniqueValues = [...new Set(allValues)];

  const min = Math.min(...allValues);
  const max = Math.max(...allValues);
  const avg = allValues.reduce((sum, v) => sum + v, 0) / allValues.length;

  // Determine trend based on last few changes
  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (history.length >= 2) {
    const recent = history.slice(-3);
    const priceChanges = recent.map((h) => h.newValue - h.oldValue);
    const avgChange = priceChanges.reduce((sum, c) => sum + c, 0) / priceChanges.length;
    if (avgChange > 0.01) trend = 'up';
    else if (avgChange < -0.01) trend = 'down';
  }

  return {
    min,
    max,
    avg: Math.round(avg * 100) / 100,
    current: currentValue,
    changeCount: history.length,
    trend,
    firstRecorded: history[0]?.timestamp || null,
    lastChanged: history[history.length - 1]?.timestamp || null,
  };
}

export function deleteCostHistoryForItem(itemId: number): number {
  const history = getCostHistory();
  const filtered = history.filter((h) => h.itemId !== itemId);
  const deletedCount = history.length - filtered.length;
  saveCostHistory(filtered);
  return deletedCount;
}

export function getAllCostHistory(): CostHistoryEntry[] {
  return getCostHistory();
}
