import { db, pool } from '../db';
import { products, brands, categories } from '../db/schema';
import { eq } from 'drizzle-orm';
import { generateId } from './auth';
import { seedReviewsForProduct } from './review-seeder';

// Simple slugify function
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-'); // Replace multiple - with single -
}

// Robust CSV Parser
export function parseCsv(text: string): string[][] {
  const result: string[][] = [];
  let row: string[] = [];
  let inQuotes = false;
  let currentVal = '';

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentVal += '"';
        i++; // skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(currentVal.trim());
      currentVal = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      row.push(currentVal.trim());
      result.push(row);
      row = [];
      currentVal = '';
      if (char === '\r' && nextChar === '\n') {
        i++; // skip \n
      }
    } else {
      currentVal += char;
    }
  }
  if (currentVal || row.length > 0) {
    row.push(currentVal.trim());
    result.push(row);
  }
  return result.filter(r => r.length > 0 && r.some(v => v !== ''));
}

// CSV Stringifier
export function stringifyCsv(headers: string[], rows: Record<string, any>[]): string {
  const escapeVal = (val: any) => {
    if (val === null || val === undefined) return '';
    let str = String(val);
    if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
      str = '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  };

  const lines = [headers.map(escapeVal).join(',')];
  for (const row of rows) {
    lines.push(headers.map(h => escapeVal(row[h])).join(','));
  }
  return lines.join('\r\n');
}

// Import Products Logic
export async function importProductsFromCsv(csvText: string) {
  const parsed = parseCsv(csvText);
  if (parsed.length < 2) {
    return { success: 0, errors: ['CSV file is empty or only contains header.'] };
  }

  const headerRow = parsed[0].map(h => h.toLowerCase().replace(/[\s_-]/g, ''));
  
  const nameIdx = headerRow.indexOf('name');
  const nameGuIdx = headerRow.indexOf('name(gujarati)') !== -1 ? headerRow.indexOf('name(gujarati)') : headerRow.indexOf('namegu');
  const slugIdx = headerRow.indexOf('slug');
  const brandIdx = headerRow.indexOf('brand') !== -1 ? headerRow.indexOf('brand') : headerRow.indexOf('brandname');
  const brandGuIdx = headerRow.indexOf('brand(gujarati)') !== -1 ? headerRow.indexOf('brand(gujarati)') : headerRow.indexOf('brandgu');
  const categoryIdx = headerRow.indexOf('category') !== -1 ? headerRow.indexOf('category') : headerRow.indexOf('categoryname');
  const categoryGuIdx = headerRow.indexOf('category(gujarati)') !== -1 ? headerRow.indexOf('category(gujarati)') : headerRow.indexOf('categorygu');
  const modelIdx = headerRow.indexOf('modelnumber') !== -1 ? headerRow.indexOf('modelnumber') : headerRow.indexOf('model');
  const descriptionIdx = headerRow.indexOf('description');
  const descriptionGuIdx = headerRow.indexOf('description(gujarati)') !== -1 ? headerRow.indexOf('description(gujarati)') : headerRow.indexOf('descriptiongu');
  const specsIdx = headerRow.indexOf('specifications') !== -1 ? headerRow.indexOf('specifications') : headerRow.indexOf('specs');
  const specsGuIdx = headerRow.indexOf('specifications(gujarati)') !== -1 ? headerRow.indexOf('specifications(gujarati)') : headerRow.indexOf('specificationsgu');
  const mrpIdx = headerRow.indexOf('mrp');
  const offerPriceIdx = headerRow.indexOf('offerprice') !== -1 ? headerRow.indexOf('offerprice') : headerRow.indexOf('price');
  const imagesIdx = headerRow.indexOf('images');
  const featuredIdx = headerRow.indexOf('isfeatured') !== -1 ? headerRow.indexOf('isfeatured') : headerRow.indexOf('featured');
  const eligibleBundleIdx = headerRow.indexOf('eligibleforbundle') !== -1 ? headerRow.indexOf('eligibleforbundle') : headerRow.indexOf('eligiblebundle');
  const activeIdx = headerRow.indexOf('isactive') !== -1 ? headerRow.indexOf('isactive') : headerRow.indexOf('active');

  if (nameIdx === -1) {
    return { success: 0, errors: ['Required column "Name" is missing in CSV headers.'] };
  }

  let successCount = 0;
  const errors: string[] = [];

  // Fetch all brands and categories for lookup caching
  const allBrandsList = await db.select().from(brands);
  const allCategoriesList = await db.select().from(categories);

  const brandMap = new Map<string, string>(); // Name -> Id
  allBrandsList.forEach(b => brandMap.set(b.name.toLowerCase(), b.id));

  const categoryMap = new Map<string, string>(); // Name -> Id
  allCategoriesList.forEach(c => categoryMap.set(c.name.toLowerCase(), c.id));

  for (let i = 1; i < parsed.length; i++) {
    const row = parsed[i];
    const name = row[nameIdx]?.trim() || '';
    if (!name) {
      errors.push(`Row ${i + 1}: Name is empty. Skipping.`);
      continue;
    }

    try {
      // 1. Resolve Brand
      let brandId: string | null = null;
      const brandName = brandIdx !== -1 ? row[brandIdx]?.trim() || '' : '';
      const brandNameGu = brandGuIdx !== -1 ? row[brandGuIdx]?.trim() || '' : '';
      if (brandName) {
        const brandKey = brandName.toLowerCase();
        if (brandMap.has(brandKey)) {
          brandId = brandMap.get(brandKey)!;
          if (brandNameGu) {
            await db.update(brands).set({ nameGu: brandNameGu }).where(eq(brands.id, brandId));
          }
        } else {
          // Create new brand
          const newBrandId = generateId();
          const brandSlug = slugify(brandName);
          await db.insert(brands).values({
            id: newBrandId,
            name: brandName,
            nameGu: brandNameGu || null,
            slug: brandSlug,
            isActive: true,
            sortOrder: 0,
          });
          brandMap.set(brandKey, newBrandId);
          brandId = newBrandId;
        }
      }

      // 2. Resolve Category
      let categoryId: string | null = null;
      const categoryName = categoryIdx !== -1 ? row[categoryIdx]?.trim() || '' : '';
      const categoryNameGu = categoryGuIdx !== -1 ? row[categoryGuIdx]?.trim() || '' : '';
      if (categoryName) {
        const categoryKey = categoryName.toLowerCase();
        if (categoryMap.has(categoryKey)) {
          categoryId = categoryMap.get(categoryKey)!;
          if (categoryNameGu) {
            await db.update(categories).set({ nameGu: categoryNameGu }).where(eq(categories.id, categoryId));
          }
        } else {
          // Create new category
          const newCategoryId = generateId();
          const categorySlug = slugify(categoryName);
          await db.insert(categories).values({
            id: newCategoryId,
            name: categoryName,
            nameGu: categoryNameGu || null,
            slug: categorySlug,
            isActive: true,
            sortOrder: 0,
          });
          categoryMap.set(categoryKey, newCategoryId);
          categoryId = newCategoryId;
        }
      }

      // 3. Resolve Specifications (JSON or Semicolon format)
      let specifications = '{}';
      const rawSpecs = specsIdx !== -1 ? row[specsIdx]?.trim() || '' : '';
      if (rawSpecs) {
        if (rawSpecs.startsWith('{')) {
          try {
            JSON.parse(rawSpecs); // Validate it is valid JSON
            specifications = rawSpecs;
          } catch {
            errors.push(`Row ${i + 1}: specifications has invalid JSON format. Creating empty object.`);
          }
        } else {
          // Parse semicolon key-value pairs
          const specsObj: Record<string, string> = {};
          const pairs = rawSpecs.split(';');
          for (const pair of pairs) {
            const parts = pair.split(':');
            if (parts.length >= 2) {
              const key = parts[0].trim();
              const val = parts.slice(1).join(':').trim();
              if (key && val) {
                specsObj[key] = val;
              }
            }
          }
          specifications = JSON.stringify(specsObj);
        }
      }

      // 3b. Resolve Specifications (Gujarati)
      let specificationsGu = '{}';
      const rawSpecsGu = specsGuIdx !== -1 ? row[specsGuIdx]?.trim() || '' : '';
      if (rawSpecsGu) {
        if (rawSpecsGu.startsWith('{')) {
          try {
            JSON.parse(rawSpecsGu);
            specificationsGu = rawSpecsGu;
          } catch {
            errors.push(`Row ${i + 1}: Gujarati specifications has invalid JSON format.`);
          }
        } else {
          const specsObj: Record<string, string> = {};
          const pairs = rawSpecsGu.split(';');
          for (const pair of pairs) {
            const parts = pair.split(':');
            if (parts.length >= 2) {
              const key = parts[0].trim();
              const val = parts.slice(1).join(':').trim();
              if (key && val) {
                specsObj[key] = val;
              }
            }
          }
          specificationsGu = JSON.stringify(specsObj);
        }
      }

      // 4. Resolve other values
      const nameGu = nameGuIdx !== -1 ? row[nameGuIdx]?.trim() || null : null;
      const descriptionGu = descriptionGuIdx !== -1 ? row[descriptionGuIdx]?.trim() || null : null;
      const slug = slugIdx !== -1 && row[slugIdx]?.trim() ? slugify(row[slugIdx].trim()) : slugify(name);
      const modelNumber = modelIdx !== -1 ? row[modelIdx]?.trim() || null : null;
      const description = descriptionIdx !== -1 ? row[descriptionIdx]?.trim() || null : null;
      
      const mrp = mrpIdx !== -1 ? Math.round(Number(row[mrpIdx]) || 0) : 0;
      const offerPrice = offerPriceIdx !== -1 ? Math.round(Number(row[offerPriceIdx]) || 0) : 0;
      
      const images: string[] = [];

      const valBool = (val: string | undefined, defaultVal: boolean) => {
        if (!val) return defaultVal;
        const v = val.toLowerCase().trim();
        return ['true', '1', 'yes', 'on'].includes(v);
      };

      const isFeatured = featuredIdx !== -1 ? valBool(row[featuredIdx], false) : false;
      const eligibleForBundle = eligibleBundleIdx !== -1 ? valBool(row[eligibleBundleIdx], true) : true;
      const isActive = activeIdx !== -1 ? valBool(row[activeIdx], true) : true;

      // 5. Upsert Product
      const [existingProduct] = await db.select({ id: products.id }).from(products).where(eq(products.slug, slug));
      const now = new Date().toISOString();

      if (existingProduct) {
        await db.update(products).set({
          name,
          nameGu,
          brandId,
          categoryId,
          modelNumber,
          description,
          descriptionGu,
          specifications,
          specificationsGu,
          mrp,
          offerPrice,
          // We do NOT update images from CSV, keeping existing ones
          isFeatured,
          eligibleForBundle,
          isActive,
          updatedAt: now,
        }).where(eq(products.id, existingProduct.id));
      } else {
        const newId = generateId();
        await db.insert(products).values({
          id: newId,
          name,
          nameGu,
          slug,
          brandId,
          categoryId,
          modelNumber,
          description,
          descriptionGu,
          specifications,
          specificationsGu,
          mrp,
          offerPrice,
          images: [], // New products get empty image lists
          isFeatured,
          eligibleForBundle,
          isActive,
          createdAt: now,
          updatedAt: now,
        });

        // Seed 3 to 10 reviews
        const categorySlug = allCategoriesList.find(c => c.id === categoryId)?.slug || null;
        await seedReviewsForProduct(pool, newId, categorySlug);
      }
      successCount++;
    } catch (e: any) {
      errors.push(`Row ${i + 1} (${name}): ${e.message || 'Unknown database insert/update error'}`);
    }
  }

  return { success: successCount, errors };
}

// Export Products Logic
export async function exportProductsToCsv(): Promise<string> {
  const allProducts = await db.query.products.findMany({
    with: {
      brand: true,
      category: true,
    }
  });

  const headers = [
    'Name',
    'Slug',
    'Brand',
    'Category',
    'Model Number',
    'MRP',
    'Offer Price',
    'Featured',
    'Eligible for Bundle',
    'Active',
    'Specifications',
    'Description',
    'Name (Gujarati)',
    'Brand (Gujarati)',
    'Category (Gujarati)',
    'Specifications (Gujarati)',
    'Description (Gujarati)'
  ];

  const rows = allProducts.map(p => {
    // Format specifications back into key-value format for easy CSV editing
    let specStr = '';
    if (p.specifications) {
      try {
        const obj = JSON.parse(p.specifications);
        specStr = Object.entries(obj).map(([k, v]) => `${k}: ${v}`).join('; ');
      } catch {
        specStr = p.specifications;
      }
    }

    let specGuStr = '';
    if (p.specificationsGu) {
      try {
        const obj = JSON.parse(p.specificationsGu);
        specGuStr = Object.entries(obj).map(([k, v]) => `${k}: ${v}`).join('; ');
      } catch {
        specGuStr = p.specificationsGu;
      }
    }

    return {
      'Name': p.name,
      'Slug': p.slug,
      'Brand': p.brand?.name || '',
      'Category': p.category?.name || '',
      'Model Number': p.modelNumber || '',
      'MRP': p.mrp,
      'Offer Price': p.offerPrice,
      'Featured': p.isFeatured ? 'true' : 'false',
      'Eligible for Bundle': p.eligibleForBundle ? 'true' : 'false',
      'Active': p.isActive ? 'true' : 'false',
      'Specifications': specStr,
      'Description': p.description || '',
      'Name (Gujarati)': p.nameGu || '',
      'Brand (Gujarati)': p.brand?.nameGu || '',
      'Category (Gujarati)': p.category?.nameGu || '',
      'Specifications (Gujarati)': specGuStr,
      'Description (Gujarati)': p.descriptionGu || ''
    };
  });

  return stringifyCsv(headers, rows);
}
