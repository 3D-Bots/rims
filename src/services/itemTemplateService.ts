import { ItemTemplate, ItemTemplateFormData } from '../types/ItemTemplate';
import { getFromStorage, saveToStorage, STORAGE_KEYS } from './storage';

function getTemplates(): ItemTemplate[] {
  return getFromStorage<ItemTemplate[]>(STORAGE_KEYS.ITEM_TEMPLATES) || [];
}

function saveTemplates(templates: ItemTemplate[]): void {
  saveToStorage(STORAGE_KEYS.ITEM_TEMPLATES, templates);
}

export function getAllTemplates(): ItemTemplate[] {
  return getTemplates();
}

export function getTemplateById(id: number): ItemTemplate | null {
  const templates = getTemplates();
  return templates.find((t) => t.id === id) || null;
}

export function getTemplatesForCategory(category: string): ItemTemplate[] {
  const templates = getTemplates();
  return templates.filter((t) => t.category === category);
}

export function createTemplate(data: ItemTemplateFormData): ItemTemplate {
  const templates = getTemplates();
  const newTemplate: ItemTemplate = {
    ...data,
    id: Math.max(0, ...templates.map((t) => t.id)) + 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  saveTemplates([...templates, newTemplate]);
  return newTemplate;
}

export function updateTemplate(id: number, data: Partial<ItemTemplateFormData>): ItemTemplate | null {
  const templates = getTemplates();
  const index = templates.findIndex((t) => t.id === id);

  if (index === -1) {
    return null;
  }

  const updatedTemplate: ItemTemplate = {
    ...templates[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };

  const updatedTemplates = [...templates];
  updatedTemplates[index] = updatedTemplate;
  saveTemplates(updatedTemplates);

  return updatedTemplate;
}

export function deleteTemplate(id: number): boolean {
  const templates = getTemplates();
  const updatedTemplates = templates.filter((t) => t.id !== id);

  if (updatedTemplates.length === templates.length) {
    return false;
  }

  saveTemplates(updatedTemplates);
  return true;
}

export function createTemplateFromItem(
  name: string,
  item: {
    category: string;
    vendorName?: string;
    vendorUrl?: string;
    location?: string;
    reorderPoint?: number;
    description?: string;
  }
): ItemTemplate {
  return createTemplate({
    name,
    category: item.category,
    defaultFields: {
      vendorName: item.vendorName || '',
      vendorUrl: item.vendorUrl || '',
      location: item.location || '',
      reorderPoint: item.reorderPoint || 0,
      description: item.description || '',
    },
  });
}
