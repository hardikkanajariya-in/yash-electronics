import type { SiteSettings } from '../../types';

interface WhatsAppProductContext {
  name: string;
  brand: string;
  modelNumber: string;
  offerPrice: number;
  url?: string;
}

export function buildWhatsAppUrl(
  phone: string,
  message: string,
): string {
  const cleaned = phone.replace(/\D/g, '');
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`;
}

export function generateProductInquiryMessage(
  product: WhatsAppProductContext,
  settings: SiteSettings,
): string {
  const lines = [
    `Hello ${settings.businessName},`,
    '',
    'I would like to enquire about:',
    `*${product.name}*`,
    `Brand: ${product.brand}`,
    `Model: ${product.modelNumber}`,
    `Price: ₹${product.offerPrice.toLocaleString('en-IN')}`,
  ];

  if (product.url) {
    lines.push('', `Link: ${product.url}`);
  }

  lines.push('', 'Please share availability and best offer.');
  return lines.join('\n');
}

export function generateGeneralInquiryMessage(settings: SiteSettings): string {
  return [
    `Hello ${settings.businessName},`,
    '',
    'I would like to enquire about your products and offers.',
    'Please assist me.',
  ].join('\n');
}

export function generateOfferInquiryMessage(
  offerTitle: string,
  settings: SiteSettings,
): string {
  return [
    `Hello ${settings.businessName},`,
    '',
    `I am interested in the offer: *${offerTitle}*`,
    'Please share more details.',
  ].join('\n');
}
