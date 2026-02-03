import { User } from '../types/User';
import { Item } from '../types/Item';
import { initializeDatabase, isDatabaseInitialized } from '../services/db/db';
import { hasExistingLocalStorageData, migrateFromLocalStorage, verifyMigration } from '../services/db/migration';
import { userRepository, itemRepository } from '../services/db/repositories';

const seedUsers: Omit<User, 'id'>[] = [
  {
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

const seedItems: Omit<Item, 'id'>[] = [
  {
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

/**
 * Initialize the database and seed data if needed
 * This is now an async function that must be awaited
 */
export async function initializeData(): Promise<void> {
  // Initialize the SQLite database
  await initializeDatabase();

  // Check if we need to migrate from localStorage
  if (hasExistingLocalStorageData()) {
    console.log('Detected existing localStorage data, migrating to SQLite...');
    const result = migrateFromLocalStorage();
    console.log('Migration result:', result);

    // Verify migration
    const verification = verifyMigration();
    console.log('Migration verification:', verification);
    return;
  }

  // Check if database already has data
  const existingUsers = userRepository.count();
  if (existingUsers > 0) {
    console.log('Database already initialized with', existingUsers, 'users');
    return;
  }

  // Seed fresh data
  console.log('Seeding fresh database...');

  // Seed users
  for (const userData of seedUsers) {
    userRepository.create(userData);
  }

  // Seed items
  for (const itemData of seedItems) {
    itemRepository.create(itemData);
  }

  console.log('Database seeded successfully');
}

export { seedUsers, seedItems };
