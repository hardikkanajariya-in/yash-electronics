import type { CmsData } from '../types';
import { db } from '../db';
import { settings, categories, brands, products, offers, teamMembers, services, aboutInfo, bankDetails, businessHours, referralHistory } from '../db/schema';
import { eq, asc } from 'drizzle-orm';

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
        '[CMS] Using mock data from database. Set SHEETS_API_URL in .env to connect Google Sheets.',
      );
    }
    
    try {
      const dbSettingsList = await db.select().from(settings);
      const dbSettingsObj: any = {};
      dbSettingsList.forEach(s => {
        dbSettingsObj[s.key] = s.value;
      });

      const dbCategories = await db.select().from(categories);
      const dbBrands = await db.select().from(brands);
      
      const dbProductsRaw = await db.query.products.findMany({
        with: {
          brand: true,
          category: true,
        }
      });

      const dbProducts = dbProductsRaw.map((p: any) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        brand: p.brand?.name || '',
        brandSlug: p.brand?.slug || '',
        category: p.category?.name || '',
        categorySlug: p.category?.slug || '',
        modelNumber: p.modelNumber || '',
        description: p.description || '',
        specifications: p.specifications || '{}',
        mrp: p.mrp,
        offerPrice: p.offerPrice,
        images: p.images || [],
        isFeatured: p.isFeatured,
        isActive: p.isActive,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      }));

      const dbOffers = await db.select().from(offers);

      cachedData = {
        settings: dbSettingsObj,
        categories: dbCategories,
        brands: dbBrands,
        products: dbProducts,
        offers: dbOffers as any[],
      };
      return cachedData;
    } catch (e) {
      console.error('[CMS] Database fallback error:', e);
      throw e;
    }
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

// ─── NEW DATA-FETCHING FUNCTIONS ──────────────────────────────

/**
 * Get brands that have products in a specific category.
 * Inferred from product data — no junction table needed.
 */
export async function getBrandsByCategory(categorySlug: string) {
  const allProducts = await getProducts();
  const allBrands = await getBrands();

  const brandSlugsInCategory = new Set(
    allProducts
      .filter((p) => p.categorySlug === categorySlug)
      .map((p) => p.brandSlug)
  );

  return allBrands.filter((b) => brandSlugsInCategory.has(b.slug));
}

/**
 * Team Members — Sales and Service teams
 */
export async function getTeamMembers() {
  try {
    const members = await db.select().from(teamMembers).orderBy(asc(teamMembers.sortOrder));
    return members.filter((m) => m.isActive);
  } catch (e) {
    console.error('[CMS] Failed to fetch team members:', e);
    return [];
  }
}

export async function getTeamByDepartment(department: 'sales' | 'service') {
  const members = await getTeamMembers();
  return members.filter((m) => m.department === department);
}

/**
 * Services list
 */
export async function getServicesList() {
  try {
    const serviceList = await db.select().from(services).orderBy(asc(services.sortOrder));
    return serviceList.filter((s) => s.isActive);
  } catch (e) {
    console.error('[CMS] Failed to fetch services:', e);
    return [];
  }
}

/**
 * About / Leadership info
 */
export async function getAboutInfo() {
  try {
    const info = await db.select().from(aboutInfo).orderBy(asc(aboutInfo.sortOrder));
    return info;
  } catch (e) {
    console.error('[CMS] Failed to fetch about info:', e);
    return [];
  }
}

/**
 * Bank Details
 */
export async function getBankDetailsList() {
  try {
    const details = await db.select().from(bankDetails);
    return details.filter((d) => d.isActive);
  } catch (e) {
    console.error('[CMS] Failed to fetch bank details:', e);
    return [];
  }
}

/**
 * Business Hours — structured per day
 */
export async function getBusinessHours() {
  try {
    const hours = await db.select().from(businessHours).orderBy(asc(businessHours.dayOfWeek));
    return hours;
  } catch (e) {
    console.error('[CMS] Failed to fetch business hours:', e);
    return [];
  }
}

/**
 * Referral History for a specific user
 */
export async function getReferralHistory(userId: string) {
  try {
    const history = await db.query.referralHistory.findMany({
      where: eq(referralHistory.referrerId, userId),
      with: {
        referredUser: true,
      },
      orderBy: (rh: any, { desc }: any) => [desc(rh.createdAt)],
    });
    return history;
  } catch (e) {
    console.error('[CMS] Failed to fetch referral history:', e);
    return [];
  }
}
