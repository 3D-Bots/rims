import { CostHistoryEntry, CostStats } from '../types/CostHistory';
import { costHistoryRepository } from './db/repositories';

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

  const newEntry = costHistoryRepository.create({
    itemId,
    oldValue,
    newValue,
    source,
    timestamp: new Date().toISOString(),
  });

  return newEntry;
}

export function getCostHistoryForItem(itemId: number): CostHistoryEntry[] {
  return costHistoryRepository.findByItemId(itemId);
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
  return costHistoryRepository.deleteByItemId(itemId);
}

export function getAllCostHistory(): CostHistoryEntry[] {
  return costHistoryRepository.getAll();
}
