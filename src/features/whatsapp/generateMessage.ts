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
  locale: string = 'gu',
): string {
  if (locale === 'gu') {
    const lines = [
      `નમસ્તે ${settings.businessName},`,
      '',
      'હું આ પ્રોડક્ટ વિશે પૂછપરછ કરવા માંગુ છું:',
      `*${product.name}*`,
      `બ્રાન્ડ: ${product.brand}`,
      `મોડેલ: ${product.modelNumber}`,
      `કિંમત: ₹${product.offerPrice.toLocaleString('en-IN')}`,
    ];

    if (product.url) {
      lines.push('', `લિંક: ${product.url}`);
    }

    lines.push('', 'કૃપા કરીને આ સ્ટોકમાં ઉપલબ્ધ છે કે નહીં અને અન્ય વિગતો જણાવશો.');
    return lines.join('\n');
  }

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

export function generateGeneralInquiryMessage(
  settings: SiteSettings,
  locale: string = 'gu',
): string {
  if (locale === 'gu') {
    return [
      `નમસ્તે ${settings.businessName},`,
      '',
      'હું તમારી પ્રોડક્ટ્સ અને ઓફર્સ વિશે પૂછપરછ કરવા માંગુ છું.',
      'કૃપા કરીને મને વિગતો જણાવશો.',
    ].join('\n');
  }

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
  locale: string = 'gu',
): string {
  if (locale === 'gu') {
    return [
      `નમસ્તે ${settings.businessName},`,
      '',
      `મને આ ઓફરમાં રસ છે: *${offerTitle}*`,
      'કૃપા કરીને આ ઓફર વિશે વધુ વિગતો જણાવશો.',
    ].join('\n');
  }

  return [
    `Hello ${settings.businessName},`,
    '',
    `I am interested in the offer: *${offerTitle}*`,
    'Please share more details.',
  ].join('\n');
}
