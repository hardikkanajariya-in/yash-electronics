import { createHash } from 'crypto';

export const prerender = false;

export const POST = async ({ request }: { request: Request }) => {
  try {
    let folder = 'yash-electronics/uploads';
    try {
      const body = await request.json();
      if (body && body.folder) {
        folder = String(body.folder);
      }
    } catch {
      // If request has no JSON body, fallback to default folder
    }

    const cloudName = process.env.PUBLIC_CLOUDINARY_CLOUD_NAME || import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY || import.meta.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET || import.meta.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return new Response(
        JSON.stringify({ error: 'Cloudinary configuration is missing on server' }),
        { status: 500 }
      );
    }

    const timestamp = Math.round(new Date().getTime() / 1000);
    const paramString = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    const signature = createHash('sha1').update(paramString).digest('hex');

    return new Response(
      JSON.stringify({
        signature,
        timestamp,
        apiKey,
        cloudName,
        folder,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to generate upload signature' }),
      { status: 500 }
    );
  }
};
