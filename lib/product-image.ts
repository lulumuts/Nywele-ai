/**
 * Resolve a product image URL from API / DB shapes (camelCase + snake_case + arrays).
 */
export function getProductImageUrl(product: Record<string, unknown> | null | undefined): string | null {
  if (!product) return null;

  const s = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : null);

  const direct =
    s(product.productImage) ||
    s(product.product_image) ||
    s(product.image_url) ||
    s(product.imageUrl);

  if (direct) return direct;

  const images = product.images;
  if (Array.isArray(images)) {
    const first = images.find((x) => typeof x === 'string' && (x as string).trim());
    if (first) return (first as string).trim();
  }

  return null;
}
