/**
 * Reads personalized product rows from a dedicated Postgres schema (e.g. `customer_products`).
 * Expose the schema in Supabase Dashboard → Settings → API → Exposed schemas.
 *
 * Expected table shape (flexible):
 * - `product_id` (uuid) → `public.products.id`, optional `sort_order`
 * - Optional filters: `customer_email`, `hair_type` / `hair_types`
 * - Or denormalized: `name`, `brand`, `description`, `estimated_price`, `currency`, `image_url`
 */

import { supabase } from './supabase';
import type { ExplorerCarouselProduct } from './productExplorerCatalog';
import { productToExplorerCarousel } from './productExplorerCatalog';
import { fetchProductsByIds } from './supabase-data';

function requireClient(): import('@supabase/supabase-js').SupabaseClient | null {
  if (!supabase) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        '[customer-products] Supabase client unavailable — set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY',
      );
    }
    return null;
  }
  return supabase;
}

export function getCustomerProductsSchema(): string {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_CUSTOMER_PRODUCTS_SCHEMA?.trim() || 'customer_products'
  );
}

export function getCustomerProductsTable(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_CUSTOMER_PRODUCTS_TABLE?.trim() || 'customer_products';
}

function rowToCarousel(row: Record<string, unknown>): ExplorerCarouselProduct | null {
  const name = row.name ?? row.product_name;
  const brand = row.brand ?? row.product_brand;
  if (typeof name !== 'string' || typeof brand !== 'string') return null;
  const purposeRaw =
    typeof row.purpose === 'string'
      ? row.purpose
      : typeof row.description === 'string'
        ? row.description
        : '';
  const purpose = purposeRaw.trim() || String(name);
  const imageUrl =
    typeof row.image_url === 'string'
      ? row.image_url
      : typeof row.product_image === 'string'
        ? row.product_image
        : null;
  const currency = typeof row.currency === 'string' ? row.currency : 'KES';
  const rawPrice = row.estimated_price ?? row.price;
  const amount = typeof rawPrice === 'number' ? rawPrice : Number(rawPrice);
  return {
    brand,
    name,
    purpose: purpose.slice(0, 500),
    imageUrl,
    pricing: Number.isFinite(amount) && amount > 0 ? { currency, amount } : undefined,
  };
}

function hairTypeMatchesRow(row: Record<string, unknown>, hairType: string): boolean {
  const ht = row.hair_type ?? row.hair_types;
  if (ht == null) return true;
  if (Array.isArray(ht)) {
    return ht.some((t) => String(t).trim().toLowerCase() === hairType);
  }
  return String(ht).trim().toLowerCase() === hairType;
}

export async function fetchCustomerRecommendedCarousel(options: {
  customerEmail?: string | null;
  hairType?: string | null;
  limit?: number;
}): Promise<ExplorerCarouselProduct[]> {
  const client = requireClient();
  if (!client) return [];
  const db = client;

  const schema = getCustomerProductsSchema();
  const table = getCustomerProductsTable();
  const limit = Math.min(Math.max(options.limit ?? 6, 1), 24);
  const email = options.customerEmail?.trim().toLowerCase() || null;
  const hairType = options.hairType?.trim().toLowerCase() || null;

  const schemaCandidates = [...new Set([schema, 'customer_products', 'customer-products'])];
  const tableCandidates = [...new Set([table, 'customer_products', 'customer-products'])];

  async function loadRows(): Promise<Record<string, unknown>[]> {
    const cap = Math.max(limit * 6, limit);
    const errors: string[] = [];

    async function queryOnce(
      usePublic: boolean,
      sch: string | null,
      tbl: string,
    ): Promise<Record<string, unknown>[] | null> {
      const base = usePublic
        ? db.from(tbl).select('*')
        : db.schema(sch as string).from(tbl).select('*');
      let res = await base.order('sort_order', { ascending: true });
      if (res.error?.message?.includes('sort_order') || res.error?.code === '42703') {
        res = usePublic
          ? await db.from(tbl).select('*')
          : await db.schema(sch as string).from(tbl).select('*');
      }
      if (res.error) {
        errors.push(`${usePublic ? 'public' : sch}.${tbl}: ${res.error.message}`);
        return null;
      }
      return ((res.data || []) as Record<string, unknown>[]).slice(0, cap);
    }

    for (const sch of schemaCandidates) {
      for (const tbl of tableCandidates) {
        const rows = await queryOnce(false, sch, tbl);
        if (rows !== null) return rows;
      }
    }

    // Table may live on `public` only (no separate schema)
    for (const tbl of tableCandidates) {
      const rows = await queryOnce(true, null, tbl);
      if (rows !== null) return rows;
    }

    console.warn(
      '[customer-products] No rows loaded — check exposed schema(s), table name, and RLS.',
      {
        schemas: schemaCandidates,
        tables: tableCandidates,
        lastError: errors[errors.length - 1] || null,
      },
    );
    return [];
  }

  const rows = await loadRows();
  if (!rows.length) return [];

  let filtered = rows;

  if (email) {
    const byEmail = filtered.filter(
      (r) => String(r.customer_email ?? r.email ?? '').toLowerCase() === email,
    );
    if (byEmail.length) filtered = byEmail;
  }

  if (hairType && filtered.some((r) => r.hair_type != null || r.hair_types != null)) {
    const byHair = filtered.filter((r) => hairTypeMatchesRow(r, hairType));
    if (byHair.length) filtered = byHair;
  }

  const sliced = filtered.slice(0, limit);

  const idsOrdered: string[] = [];
  for (const row of sliced) {
    const pidRaw = row.product_id ?? row.products_id ?? row.product;
    const pid = typeof pidRaw === 'string' ? pidRaw : pidRaw != null ? String(pidRaw) : '';
    if (pid) idsOrdered.push(pid);
  }

  const productsById =
    idsOrdered.length > 0
      ? new Map((await fetchProductsByIds(idsOrdered)).map((p) => [p.id, p]))
      : new Map();

  const out: ExplorerCarouselProduct[] = [];

  for (const row of sliced) {
    const pidRaw = row.product_id ?? row.products_id ?? row.product;
    const pid = typeof pidRaw === 'string' ? pidRaw : pidRaw != null ? String(pidRaw) : '';

    if (pid) {
      const p = productsById.get(pid);
      if (p) {
        out.push(productToExplorerCarousel(p));
        continue;
      }
    }

    const denorm = rowToCarousel(row);
    if (denorm) out.push(denorm);
  }

  return out;
}
