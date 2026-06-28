import { getSessionUser } from '../../../lib/auth';
import { deleteCloudinaryAsset } from '../../../lib/cloudinary-server';

export const prerender = false;

export const POST = async ({ request, cookies }: { request: Request; cookies: any }) => {
  try {
    const currentUser = await getSessionUser(cookies);
    if (!currentUser || currentUser.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { publicId, resourceType } = await request.json();
    if (!publicId) {
      return new Response(JSON.stringify({ error: 'Missing publicId' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const result = await deleteCloudinaryAsset(publicId, resourceType || 'image');
    
    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 500,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    console.error('[Delete Asset API Error]:', e);
    return new Response(JSON.stringify({ error: e.message || 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
