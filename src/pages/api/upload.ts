import { createHash } from 'crypto';

export const prerender = false;

export const POST = async ({ request }: { request: Request }) => {
  try {
    const data = await request.formData();
    const file = data.get('file') as File;
    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), { status: 400 });
    }

    const cloudName = process.env.PUBLIC_CLOUDINARY_CLOUD_NAME || import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY || import.meta.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET || import.meta.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return new Response(JSON.stringify({ error: 'Cloudinary configuration is missing on server' }), { status: 500 });
    }

    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = data.get('folder')?.toString() || 'yash-electronics/uploads';
    const paramString = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    const signature = createHash('sha1').update(paramString).digest('hex');

    const isVideoFile = file.type.startsWith('video/') || /\.(mp4|webm|mov|ogg|avi)$/i.test(file.name);
    const endpoint = isVideoFile ? 'video' : 'image';

    const arrayBuffer = await file.arrayBuffer();
    const blob = new Blob([arrayBuffer], { type: file.type });

    const uploadForm = new FormData();
    uploadForm.append('file', blob, file.name);
    uploadForm.append('folder', folder);
    uploadForm.append('timestamp', String(timestamp));
    uploadForm.append('api_key', apiKey);
    uploadForm.append('signature', signature);
    if (isVideoFile) {
      uploadForm.append('resource_type', 'video');
    }

    const cloudinaryRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${endpoint}/upload`, {
      method: 'POST',
      body: uploadForm,
    });

    const cloudinaryData = await cloudinaryRes.json();
    if (cloudinaryData.secure_url) {
      let publicId = cloudinaryData.public_id;
      if (cloudinaryData.resource_type === 'video' || isVideoFile) {
        const ext = file.name.split('.').pop() || 'mp4';
        if (!publicId.endsWith('.' + ext)) {
          publicId = `${publicId}.${ext}`;
        }
      }
      return new Response(JSON.stringify({
        url: cloudinaryData.secure_url,
        public_id: publicId,
      }), { status: 200 });
    } else {
      return new Response(JSON.stringify({ error: cloudinaryData.error?.message || 'Cloudinary upload failed' }), { status: 500 });
    }
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), { status: 500 });
  }
};
