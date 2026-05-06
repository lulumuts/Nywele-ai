// Supabase Data Fetching Functions
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { supabase } from './supabase';
import type { Product } from './products-new';
import { productToExplorerCarousel, type ExplorerCarouselProduct } from './productExplorerCatalog';

// ==================== PRODUCTS ====================

/** Normalize `text[]` / JSON / Postgres `{a,b}` strings from Supabase into string tags. */
function coerceTextArray(value: unknown): string[] {
  if (value == null) return [];
  if (Array.isArray(value)) {
    return value.map((x) => String(x).trim()).filter(Boolean);
  }
  if (typeof value === 'string') {
    const s = value.trim();
    if (!s) return [];
    if (s.startsWith('[')) {
      try {
        const parsed = JSON.parse(s) as unknown;
        if (Array.isArray(parsed)) {
          return parsed.map((x) => String(x).trim()).filter(Boolean);
        }
      } catch {
        /* ignore */
      }
    }
    if (s.startsWith('{') && s.endsWith('}')) {
      const inner = s.slice(1, -1).trim();
      if (!inner) return [];
      return inner
        .split(',')
        .map((part) => part.replace(/^"(.*)"$/, '$1').trim())
        .filter(Boolean);
    }
  }
  return [];
}

let supabaseServiceClient: SupabaseClient | null = null;

function requireClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? '';

  // Prefer service role on the server (avoids RLS issues for product catalog reads).
  // Never used in the browser.
  const isServer = typeof window === 'undefined';
  const serviceKey = process.env.SUPABASE_SERVICE_KEY?.trim() ?? '';
  if (isServer && url && serviceKey) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[supabase-data] using service role client');
    }
    if (!supabaseServiceClient) {
      supabaseServiceClient = createClient(url, serviceKey, {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      });
    }
    return supabaseServiceClient;
  }

  // Fallback to anon client (works in browser + server when RLS allows).
  if (!supabase) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        '[supabase-data] Supabase client unavailable — set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (and optionally SUPABASE_SERVICE_KEY for server)',
      );
    }
    return null;
  }
  if (process.env.NODE_ENV === 'development') {
    console.log('[supabase-data] using anon client');
  }
  return supabase;
}

export interface SupabaseProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  sub_category: string;
  description: string;
  benefits: string[];
  how_to_use: string;
  pro_tips: string[];
  hair_types: string[];
  porosity: string[];
  concerns: string[];
  goals: string[];
  estimated_price: number;
  currency: string;
  size: string;
  unit: string;
  price_min: number;
  price_max: number;
  quality: string;
  community_rating: number;
  expert_rating: number;
  images: string[];
  product_image: string;
  styles_compatible: string[];
  routine_step: string;
  ingredients: string[];
}

function transformSupabaseProduct(data: Record<string, unknown>): Product {
  const rawCategory = String(data.category ?? '').trim();
  const catNorm = rawCategory.toLowerCase();

  // Your current `products` table uses categories like:
  // - braiding_hair, styler, shampoo, conditioner, treatment, accessories
  // - "Oils & Butters", "Treatments & Masks", etc.
  const category: Product['category'] =
    catNorm.includes('braid') || catNorm.includes('braiding') || catNorm.includes('hair')
      ? 'extension'
      : catNorm.includes('styler') || catNorm.includes('styling')
        ? 'styling'
        : catNorm.includes('accessor')
          ? 'tool'
          : 'care';

  const subCategory = (() => {
    if (catNorm.includes('oil') || catNorm.includes('butter')) return 'oil';
    if (catNorm.includes('shampoo')) return 'shampoo';
    if (catNorm.includes('condition')) return 'deep-conditioner';
    if (catNorm.includes('treatment') || catNorm.includes('mask')) return 'treatment';
    if (catNorm.includes('styler') || catNorm.includes('styling')) return 'styler';
    if (catNorm.includes('braid')) return 'braiding-hair';
    if (catNorm.includes('accessor')) return 'accessories';
    return catNorm || 'care';
  })();

  // With this table shape, "quality" isn't present. Default to mid-range.
  const quality: Product['quality'] = 'mid-range';

  const hairTypesMerged = [
    ...coerceTextArray(data.hair_types),
    ...coerceTextArray(data.compatible_hair_types),
  ];
  const hairTypes = [...new Set(hairTypesMerged.map((x) => x.toLowerCase()))];

  const est =
    Number(data.estimated_price) ||
    Number(data.avg_price_kes) ||
    Number(data.price);
  const estimatedPrice = Number.isFinite(est) ? est : 0;

  const imageUrlRaw =
    typeof data.image_url === 'string' && data.image_url.trim()
      ? data.image_url.trim()
      : undefined;

  const imagesResolved = imageUrlRaw ? [imageUrlRaw] : [];

  const priceRange = undefined;

  return {
    id: String(data.id ?? ''),
    name: String(data.name ?? 'Product'),
    brand: String(data.brand ?? ''),
    category,
    subCategory,
    description: String(data.description ?? ''),
    benefits: Array.isArray(data.benefits) ? (data.benefits as string[]) : [],
    howToUse: String(data.how_to_use ?? ''),
    proTips: Array.isArray(data.pro_tips) ? (data.pro_tips as string[]) : [],
    suitableFor: {
      hairTypes,
      porosity: Array.isArray(data.porosity) ? (data.porosity as string[]) : [],
      concerns: Array.isArray(data.concerns) ? (data.concerns as string[]) : [],
      goals: Array.isArray(data.goals) ? (data.goals as string[]) : [],
    },
    pricing: {
      estimatedPrice,
      currency: String(data.currency || 'KES'),
      size: String(data.size ?? ''),
      unit: String(data.unit ?? ''),
      priceRange,
    },
    quality,
    communityRating:
      typeof data.community_rating === 'number' ? data.community_rating : undefined,
    expertRating: typeof data.expert_rating === 'number' ? data.expert_rating : undefined,
    whereToFind: [],
    images: imagesResolved,
    productImage:
      imageUrlRaw ??
      undefined,
    stylesCompatible: [],
    routineStep: undefined,
    ingredients: [],
  };
}

