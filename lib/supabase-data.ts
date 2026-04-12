// Supabase Data Fetching Functions
import { supabase } from './supabase';
import type { Product } from './products-new';

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

function requireClient(): import('@supabase/supabase-js').SupabaseClient | null {
  if (!supabase) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        '[supabase-data] Supabase client unavailable — set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY',
      );
    }
    return null;
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

const CATEGORY_SET = new Set(['extension', 'styling', 'care', 'tool']);
const QUALITY_SET = new Set(['budget', 'mid-range', 'premium']);

function transformSupabaseProduct(data: Record<string, unknown>): Product {
  const cat = data.category;
  const category = typeof cat === 'string' && CATEGORY_SET.has(cat)
    ? (cat as Product['category'])
    : 'care';

  const qual = data.quality;
  const quality =
    typeof qual === 'string' && QUALITY_SET.has(qual)
      ? (qual as Product['quality'])
      : 'mid-range';

  const hairTypesMerged = [...coerceTextArray(data.hair_types), ...coerceTextArray(data.compatible_hair_types)];
  const hairTypes = [...new Set(hairTypesMerged)];

  const est = Number(data.estimated_price);
  const estimatedPrice = Number.isFinite(est) ? est : 0;

  const imageUrlRaw =
    typeof data.image_url === 'string' && data.image_url.trim()
      ? data.image_url.trim()
      : typeof data.product_image === 'string' && data.product_image.trim()
        ? data.product_image.trim()
        : undefined;

  const imagesFromDb = Array.isArray(data.images) ? (data.images as string[]) : [];
  const imagesResolved =
    imagesFromDb.length > 0 ? imagesFromDb : imageUrlRaw ? [imageUrlRaw] : [];

  const minRaw = Number(data.price_min);
  const maxRaw = Number(data.price_max);
  const priceRange =
    Number.isFinite(minRaw) && Number.isFinite(maxRaw) ? { min: minRaw, max: maxRaw } : undefined;

  return {
    id: String(data.id ?? ''),
    name: String(data.name ?? 'Product'),
    brand: String(data.brand ?? ''),
    category,
    subCategory: String(data.sub_category ?? ''),
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
      (imagesFromDb[0] != null ? String(imagesFromDb[0]) : undefined) ??
      (data.product_image != null ? String(data.product_image) : undefined),
    stylesCompatible: Array.isArray(data.styles_compatible)
      ? (data.styles_compatible as string[])
      : [],
    routineStep:
      data.routine_step === 'daily' || data.routine_step === 'weekly' || data.routine_step === 'monthly'
        ? data.routine_step
        : undefined,
    ingredients: Array.isArray(data.ingredients) ? (data.ingredients as string[]) : [],
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


