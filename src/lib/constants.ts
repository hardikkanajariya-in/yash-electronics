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
    description: '100% authentic inverters, batteries & sound systems with manufacturer warranty.',
    icon: 'shield',
  },
  {
    title: 'Trusted Brands',
    description: 'Luminous, Exide, Amaron, JBL, Ahuja and more top brands.',
    icon: 'badge',
  },
  {
    title: 'Expert Installation',
    description: 'Professional on-site installation and setup by trained technicians.',
    icon: 'tool',
  },
  {
    title: 'Local Support',
    description: 'Family-run business with friendly, fast support from our nearby store.',
    icon: 'location',
  },
  {
    title: 'Competitive Pricing',
    description: 'Best value deals on power solutions and audio equipment.',
    icon: 'tag',
  },
] as const;

export const TEAM_ROLE_LABELS: Record<string, string> = {
  sales_head: 'Sales Head',
  sales_staff: 'Sales Executive',
  service_head: 'Service Head',
  service_staff: 'Service Technician',
  account_head: 'Account Head',
  chief_accountant: 'Chief Accountant',
  accountant: 'Accountant',
};

export const ABOUT_ROLE_LABELS: Record<string, string> = {
  founder: 'Founder',
  owner: 'Owner',
  next_gen: 'Next Generation',
};