function mapRowsToProducts(rows: Record<string, unknown>[]): Product[] {
  const out: Product[] = [];
  for (const row of rows) {
    try {
      out.push(transformSupabaseProduct(row));
    } catch (e) {
      console.warn('[supabase-data] skipping product row', row?.id, e);
    }
  }
  return out;
}

export async function fetchAllProducts(): Promise<Product[]> {
  const client = requireClient();
  if (!client) return [];

  try {
    let { data, error } = await client
      .from('products')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('[supabase-data] fetchAllProducts (ordered):', error.message);
      const fallback = await client.from('products').select('*');
      if (fallback.error) {
        console.error('[supabase-data] fetchAllProducts (fallback):', fallback.error.message);
        return [];
      }
      data = fallback.data;
    }

    if (!data?.length) return [];

    return mapRowsToProducts(data as Record<string, unknown>[]);
  } catch (error) {
    console.error('[supabase-data] fetchAllProducts:', error);
    return [];
  }
}

export async function fetchProductsByCategory(category: string): Promise<Product[]> {
  const client = requireClient();
  if (!client) return [];

  try {
    const { data, error } = await client
      .from('products')
      .select('*')
      .eq('category', category)
      .order('name', { ascending: true });

    if (error) {
      console.error('[supabase-data] fetchProductsByCategory:', error.message);
      return [];
    }

    return mapRowsToProducts((data || []) as Record<string, unknown>[]);
  } catch (error) {
    console.error('[supabase-data] fetchProductsByCategory:', error);
    return [];
  }
}

/** Tags from both DB columns (many rows use `compatible_hair_types` only, or `hair_types` may be []). */
function hairTypeTagsFromRow(row: Record<string, unknown>): string[] {
  return [...coerceTextArray(row.hair_types), ...coerceTextArray(row.compatible_hair_types)];
}

function rowMatchesHairType(row: Record<string, unknown>, normalized: string): boolean {
  return hairTypeTagsFromRow(row).some((h) => h.trim().toLowerCase() === normalized);
}

export async function fetchProductsForHairType(hairType: string): Promise<Product[]> {
  const client = requireClient();
  if (!client) return [];

  const normalized = hairType.trim().toLowerCase();
  if (!normalized) return [];

  try {
    const { data: all, error: allErr } = await client
      .from('products')
      .select('*')
      .order('name', { ascending: true })
      .limit(2000);

    if (allErr || !all?.length) {
      if (allErr) console.error('[supabase-data] fetchProductsForHairType:', allErr.message);
      return [];
    }

    const filtered = all.filter((row: Record<string, unknown>) => rowMatchesHairType(row, normalized));

    return mapRowsToProducts(filtered);
  } catch (error) {
    console.error('[supabase-data] fetchProductsForHairType:', error);
    return [];
  }
}

/**
 * Dashboard carousel: `public.products` when `customer_products` has no rows.
 * Prefers hair-type matches when `hairType` is set; otherwise full catalog (trimmed).
 */
