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
  if (publicId.startsWith('/')) return publicId;

  const isVideo = publicId.endsWith('.mp4') || publicId.endsWith('.webm') || publicId.endsWith('.ogg') || publicId.endsWith('.mov') || publicId.includes('/video/upload/');
  const resourceType = isVideo ? 'video' : 'image';

  const { width, height, crop = 'fill', quality = 'auto', format = 'auto' } = options;
  const transforms: string[] = [`f_${format}`, `q_${quality}`];

  if (width) transforms.push(`w_${width}`);
  if (height) transforms.push(`h_${height}`);
  if (width || height) transforms.push(`c_${crop}`);

  return `https://res.cloudinary.com/${cloudinaryConfig.cloudName}/${resourceType}/upload/${transforms.join(',')}/${publicId}`;
}

export function buildSrcSet(publicId: string, widths: number[]): string {
  if (!publicId || publicId.startsWith('/') || publicId.startsWith('http')) {
    return '';
  }

  return widths
    .map((w) => `${buildCloudinaryUrl(publicId, { width: w })} ${w}w`)
    .join(', ');
}

export function isLocalImage(publicId: string): boolean {
  return Boolean(publicId && (publicId.startsWith('/') || publicId.startsWith('http')));
}
