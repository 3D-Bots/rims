import { User } from '../types/User';
import { Item } from '../types/Item';
import { STORAGE_KEYS, saveToStorage, isInitialized, setInitialized } from '../services/storage';

const seedUsers: User[] = [
  {
    id: 1,
    email: 'admin@example.com',
    password: 'changeme',
    role: 'admin',
    signInCount: 0,
    lastSignInAt: null,
    lastSignInIp: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    email: 'user@example.com',
    password: 'changeme',
    role: 'user',
    signInCount: 0,
    lastSignInAt: null,
    lastSignInIp: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const seedItems: Item[] = [
  {
    id: 1,
    name: 'Arduino Uno',
    description: 'The Arduino Uno is a microcontroller board based on the ATmega328.',
    productModelNumber: 'R3',
    vendorPartNumber: '50',
    vendorName: 'Adafruit',
    quantity: 8,
    unitValue: 24.95,
    value: 199.60,
    picture: null,
    vendorUrl: 'https://www.adafruit.com/product/50',
    category: 'Arduino',
    location: 'H1LD1B1',
    barcode: 'RIMS-0001',
    reorderPoint: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: 'Arduino Mega 2560',
    description: 'The Arduino Mega 2560 is a microcontroller board based on the ATmega2560.',
    productModelNumber: 'R3',
    vendorPartNumber: '191',
    vendorName: 'Adafruit',
    quantity: 1,
    unitValue: 45.95,
    value: 45.95,
    picture: null,
    vendorUrl: 'https://www.adafruit.com/product/191',
    category: 'Arduino',
    location: 'H1LD1B3',
    barcode: 'RIMS-0002',
    reorderPoint: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function initializeData(): void {
  if (isInitialized()) {
    return;
  }

  saveToStorage(STORAGE_KEYS.USERS, seedUsers);
  saveToStorage(STORAGE_KEYS.ITEMS, seedItems);
  setInitialized();
}

export { seedUsers, seedItems };
