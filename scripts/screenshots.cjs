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

async function takeScreenshot(page, name, options = {}) {
  const filePath = path.join(OUTPUT_DIR, `${name}.png`);
  await page.screenshot({ path: filePath, fullPage: options.fullPage || false });
  console.log(`  ✓ ${name}.png`);
}

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('Launching browser...\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    defaultViewport: { width: 1280, height: 800 },
  });

  const page = await browser.newPage();

  try {
    // 1. Welcome page (not logged in)
    console.log('Taking screenshots...\n');

    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    await wait(500);
    await takeScreenshot(page, '01-welcome');

    // 2. Login page
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });
    await wait(300);
    await takeScreenshot(page, '02-login');

    // 3. Perform login
    await page.type('#email', 'admin@example.com');
    await page.type('#password', 'changeme');
    await page.click('button[type="submit"]');
    await wait(1500); // Wait for redirect

    // 4. Item list (after login redirects here)
    await page.goto(`${BASE_URL}/items`, { waitUntil: 'networkidle0' });
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
      // Deselect
      await checkboxes[0].click();
      await checkboxes[1].click();
    }

    // 7. New item form
    await page.goto(`${BASE_URL}/items/new`, { waitUntil: 'networkidle0' });
    await wait(300);
    await takeScreenshot(page, '06-new-item-form', { fullPage: true });

    // 8. Item detail (if items exist)
    await page.goto(`${BASE_URL}/items/1`, { waitUntil: 'networkidle0' });
    await wait(500);
    await takeScreenshot(page, '07-item-detail', { fullPage: true });

    // 9. Item templates
    await page.goto(`${BASE_URL}/items/templates`, { waitUntil: 'networkidle0' });
    await wait(300);
    await takeScreenshot(page, '08-item-templates');

    // 10. BOM list
    await page.goto(`${BASE_URL}/bom`, { waitUntil: 'networkidle0' });
    await wait(300);
    await takeScreenshot(page, '09-bom-list');

    // 11. New BOM form
    await page.goto(`${BASE_URL}/bom/new`, { waitUntil: 'networkidle0' });
    await wait(300);
    await takeScreenshot(page, '10-new-bom-form', { fullPage: true });

    // 12. Reports dashboard
    await page.goto(`${BASE_URL}/reports`, { waitUntil: 'networkidle0' });
    await wait(500);
    await takeScreenshot(page, '11-reports-dashboard', { fullPage: true });

    // 13. Valuation report
    await page.goto(`${BASE_URL}/reports/valuation`, { waitUntil: 'networkidle0' });
    await wait(300);
    await takeScreenshot(page, '12-valuation-report', { fullPage: true });

    // 14. Movement report
    await page.goto(`${BASE_URL}/reports/movement`, { waitUntil: 'networkidle0' });
    await wait(300);
    await takeScreenshot(page, '13-movement-report', { fullPage: true });

    // 15. Custom report
    await page.goto(`${BASE_URL}/reports/custom`, { waitUntil: 'networkidle0' });
    await wait(300);
    await takeScreenshot(page, '14-custom-report', { fullPage: true });

    // 16. Reorder alerts
    await page.goto(`${BASE_URL}/items/reorder`, { waitUntil: 'networkidle0' });
    await wait(300);
    await takeScreenshot(page, '15-reorder-alerts');

    // 17. Data import
    await page.goto(`${BASE_URL}/items/import`, { waitUntil: 'networkidle0' });
    await wait(300);
    await takeScreenshot(page, '16-data-import');

    // 18. Print labels
    await page.goto(`${BASE_URL}/items/labels`, { waitUntil: 'networkidle0' });
    await wait(300);
    await takeScreenshot(page, '17-print-labels');

    // 19. Barcode scanner
    await page.goto(`${BASE_URL}/items/scanner`, { waitUntil: 'networkidle0' });
    await wait(300);
    await takeScreenshot(page, '18-barcode-scanner');

    // 20. Keyboard shortcuts modal
    await page.goto(`${BASE_URL}/items`, { waitUntil: 'networkidle0' });
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
      await page.goto(`${BASE_URL}/reports`, { waitUntil: 'networkidle0' });
      await wait(500);
      await takeScreenshot(page, '21-dashboard-dark', { fullPage: true });

      // Item detail in dark mode
      await page.goto(`${BASE_URL}/items/1`, { waitUntil: 'networkidle0' });
      await wait(300);
      await takeScreenshot(page, '22-item-detail-dark', { fullPage: true });
    }

    // 22. User management (admin)
    await page.goto(`${BASE_URL}/users`, { waitUntil: 'networkidle0' });
    await wait(300);
    await takeScreenshot(page, '23-user-management');

    console.log(`\n✅ Screenshots saved to: ${OUTPUT_DIR}`);
    console.log(`   Total: ${fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.png')).length} images`);

  } catch (error) {
    console.error('Error taking screenshots:', error);
  } finally {
    await browser.close();
  }
}

main();
