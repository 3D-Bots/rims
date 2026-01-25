export interface Item {
  id: number;
  name: string;
  description: string;
  productModelNumber: string;
  vendorPartNumber: string;
  vendorName: string;
  quantity: number;
  unitValue: number;
  value: number;
  picture: string | null;
  vendorUrl: string;
  category: string;
  location: string;
  createdAt: string;
  updatedAt: string;
}

export type ItemFormData = Omit<Item, 'id' | 'value' | 'createdAt' | 'updatedAt'>;

export const CATEGORIES = [
  'Arduino',
  'Raspberry Pi',
  'BeagleBone',
  'Prototyping',
  'Kits & Projects',
  'Boards',
  'LCDs & Displays',
  'LEDs',
  'Power',
  'Cables',
  'Tools',
  'Robotics',
  'CNC',
  'Components & Parts',
  'Sensors',
  '3D Printing',
  'Wireless',
] as const;
