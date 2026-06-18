export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  image: string;
  sortOrder: number;
  isActive: boolean;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo: string;
  sortOrder: number;
  isActive: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string;
  brandSlug: string;
  category: string;
  categorySlug: string;
  modelNumber: string;
  description: string;
  specifications: string;
  mrp: number;
  offerPrice: number;
  images: string[];
  isFeatured: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Offer {
  id: string;
  title: string;
  slug: string;
  type: 'combo' | 'bundle' | 'weekly' | 'festival';
  description: string;
  image: string;
  discountText: string;
  validUntil: string;
  isActive: boolean;
  sortOrder: number;
  couponCode?: string | null;
  discountType?: 'percentage' | 'flat' | null;
  discountValue?: number | null;
  minOrderValue?: number | null;
  discountCap?: number | null;
}

export interface SiteSettings {
  businessName: string;
  tagline: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  googleMapsUrl: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  heroCtaText: string;
  heroCtaLink: string;
  workingHours: string;
  facebookUrl: string;
  instagramUrl: string;
  youtubeUrl: string;
  logoUrl?: string;
}

export interface CmsData {
  settings: SiteSettings;
  categories: Category[];
  brands: Brand[];
  products: Product[];
  offers: Offer[];
}

export type SortOption = 'featured' | 'latest' | 'price-asc' | 'price-desc';

export interface ProductFilters {
  search?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: SortOption;
}

export interface ParsedSpecifications {
  [key: string]: string;
}

// ─── NEW TYPES ──────────────────────────────────────────────

export interface TeamMember {
  id: string;
  name: string;
  photo: string | null;
  phone: string | null;
  role: 'sales_head' | 'sales_staff' | 'service_head' | 'service_staff';
  department: 'sales' | 'service';
  sortOrder: number;
  isActive: boolean;
}

export interface ServiceItem {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  icon: string | null;
  image: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface AboutInfo {
  id: string;
  role: 'founder' | 'owner' | 'next_gen';
  name: string;
  photo: string | null;
  description: string | null;
  sortOrder: number;
}

export interface BankDetail {
  id: string;
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  branchName: string;
  upiQrCode: string | null;
  bankQrCode: string | null;
  isActive: boolean;
}

export interface BusinessHour {
  id: string;
  dayOfWeek: number;
  label: string;
  openTime: string | null;
  closeTime: string | null;
  isOpen: boolean;
  note: string | null;
}

export interface ReferralHistoryItem {
  id: string;
  referrerId: string | null;
  referredUserId: string | null;
  pointsEarned: number;
  type: 'referrer_bonus' | 'signup_bonus';
  createdAt: string;
  referrer?: { name: string; phone: string } | null;
  referredUser?: { name: string; phone: string } | null;
}
