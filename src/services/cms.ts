import type { CmsData } from '../types';
import { mockCmsData } from './mock-data';

const API_URL = import.meta.env.SHEETS_API_URL;
const API_KEY = import.meta.env.SHEETS_API_KEY;
const USE_MOCK = import.meta.env.USE_MOCK_DATA === 'true' || !API_URL;

let cachedData: CmsData | null = null;

async function fetchFromApi(): Promise<CmsData> {
  const url = new URL(API_URL);
  if (API_KEY) url.searchParams.set('key', API_KEY);

  const response = await fetch(url.toString(), {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Sheets API error: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as CmsData;

  if (!data.settings || !data.products) {
    throw new Error('Invalid CMS response: missing required data');
  }

  return data;
}

export async function getCmsData(): Promise<CmsData> {
  if (cachedData) return cachedData;

  if (USE_MOCK) {
    if (import.meta.env.DEV) {
      console.warn(
        '[CMS] Using mock data. Set SHEETS_API_URL in .env to connect Google Sheets.',
      );
    }
    cachedData = mockCmsData;
    return cachedData;
  }

  cachedData = await fetchFromApi();
  return cachedData;
}

export async function getSettings() {
  const data = await getCmsData();
  return data.settings;
}

export async function getCategories() {
  const data = await getCmsData();
  return data.categories
    .filter((c) => c.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getBrands() {
  const data = await getCmsData();
  return data.brands
    .filter((b) => b.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getProducts() {
  const data = await getCmsData();
  return data.products.filter((p) => p.isActive);
}

export async function getProductBySlug(slug: string) {
  const products = await getProducts();
  return products.find((p) => p.slug === slug) ?? null;
}

export async function getCategoryBySlug(slug: string) {
  const categories = await getCategories();
  return categories.find((c) => c.slug === slug) ?? null;
}

export async function getOffers() {
  const data = await getCmsData();
  return data.offers
    .filter((o) => o.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getOfferBySlug(slug: string) {
  const offers = await getOffers();
  return offers.find((o) => o.slug === slug) ?? null;
}
