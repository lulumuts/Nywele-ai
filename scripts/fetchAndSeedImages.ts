/**
 * Seed `products.image_url` from Open Beauty Facts search results,
 * with Pexels as a fallback image source.
 *
 * Usage: npx tsx scripts/fetchAndSeedImages.ts
 *
 * Requires (in `.env.local` and/or `.env`):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SERVICE_KEY (service role; same value as in Dashboard)
 *   PEXELS_API_KEY
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'node:path';

config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

const OPEN_BEAUTY_SEARCH = 'https://world.openbeautyfacts.org/cgi/search.pl';
const PEXELS_SEARCH = 'https://api.pexels.com/v1/search';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function loadEnv(): {
  supabaseUrl: string;
  serviceKey: string;
  pexelsApiKey: string;
} {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? '';
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.SUPABASE_SERVICE_KEY?.trim() ||
    '';
  const pexelsApiKey = process.env.PEXELS_API_KEY?.trim() ?? '';

  if (!supabaseUrl || !serviceKey) {
    throw new Error(
      'Missing Supabase env: set NEXT_PUBLIC_SUPABASE_URL and a service role key ' +
        '(SUPABASE_SERVICE_KEY or SUPABASE_SERVICE_ROLE_KEY) in .env.local or .env'
    );
  }
  return { supabaseUrl, serviceKey, pexelsApiKey };
}

const env = loadEnv();
console.log('Pexels API Key:', env.pexelsApiKey ? `${env.pexelsApiKey.slice(0, 8)}...` : 'MISSING');

type ProductRow = {
  id: string;
  brand: string | null;
  name: string | null;
};

type OFFSearchResponse = {
  products?: Array<{
    image_front_url?: string;
    image_url?: string;
  }>;
  count?: number;
};

type PexelsSearchResponse = {
  photos?: Array<{
    src?: {
      medium?: string;
      original?: string;
    };
  }>;
};

function buildSearchTerms(brand: string | null, name: string | null): string {
  const parts = [brand?.trim(), name?.trim()].filter((p) => p && p.length > 0);
  return parts.join(' ');
}

function pickImageUrl(product: NonNullable<OFFSearchResponse['products']>[number]): string | null {
  const raw = product.image_front_url || product.image_url;
  if (typeof raw === 'string' && /^https?:\/\//i.test(raw)) return raw.trim();
  return null;
}

/**
 * Enforce a 300ms delay between ALL external requests (OFF + Pexels).
 */
let lastExternalRequestAt = 0;
async function throttleExternalRequests(): Promise<void> {
  const now = Date.now();
  const waitMs = Math.max(0, 300 - (now - lastExternalRequestAt));
  if (waitMs > 0) await sleep(waitMs);
  lastExternalRequestAt = Date.now();
}

async function searchOpenBeautyFactsImage(brand: string | null, name: string | null): Promise<string | null> {
  const terms = buildSearchTerms(brand, name);
  if (!terms) return null;

  await throttleExternalRequests();

  const params = new URLSearchParams({
    search_terms: terms,
    search_simple: '1',
    action: 'process',
    json: '1',
    page_size: '5',
  });

  const url = `${OPEN_BEAUTY_SEARCH}?${params.toString()}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'NyweleAI/1.0 (image seeding; local script)',
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(`Open Beauty Facts HTTP ${res.status} ${res.statusText}`);
  }

  const json = (await res.json()) as OFFSearchResponse;
  const products = json.products ?? [];
  for (const p of products) {
    const img = pickImageUrl(p);
    if (img) return img;
  }
  return null;
}

async function searchPexelsImage(
  brand: string | null,
  name: string | null,
  pexelsApiKey: string
): Promise<string | null> {
  const terms = buildSearchTerms(brand, name);
  if (!terms || !pexelsApiKey) return null;

  await throttleExternalRequests();

  const params = new URLSearchParams({
    query: `${terms} product`,
    per_page: '1',
    orientation: 'square',
  });

  const url = `${PEXELS_SEARCH}?${params.toString()}`;
  const res = await fetch(url, {
    headers: {
      Authorization: pexelsApiKey,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Pexels HTTP ${res.status} ${res.statusText} ${body.slice(0, 200)}`.trim());
  }

  const json = (await res.json()) as PexelsSearchResponse;
  const photo = json.photos?.[0];
  const link = photo?.src?.medium || photo?.src?.original;
  if (typeof link === 'string' && /^https?:\/\//i.test(link)) return link.trim();
  return null;
}

async function fetchAllMissingImageRows(
  supabase: ReturnType<typeof createClient>
): Promise<ProductRow[]> {
  const pageSize = 1000;
  const all: ProductRow[] = [];
  let start = 0;

  for (;;) {
    const { data, error } = await supabase
      .from('products')
      .select('id, brand, name')
      .is('image_url', null)
      .order('id', { ascending: true })
      .range(start, start + pageSize - 1);

    if (error) throw new Error(`Supabase select failed: ${error.message}`);

    const batch = (data ?? []) as ProductRow[];
    all.push(...batch);
    if (batch.length < pageSize) break;
    start += pageSize;
  }

  return all;
}

async function main() {
  const { supabaseUrl, serviceKey, pexelsApiKey } = loadEnv();
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const summary = {
    processed: 0,
    skippedVarious: 0,
    updated: 0,
    noImage: 0,
    failed: 0,
  };

  const rows = await fetchAllMissingImageRows(supabase);
  console.log(`Loaded ${rows.length} row(s) with image_url IS NULL.\n`);

  if (!pexelsApiKey) {
    console.log('Note: PEXELS_API_KEY not set — Pexels fallback will be skipped.\n');
  }

  for (const row of rows) {
    summary.processed++;
    const idLabel = row.id;

    if ((row.brand ?? '').trim() === 'Various') {
      summary.skippedVarious++;
      console.log(`[SKIP various] id=${idLabel} brand=${row.brand ?? ''} name=${row.name ?? ''}`);
      continue;
    }

    try {
      let imageUrl = await searchOpenBeautyFactsImage(row.brand, row.name);

      if (!imageUrl) {
        imageUrl = await searchPexelsImage(row.brand, row.name, pexelsApiKey);
      }

      if (!imageUrl) {
        summary.noImage++;
        console.log(`[no image] id=${idLabel} brand=${row.brand ?? ''} name=${row.name ?? ''}`);
        continue;
      }

      const { error: updateError } = await supabase
        .from('products')
        .update({ image_url: imageUrl })
        .eq('id', row.id);

      if (updateError) {
        summary.failed++;
        console.error(`[FAIL update] id=${idLabel} — ${updateError.message}`);
        continue;
      }

      summary.updated++;
      console.log(`[OK] id=${idLabel} — ${imageUrl}`);
    } catch (err) {
      summary.failed++;
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[FAIL] id=${idLabel} — ${msg}`);
    }
  }

  console.log('\n--- Summary ---');
  console.log(`Processed:          ${summary.processed}`);
  console.log(`Skipped (Various):  ${summary.skippedVarious}`);
  console.log(`Updated:            ${summary.updated}`);
  console.log(`No image found:     ${summary.noImage}`);
  console.log(`Failed:             ${summary.failed}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});