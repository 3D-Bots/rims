#!/usr/bin/env node

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const BASE_URL = process.env.BASE_URL || 'http://localhost:5177';
const OUTPUT_DIR = path.join(__dirname, '../screenshots');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Seed data to inject
const seedUsers = [
  {
    id: 1,
    email: 'admin@example.com',
    password: 'changeme',
    role: 'admin',
    signInCount: 5,
    lastSignInAt: new Date().toISOString(),
    lastSignInIp: '127.0.0.1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    email: 'user@example.com',
    password: 'changeme',
    role: 'user',
    signInCount: 2,
    lastSignInAt: new Date().toISOString(),
    lastSignInIp: '127.0.0.1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const seedItems = [
  {
    id: 1,
    name: 'Arduino Uno R3',
    description: 'The Arduino Uno R3 is a microcontroller board based on the ATmega328P. It has 14 digital input/output pins, 6 analog inputs, a 16 MHz ceramic resonator, a USB connection, a power jack, an ICSP header, and a reset button.',
    productModelNumber: 'A000066',
    vendorPartNumber: '1050-1024-ND',
    vendorName: 'Arduino',
    quantity: 15,
    unitValue: 27.60,
    value: 414.00,
    picture: null,
    vendorUrl: 'https://store.arduino.cc/products/arduino-uno-rev3',
    category: 'Arduino',
    location: 'Shelf A-1',
    barcode: 'RIMS-0001',
    reorderPoint: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: 'Raspberry Pi 4 Model B 4GB',
    description: 'The Raspberry Pi 4 Model B is the latest product in the popular Raspberry Pi range of computers. It offers ground-breaking increases in processor speed, multimedia performance, memory, and connectivity.',
    productModelNumber: 'SC0194',
    vendorPartNumber: 'SC0194',
    vendorName: 'Raspberry Pi',
    quantity: 8,
    unitValue: 55.00,
    value: 440.00,
    picture: null,
    vendorUrl: 'https://www.raspberrypi.com/products/raspberry-pi-4-model-b/',
    category: 'Raspberry Pi',
    location: 'Shelf A-2',
    barcode: 'RIMS-0002',
    reorderPoint: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    name: 'ESP32 DevKit V1',
    description: 'ESP32 development board with WiFi and Bluetooth capabilities. Features dual-core processor, 520KB SRAM, and multiple GPIO pins.',
    productModelNumber: 'ESP32-DEVKIT-V1',
    vendorPartNumber: '3269',
    vendorName: 'Adafruit',
    quantity: 25,
    unitValue: 12.50,
    value: 312.50,
    picture: null,
    vendorUrl: 'https://www.adafruit.com/product/3269',
    category: 'Wireless',
    location: 'Shelf B-1',
    barcode: 'RIMS-0003',
    reorderPoint: 10,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 4,
    name: 'BME280 Sensor',
    description: 'Temperature, humidity, and barometric pressure sensor. I2C and SPI interface.',
    productModelNumber: 'BME280',
    vendorPartNumber: '2652',
    vendorName: 'Adafruit',
    quantity: 2,
    unitValue: 14.95,
    value: 29.90,
    picture: null,
    vendorUrl: 'https://www.adafruit.com/product/2652',
    category: 'Sensors',
    location: 'Drawer C-3',
    barcode: 'RIMS-0004',
    reorderPoint: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 5,
    name: 'OLED Display 128x64',
    description: '0.96 inch OLED display module with I2C interface. SSD1306 driver.',
    productModelNumber: 'SSD1306',
    vendorPartNumber: '326',
    vendorName: 'Adafruit',
    quantity: 12,
    unitValue: 17.50,
    value: 210.00,
    picture: null,
    vendorUrl: 'https://www.adafruit.com/product/326',
    category: 'LCDs & Displays',
    location: 'Shelf B-2',
    barcode: 'RIMS-0005',
    reorderPoint: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

async function takeScreenshot(page, name, options = {}) {
  const filePath = path.join(OUTPUT_DIR, `${name}.png`);
  await page.screenshot({ path: filePath, fullPage: options.fullPage || false });
  console.log(`  ✓ ${name}.png`);
}

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function setupLocalStorage(page) {
  await page.evaluateOnNewDocument((users, items, currentUser) => {
    localStorage.setItem('rims_users', JSON.stringify(users));
    localStorage.setItem('rims_items', JSON.stringify(items));
    localStorage.setItem('rims_current_user', JSON.stringify(currentUser));
    localStorage.setItem('rims_initialized', 'true');
    localStorage.setItem('rims_stock_history', '[]');
    localStorage.setItem('rims_item_templates', '[]');
    localStorage.setItem('rims_cost_history', '[]');
    localStorage.setItem('rims_boms', '[]');
  }, seedUsers, seedItems, seedUsers[0]);
}

async function clickDropdownItem(page, dropdownId, linkHref) {
  const dropdown = await page.$(`#${dropdownId}`);
  if (dropdown) {
    await dropdown.click();
    await wait(200);
    const link = await page.$(`a[href="${linkHref}"]`);
    if (link) {
      await link.click();
      await wait(500);
      return true;
    }
  }
  return false;
}

async function main() {
  console.log('Launching browser...\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    defaultViewport: { width: 1280, height: 800 },
  });

  const page = await browser.newPage();

  try {
    console.log('Taking screenshots...\n');

    // 1. Welcome page (not logged in) - fresh page without localStorage
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    await wait(500);
    await takeScreenshot(page, '01-welcome');

    // 2. Login page
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });
    await wait(300);
    await takeScreenshot(page, '02-login');

    // 3. Set up localStorage and go to home to initialize React auth
    await setupLocalStorage(page);
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    await wait(500);

    // 4. Navigate to items via dropdown click
    await clickDropdownItem(page, 'inventory-dropdown', '/items');
    await wait(500);
    await takeScreenshot(page, '03-item-list');

    // 5. Item list with search
    const searchInput = await page.$('input[placeholder*="Search"]');
    if (searchInput) {
      await searchInput.type('Arduino');
      await wait(500);
      await takeScreenshot(page, '04-item-list-search');
      await searchInput.click({ clickCount: 3 });
      await page.keyboard.press('Backspace');
      await wait(300);
    }

    // 6. Select some items for bulk actions demo
    const checkboxes = await page.$$('table tbody input[type="checkbox"]');
    if (checkboxes.length >= 2) {
      await checkboxes[0].click();
      await checkboxes[1].click();
      await wait(300);
      await takeScreenshot(page, '05-bulk-selection');
      await checkboxes[0].click();
      await checkboxes[1].click();
    }

    // 7. New item form via dropdown
    await clickDropdownItem(page, 'inventory-dropdown', '/items/new');
    await wait(300);
    await takeScreenshot(page, '06-new-item-form', { fullPage: true });

    // 8. Item detail - click on first item in list
    await clickDropdownItem(page, 'inventory-dropdown', '/items');
    await wait(300);
    const firstItemLink = await page.$('table tbody tr td a');
    if (firstItemLink) {
      await firstItemLink.click();
      await wait(500);
      await takeScreenshot(page, '07-item-detail', { fullPage: true });
    }

    // 9. Item templates
    await clickDropdownItem(page, 'inventory-dropdown', '/items/templates');
    await wait(300);
    await takeScreenshot(page, '08-item-templates');

    // 10. BOM list
    await clickDropdownItem(page, 'bom-dropdown', '/bom');
    await wait(300);
    await takeScreenshot(page, '09-bom-list');

    // 11. New BOM form
    await clickDropdownItem(page, 'bom-dropdown', '/bom/new');
    await wait(300);
    await takeScreenshot(page, '10-new-bom-form', { fullPage: true });

    // 12. Reports dashboard
    await clickDropdownItem(page, 'reports-dropdown', '/reports');
    await wait(500);
    await takeScreenshot(page, '11-reports-dashboard', { fullPage: true });

    // 13. Valuation report
    await clickDropdownItem(page, 'reports-dropdown', '/reports/valuation');
    await wait(300);
    await takeScreenshot(page, '12-valuation-report', { fullPage: true });

    // 14. Movement report
    await clickDropdownItem(page, 'reports-dropdown', '/reports/movement');
    await wait(300);
    await takeScreenshot(page, '13-movement-report', { fullPage: true });

    // 15. Custom report
    await clickDropdownItem(page, 'reports-dropdown', '/reports/custom');
    await wait(300);
    await takeScreenshot(page, '14-custom-report', { fullPage: true });

    // 16. Reorder alerts
    await clickDropdownItem(page, 'inventory-dropdown', '/items/reorder');
    await wait(300);
    await takeScreenshot(page, '15-reorder-alerts');

    // 17. Data import
    await clickDropdownItem(page, 'inventory-dropdown', '/items/import');
    await wait(300);
    await takeScreenshot(page, '16-data-import');

    // 18. Print labels
    await clickDropdownItem(page, 'inventory-dropdown', '/items/labels');
    await wait(300);
    await takeScreenshot(page, '17-print-labels');

    // 19. Barcode scanner
    await clickDropdownItem(page, 'inventory-dropdown', '/items/scanner');
    await wait(300);
    await takeScreenshot(page, '18-barcode-scanner');

    // 20. Keyboard shortcuts modal
    await clickDropdownItem(page, 'inventory-dropdown', '/items');
    await wait(300);
    await page.keyboard.press('?');
    await wait(500);
    await takeScreenshot(page, '19-keyboard-shortcuts');
    await page.keyboard.press('Escape');
    await wait(300);

    // 21. Dark mode toggle
    const themeButton = await page.$('button[aria-label*="dark"], button[aria-label*="light"]');
    if (themeButton) {
      await themeButton.click();
      await wait(300);
      await takeScreenshot(page, '20-item-list-dark');

      // Dashboard in dark mode
      await clickDropdownItem(page, 'reports-dropdown', '/reports');
      await wait(500);
      await takeScreenshot(page, '21-dashboard-dark', { fullPage: true });

      // Item detail in dark mode
      await clickDropdownItem(page, 'inventory-dropdown', '/items');
      await wait(300);
      const itemLink = await page.$('table tbody tr td a');
      if (itemLink) {
        await itemLink.click();
        await wait(300);
        await takeScreenshot(page, '22-item-detail-dark', { fullPage: true });
      }
    }

    // 22. User management (admin)
    const usersLink = await page.$('a[href="/users"]');
    if (usersLink) {
      await usersLink.click();
      await wait(300);
      await takeScreenshot(page, '23-user-management');
    }

    console.log(`\n✅ Screenshots saved to: ${OUTPUT_DIR}`);
    console.log(`   Total: ${fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.png')).length} images`);

  } catch (error) {
    console.error('Error taking screenshots:', error);
  } finally {
    await browser.close();
  }
}

main();
