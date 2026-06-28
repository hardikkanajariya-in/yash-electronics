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
