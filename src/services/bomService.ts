import { BOM, BOMFormData, BOMCostBreakdown } from '../types/BOM';
import { getFromStorage, saveToStorage, STORAGE_KEYS } from './storage';
import * as itemService from './itemService';

function getBOMs(): BOM[] {
  return getFromStorage<BOM[]>(STORAGE_KEYS.BOMS) || [];
}

function saveBOMs(boms: BOM[]): void {
  saveToStorage(STORAGE_KEYS.BOMS, boms);
}

export function getAllBOMs(): BOM[] {
  return getBOMs();
}

export function getBOMById(id: number): BOM | null {
  const boms = getBOMs();
  return boms.find((b) => b.id === id) || null;
}

export function createBOM(data: BOMFormData): BOM {
  const boms = getBOMs();
  const newBOM: BOM = {
    ...data,
    id: Math.max(0, ...boms.map((b) => b.id)) + 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  saveBOMs([...boms, newBOM]);
  return newBOM;
}

export function updateBOM(id: number, data: Partial<BOMFormData>): BOM | null {
  const boms = getBOMs();
  const index = boms.findIndex((b) => b.id === id);

  if (index === -1) {
    return null;
  }

  const updatedBOM: BOM = {
    ...boms[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };

  const updatedBOMs = [...boms];
  updatedBOMs[index] = updatedBOM;
  saveBOMs(updatedBOMs);

  return updatedBOM;
}

export function deleteBOM(id: number): boolean {
  const boms = getBOMs();
  const updatedBOMs = boms.filter((b) => b.id !== id);

  if (updatedBOMs.length === boms.length) {
    return false;
  }

  saveBOMs(updatedBOMs);
  return true;
}

export function calculateBOMCost(bomId: number): BOMCostBreakdown | null {
  const bom = getBOMById(bomId);
  if (!bom) {
    return null;
  }

  const itemCosts: BOMCostBreakdown['itemCosts'] = [];
  let totalCost = 0;
  let minCanBuild = Infinity;

  for (const bomItem of bom.items) {
    const item = itemService.getItemById(bomItem.itemId);
    if (!item) {
      continue;
    }

    const lineCost = item.unitValue * bomItem.quantity;
    const canBuildWithItem = Math.floor(item.quantity / bomItem.quantity);

    itemCosts.push({
      itemId: item.id,
      itemName: item.name,
      unitCost: item.unitValue,
      quantity: bomItem.quantity,
      lineCost,
      available: item.quantity,
      canBuild: item.quantity >= bomItem.quantity,
    });

    totalCost += lineCost;
    minCanBuild = Math.min(minCanBuild, canBuildWithItem);
  }

  return {
    bomId,
    totalCost: Math.round(totalCost * 100) / 100,
    itemCosts,
    canBuildQuantity: minCanBuild === Infinity ? 0 : minCanBuild,
  };
}

export function checkAvailability(bomId: number): { canBuild: boolean; missingItems: string[] } {
  const breakdown = calculateBOMCost(bomId);
  if (!breakdown) {
    return { canBuild: false, missingItems: [] };
  }

  const missingItems = breakdown.itemCosts
    .filter((ic) => !ic.canBuild)
    .map((ic) => `${ic.itemName} (need ${ic.quantity}, have ${ic.available})`);

  return {
    canBuild: missingItems.length === 0,
    missingItems,
  };
}

export function getBOMsContainingItem(itemId: number): BOM[] {
  const boms = getBOMs();
  return boms.filter((bom) => bom.items.some((bi) => bi.itemId === itemId));
}

export function duplicateBOM(id: number, newName: string): BOM | null {
  const bom = getBOMById(id);
  if (!bom) {
    return null;
  }

  return createBOM({
    name: newName,
    description: bom.description,
    items: [...bom.items],
  });
}
