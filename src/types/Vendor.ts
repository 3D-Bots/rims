export interface Vendor {
  id: string;
  name: string;
  displayName: string;
  baseUrl: string;
}

export interface VendorPriceResult {
  vendor: string;
  partNumber: string;
  price: number;
  inStock: boolean;
  stockQuantity?: number;
  vendorUrl?: string;
  lastChecked: string;
}

export interface VendorPriceCache {
  [key: string]: VendorPriceResult;
}

export const SUPPORTED_VENDORS: Vendor[] = [
  {
    id: 'adafruit',
    name: 'Adafruit',
    displayName: 'Adafruit Industries',
    baseUrl: 'https://www.adafruit.com',
  },
  {
    id: 'digikey',
    name: 'DigiKey',
    displayName: 'Digi-Key Electronics',
    baseUrl: 'https://www.digikey.com',
  },
  {
    id: 'mouser',
    name: 'Mouser',
    displayName: 'Mouser Electronics',
    baseUrl: 'https://www.mouser.com',
  },
  {
    id: 'sparkfun',
    name: 'SparkFun',
    displayName: 'SparkFun Electronics',
    baseUrl: 'https://www.sparkfun.com',
  },
  {
    id: 'arrow',
    name: 'Arrow',
    displayName: 'Arrow Electronics',
    baseUrl: 'https://www.arrow.com',
  },
];
