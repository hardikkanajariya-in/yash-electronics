import type { Product, ProductFilters, SortOption } from '../types';

export function searchProducts(products: Product[], query: string): Product[] {
  const term = query.toLowerCase().trim();
  if (!term) return products;

  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(term) ||
      p.modelNumber.toLowerCase().includes(term) ||
      p.brand.toLowerCase().includes(term) ||
      p.category.toLowerCase().includes(term),
  );
}

export function filterProducts(products: Product[], filters: ProductFilters): Product[] {
  let result = [...products];

  if (filters.search) {
    result = searchProducts(result, filters.search);
  }

  if (filters.category) {
    result = result.filter((p) => p.categorySlug === filters.category);
  }

  if (filters.brand) {
    result = result.filter((p) => p.brandSlug === filters.brand);
  }

  if (filters.minPrice !== undefined) {
    result = result.filter((p) => p.offerPrice >= filters.minPrice!);
  }

  if (filters.maxPrice !== undefined) {
    result = result.filter((p) => p.offerPrice <= filters.maxPrice!);
  }

  return result;
}

export function sortProducts(products: Product[], sort: SortOption = 'featured'): Product[] {
  const sorted = [...products];

  switch (sort) {
    case 'featured':
      return sorted.sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured));
    case 'latest':
      return sorted.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    case 'price-asc':
      return sorted.sort((a, b) => a.offerPrice - b.offerPrice);
    case 'price-desc':
      return sorted.sort((a, b) => b.offerPrice - a.offerPrice);
    default:
      return sorted;
  }
}

export function getActiveProducts(products: Product[]): Product[] {
  return products.filter((p) => p.isActive);
}

export function getFeaturedProducts(products: Product[]): Product[] {
  return products.filter((p) => p.isActive && p.isFeatured);
}

export function getProductsByCategory(products: Product[], categorySlug: string): Product[] {
  return products.filter((p) => p.isActive && p.categorySlug === categorySlug);
}

export function getPriceRange(products: Product[]): { min: number; max: number } {
  if (products.length === 0) return { min: 0, max: 0 };
  const prices = products.map((p) => p.offerPrice);
  return { min: Math.min(...prices), max: Math.max(...prices) };
}
