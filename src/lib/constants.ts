import type { Offer } from '../types';

export const OFFER_TYPE_LABELS: Record<Offer['type'], string> = {
  combo: 'Combo Offers',
  bundle: 'Build Your Bundle',
  weekly: 'Offer Of The Week',
  festival: 'Festival Offers',
};

export const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'latest', label: 'Latest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
] as const;

export const TRUST_POINTS = [
  {
    title: 'Genuine Products',
    description: '100% authentic products with manufacturer warranty.',
    icon: 'shield',
  },
  {
    title: 'Trusted Brands',
    description: 'Sony, Samsung, Haier, IFB, Daikin and more.',
    icon: 'badge',
  },
  {
    title: 'Local Support',
    description: 'Friendly assistance from our nearby store team.',
    icon: 'location',
  },
  {
    title: 'Competitive Pricing',
    description: 'Best value deals on electronics and appliances.',
    icon: 'tag',
  },
  {
    title: 'Fast Assistance',
    description: 'Quick responses on WhatsApp and phone.',
    icon: 'chat',
  },
] as const;
