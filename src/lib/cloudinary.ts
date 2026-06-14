import { cloudinaryConfig } from '../config/cloudinary';

interface CloudinaryOptions {
  width?: number;
  height?: number;
  crop?: string;
  quality?: string | number;
  format?: string;
}

export function buildCloudinaryUrl(
  publicId: string,
  options: CloudinaryOptions = {},
): string {
  if (!publicId) return '/images/placeholder-product.svg';
  if (publicId.startsWith('http')) return publicId;

  const { width, height, crop = 'fill', quality = 'auto', format = 'auto' } = options;
  const transforms: string[] = [`f_${format}`, `q_${quality}`];

  if (width) transforms.push(`w_${width}`);
  if (height) transforms.push(`h_${height}`);
  if (width || height) transforms.push(`c_${crop}`);

  return `https://res.cloudinary.com/${cloudinaryConfig.cloudName}/image/upload/${transforms.join(',')}/${publicId}`;
}

export function buildSrcSet(publicId: string, widths: number[]): string {
  return widths
    .map((w) => `${buildCloudinaryUrl(publicId, { width: w })} ${w}w`)
    .join(', ');
}
