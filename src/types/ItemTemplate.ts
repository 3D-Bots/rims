import { ItemFormData } from './Item';

export interface ItemTemplate {
  id: number;
  name: string;
  category: string;
  defaultFields: Partial<Omit<ItemFormData, 'picture'>>;
  createdAt: string;
  updatedAt: string;
}

export type ItemTemplateFormData = Omit<ItemTemplate, 'id' | 'createdAt' | 'updatedAt'>;
