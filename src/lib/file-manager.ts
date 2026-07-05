import { getPublicIdFromUrl } from './cloudinary';

export const fileManager = {
  /**
   * Uploads a file to Cloudinary and returns its public_id.
   * @param file The file to upload
   * @param folderName The folder in Cloudinary to upload to
   */
  async upload(file: File, folderName: string): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folderName);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Upload failed with status ${response.status}`);
    }

    const data = await response.json();
    if (!data.public_id) {
      throw new Error('Upload succeeded but no public ID was returned');
    }
    return data.public_id;
  },

  /**
   * Removes a file from Cloudinary using its public ID or URL.
   * @param publicIdOrUrl The public ID or URL of the asset to delete
   */
  async remove(publicIdOrUrl: string): Promise<void> {
    if (!publicIdOrUrl) return;

    const publicId = getPublicIdFromUrl(publicIdOrUrl);
    const isVideo = publicIdOrUrl.endsWith('.mp4') || publicIdOrUrl.endsWith('.webm') || publicIdOrUrl.endsWith('.ogg') || publicIdOrUrl.endsWith('.mov') || publicIdOrUrl.includes('/video/upload/');
    const resourceType = isVideo ? 'video' : 'image';

    const response = await fetch('/api/admin/delete-asset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ publicId, resourceType }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Delete failed with status ${response.status}`);
    }
  }
};
