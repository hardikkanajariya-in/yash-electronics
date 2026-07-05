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

export function getPublicIdFromUrl(url: string): string {
  if (!url) return '';
  if (!url.startsWith('http')) return url;
  try {
    const uploadIndex = url.indexOf('/upload/');
    if (uploadIndex === -1) return url;
    
    let path = url.substring(uploadIndex + 8);
    const segments = path.split('/');
    const cleanSegments = segments.filter(seg => {
      if (/^v\d+$/.test(seg)) return false;
      if (seg.includes('_') && (seg.includes(',') || seg.startsWith('w_') || seg.startsWith('h_') || seg.startsWith('c_') || seg.startsWith('q_') || seg.startsWith('f_'))) {
        return false;
      }
      return true;
    });
    
    let publicId = cleanSegments.join('/');
    const lastDotIndex = publicId.lastIndexOf('.');
    if (lastDotIndex !== -1 && lastDotIndex > publicId.lastIndexOf('/')) {
      publicId = publicId.substring(0, lastDotIndex);
    }
    return publicId;
  } catch (e) {
    return url;
  }
}

