import { VendorPriceResult, VendorPriceCache, SUPPORTED_VENDORS } from '../types/Vendor';
import { getFromStorage, saveToStorage, STORAGE_KEYS } from './storage';

const CACHE_DURATION_MS = 15 * 60 * 1000; // 15 minutes

function getPriceCache(): VendorPriceCache {
  return getFromStorage<VendorPriceCache>(STORAGE_KEYS.VENDOR_PRICE_CACHE) || {};
}

function savePriceCache(cache: VendorPriceCache): void {
  saveToStorage(STORAGE_KEYS.VENDOR_PRICE_CACHE, cache);
}

function getCacheKey(vendor: string, partNumber: string): string {
  return `${vendor.toLowerCase()}-${partNumber.toLowerCase()}`;
}

function isCacheValid(entry: VendorPriceResult): boolean {
  const lastChecked = new Date(entry.lastChecked).getTime();
  return Date.now() - lastChecked < CACHE_DURATION_MS;
}

/**
 * Mock price lookup - simulates API call to vendor
 * In production, this would make actual API calls
 */
function mockPriceLookup(vendor: string, partNumber: string): VendorPriceResult | null {
  const vendorLower = vendor.toLowerCase();
  const supportedVendor = SUPPORTED_VENDORS.find(
    (v) => v.name.toLowerCase() === vendorLower || v.id === vendorLower
  );

  if (!supportedVendor) {
    return null;
  }

  // Generate mock price based on part number hash for consistency
  const hash = partNumber.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const basePrice = (hash % 100) + 0.99;
  const inStock = hash % 3 !== 0; // ~66% in stock
  const stockQty = inStock ? (hash % 500) + 1 : 0;

  return {
    vendor: supportedVendor.name,
    partNumber,
    price: Math.round(basePrice * 100) / 100,
    inStock,
    stockQuantity: stockQty,
    vendorUrl: `${supportedVendor.baseUrl}/product/${encodeURIComponent(partNumber)}`,
    lastChecked: new Date().toISOString(),
  };
}

/**
 * Look up price from vendor (with caching)
 */
export async function lookupPrice(vendor: string, partNumber: string): Promise<VendorPriceResult | null> {
  const cacheKey = getCacheKey(vendor, partNumber);
  const cache = getPriceCache();

  // Check cache first
  if (cache[cacheKey] && isCacheValid(cache[cacheKey])) {
    return cache[cacheKey];
  }

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 1000));

  const result = mockPriceLookup(vendor, partNumber);

  if (result) {
    // Update cache
    cache[cacheKey] = result;
    savePriceCache(cache);
  }

  return result;
}

/**
 * Look up prices from multiple vendors for comparison
 */
export async function compareVendorPrices(partNumber: string): Promise<VendorPriceResult[]> {
  const results: VendorPriceResult[] = [];

  for (const vendor of SUPPORTED_VENDORS) {
    const result = await lookupPrice(vendor.name, partNumber);
    if (result) {
      results.push(result);
    }
  }

  // Sort by price ascending
  return results.sort((a, b) => a.price - b.price);
}

/**
 * Clear the price cache
 */
export function clearPriceCache(): void {
  savePriceCache({});
}

/**
 * Get supported vendor names
 */
export function getSupportedVendors(): string[] {
  return SUPPORTED_VENDORS.map((v) => v.name);
}

/**
 * Check if a vendor is supported
 */
export function isVendorSupported(vendor: string): boolean {
  const vendorLower = vendor.toLowerCase();
  return SUPPORTED_VENDORS.some(
    (v) => v.name.toLowerCase() === vendorLower || v.id === vendorLower
  );
}
