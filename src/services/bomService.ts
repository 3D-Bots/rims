import { BOM, BOMFormData, BOMCostBreakdown } from '../types/BOM';
import { bomRepository } from './db/repositories';
import * as itemService from './itemService';

export function getAllBOMs(): BOM[] {
  return bomRepository.getAll();
}

export function getBOMById(id: number): BOM | null {
  return bomRepository.getById(id);
}

export function createBOM(data: BOMFormData): BOM {
  return bomRepository.create({
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

export function updateBOM(id: number, data: Partial<BOMFormData>): BOM | null {
  const existing = bomRepository.getById(id);
  if (!existing) {
    return null;
  }

  return bomRepository.update(id, {
    ...data,
    updatedAt: new Date().toISOString(),
  } as Partial<BOM>);
}

export function deleteBOM(id: number): boolean {
  return bomRepository.delete(id);
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
  return bomRepository.findContainingItem(itemId);
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