export async function fetchCatalogCarouselProducts(options: {
  hairType?: string | null;
  limit?: number;
}): Promise<ExplorerCarouselProduct[]> {
  const limit = Math.min(Math.max(options.limit ?? 6, 1), 24);
  const ht = options.hairType?.trim() || null;

  let rows: Product[] = [];
  if (ht) {
    rows = await fetchProductsForHairType(ht);
  }
  if (!rows.length) {
    rows = await fetchAllProducts();
  }

  return rows.slice(0, limit).map(productToExplorerCarousel);
}

export async function fetchProductById(id: string): Promise<Product | null> {
  const client = requireClient();
  if (!client) return null;

  try {
    const { data, error } = await client.from('products').select('*').eq('id', id).single();

    if (error) {
      console.error('[supabase-data] fetchProductById:', error.message);
      return null;
    }

       return transformSupabaseProduct(data as Record<string, unknown>);
  } catch (error) {
    console.error('[supabase-data] fetchProductById:', error);
    return null;
  }
}

/** Batch fetch by id; result order matches `ids` (skips missing ids). */
export async function fetchProductsByIds(ids: string[]): Promise<Product[]> {
  const client = requireClient();
  if (!client || !ids.length) return [];

  const ordered = ids.map((id) => String(id).trim()).filter(Boolean);
  const unique = [...new Set(ordered)];
  if (!unique.length) return [];

  try {
    const { data, error } = await client.from('products').select('*').in('id', unique);

    if (error) {
      console.error('[supabase-data] fetchProductsByIds:', error.message);
      return [];
    }

    const mapped = mapRowsToProducts((data || []) as Record<string, unknown>[]);
    const byId = new Map(mapped.map((p) => [p.id, p]));
    const out: Product[] = [];
    for (const id of ordered) {
      const p = byId.get(id);
      if (p) out.push(p);
    }
    return out;
  } catch (error) {
    console.error('[supabase-data] fetchProductsByIds:', error);
    return [];
  }
}

// ==================== SALONS ====================

export interface Salon {
  id: string;
  name: string;
  location: string;
  area: string;
  phone: string;
  specialties: string[];
  services: string[];
  description: string;
  image_url: string;
  price_range: string;
  rating: number;
  created_at: string;
}

export async function fetchAllSalons(): Promise<Salon[]> {
  const client = requireClient();
  if (!client) return [];

  try {
    const { data, error } = await client
      .from('salons')
      .select('*')
      .order('rating', { ascending: false });

    if (error) {
      console.error('Error fetching salons:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching salons:', error);
    return [];
  }
}

export async function fetchSalonsByArea(area: string): Promise<Salon[]> {
  const client = requireClient();
  if (!client) return [];

  try {
    const { data, error } = await client
      .from('salons')
      .select('*')
      .eq('area', area)
      .order('rating', { ascending: false});

    if (error) {
      console.error('Error fetching salons by area:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching salons by area:', error);
    return [];
  }
}

export async function fetchSalonsBySpecialty(specialty: string): Promise<Salon[]> {
  const client = requireClient();
  if (!client) return [];

  try {
    const { data, error } = await client
      .from('salons')
      .select('*')
      .contains('specialties', [specialty])
      .order('rating', { ascending: false });

    if (error) {
      console.error('Error fetching salons by specialty:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching salons by specialty:', error);
    return [];
  }
}

export async function fetchSalonById(id: string): Promise<Salon | null> {
  const client = requireClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('salons')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching salon:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching salon:', error);
    return null;
  }
}

// ==================== RETAILERS ====================

export interface Retailer {
  id: string;
  name: string;
  type: 'online' | 'beauty-supply' | 'pharmacy' | 'supermarket';
  website?: string;
  affiliate_link?: string;
  stock_reliability: 'high' | 'medium' | 'low';
  delivery_available: boolean;
  estimated_delivery_days?: number;
  verified: boolean;
  trust_score: number;
  locations?: RetailerLocation[];
}

export interface RetailerLocation {
  id: string;
  retailer_id: string;
  name: string;
  address: string;
  area: string;
  map_link?: string;
}

export async function fetchRetailersForProduct(productId: string): Promise<Retailer[]> {
  const client = requireClient();
  if (!client) return [];

  try {
    const { data, error } = await client
      .from('product_retailers')
      .select(`
        retailer_id,
        retailers (
          *,
          retailer_locations (*)
        )
      `)
      .eq('product_id', productId);

    if (error) {
      console.error('Error fetching retailers for product:', error);
      return [];
    }

    return data.map((item: any) => ({
      ...item.retailers,
      locations: item.retailers.retailer_locations
    })) || [];
  } catch (error) {
    console.error('Error fetching retailers for product:', error);
    return [];
  }
}


