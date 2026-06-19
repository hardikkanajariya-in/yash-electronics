import { db } from '../../db';
import { products } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { clearCmsCache } from '../../services/cms';

export const prerender = false;

export const POST = async ({ request }: { request: Request }) => {
  try {
    const formData = await request.formData();
    const formAction = formData.get('formAction')?.toString() || '';
    const prodId = formData.get('productId')?.toString() || '';
    const imageUrl = formData.get('imageUrl')?.toString() || '';

    if (!prodId) {
      return new Response(JSON.stringify({ success: false, error: 'Product ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const [prod] = await db.select().from(products).where(eq(products.id, prodId));
    if (!prod) {
      return new Response(JSON.stringify({ success: false, error: 'Product not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    let updatedImages = prod.images || [];

    if (formAction === 'bulk_add_image') {
      if (!imageUrl) {
        return new Response(JSON.stringify({ success: false, error: 'Image URL is required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      if (!updatedImages.includes(imageUrl)) {
        updatedImages = [...updatedImages, imageUrl];
      }
    } else if (formAction === 'bulk_remove_image') {
      updatedImages = updatedImages.filter(img => img !== imageUrl);
    } else {
      return new Response(JSON.stringify({ success: false, error: 'Invalid action' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    await db.update(products).set({
      images: updatedImages,
      updatedAt: new Date().toISOString()
    }).where(eq(products.id, prodId));

    clearCmsCache();

    return new Response(JSON.stringify({ success: true, images: updatedImages }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ success: false, error: e.message || 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
