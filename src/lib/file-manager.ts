import { getPublicIdFromUrl } from './cloudinary';

export const fileManager = {
  /**
   * Uploads a file to Cloudinary directly from the browser and returns its public_id.
   * Direct browser-to-Cloudinary upload bypasses Vercel's serverless request body limits (4.5MB).
   * @param file The file to upload
   * @param folderName The folder in Cloudinary to upload to
   * @param onProgress Optional progress callback (0 to 100)
   */
  async upload(file: File, folderName: string, onProgress?: (percent: number) => void): Promise<string> {
    // 1. Get upload signature from server
    const sigRes = await fetch('/api/upload-signature', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folder: folderName }),
    });

    if (!sigRes.ok) {
      const errData = await sigRes.json().catch(() => ({}));
      throw new Error(errData.error || `Failed to get upload signature (${sigRes.status})`);
    }

    const { signature, timestamp, apiKey, cloudName, folder } = await sigRes.json();

    const isVideoFile = file.type.startsWith('video/') || /\.(mp4|webm|mov|ogg|avi)$/i.test(file.name);
    const endpoint = isVideoFile ? 'video' : 'image';

    const uploadForm = new FormData();
    uploadForm.append('file', file);
    uploadForm.append('folder', folder);
    uploadForm.append('timestamp', String(timestamp));
    uploadForm.append('api_key', apiKey);
    uploadForm.append('signature', signature);
    if (isVideoFile) {
      uploadForm.append('resource_type', 'video');
    }

    return new Promise<string>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/${endpoint}/upload`);

      if (onProgress && xhr.upload) {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            onProgress(percent);
          }
        };
      }

      xhr.onload = () => {
        try {
          const cloudinaryData = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300 && cloudinaryData.secure_url) {
            let publicId = cloudinaryData.public_id;
            if (cloudinaryData.resource_type === 'video' || isVideoFile) {
              const ext = file.name.split('.').pop() || 'mp4';
              if (!publicId.endsWith('.' + ext)) {
                publicId = `${publicId}.${ext}`;
              }
            }
            resolve(publicId);
          } else {
            reject(new Error(cloudinaryData.error?.message || 'Cloudinary upload failed'));
          }
        } catch (err: any) {
          reject(new Error('Failed to parse Cloudinary response: ' + err.message));
        }
      };

      xhr.onerror = () => reject(new Error('Network error uploading to Cloudinary'));
      xhr.ontimeout = () => reject(new Error('Upload to Cloudinary timed out'));

      xhr.send(uploadForm);
    });
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

