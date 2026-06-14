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
