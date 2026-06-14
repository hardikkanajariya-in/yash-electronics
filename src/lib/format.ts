import { siteConfig } from '../config/site';

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat(siteConfig.locale, {
    style: 'currency',
    currency: siteConfig.currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function calculateSavings(mrp: number, offerPrice: number): number {
  return Math.max(0, mrp - offerPrice);
}

export function calculateDiscountPercent(mrp: number, offerPrice: number): number {
  if (mrp <= 0) return 0;
  return Math.round(((mrp - offerPrice) / mrp) * 100);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function parseSpecifications(specs: string): Record<string, string> {
  if (!specs) return {};

  try {
    const parsed = JSON.parse(specs);
    if (typeof parsed === 'object' && parsed !== null) return parsed;
  } catch {
    // fall through to line-based parsing
  }

  return specs.split('\n').reduce<Record<string, string>>((acc, line) => {
    const [key, ...rest] = line.split(':');
    if (key && rest.length) {
      acc[key.trim()] = rest.join(':').trim();
    }
    return acc;
  }, {});
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return `${text.slice(0, length).trim()}…`;
}
