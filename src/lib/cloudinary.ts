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

import { createHash } from 'crypto';

export async function deleteCloudinaryAsset(
  publicId: string | null | undefined,
  resourceType: 'image' | 'video' = 'image'
): Promise<{ success: boolean; result?: string; error?: string }> {
  if (!publicId) return { success: false, error: 'No publicId provided' };
  if (publicId.startsWith('http') || publicId.startsWith('/')) {
    return { success: false, error: 'Not a Cloudinary asset (URL)' };
  }

  // Strip extension if any (especially for videos, e.g. "path.mp4" -> "path")
  let cleanPublicId = publicId;
  const lastDotIndex = publicId.lastIndexOf('.');
  if (lastDotIndex !== -1 && lastDotIndex > publicId.lastIndexOf('/')) {
    cleanPublicId = publicId.substring(0, lastDotIndex);
  }

  try {
    const cloudName = process.env.PUBLIC_CLOUDINARY_CLOUD_NAME || import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY || import.meta.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET || import.meta.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return { success: false, error: 'Cloudinary configuration is missing' };
    }

    const timestamp = Math.round(new Date().getTime() / 1000);
    const paramString = `public_id=${cleanPublicId}&timestamp=${timestamp}${apiSecret}`;
    const signature = createHash('sha1').update(paramString).digest('hex');

    const formData = new FormData();
    formData.append('public_id', cleanPublicId);
    formData.append('timestamp', String(timestamp));
    formData.append('api_key', apiKey);
    formData.append('signature', signature);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/destroy`, {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    if (data.result === 'ok' || data.result === 'not found') {
      return { success: true, result: data.result };
    } else {
      return { success: false, error: data.error?.message || data.result || 'Unknown error' };
    }
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error' };
  }
}

