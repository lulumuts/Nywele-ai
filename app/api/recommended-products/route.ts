import { NextRequest, NextResponse } from 'next/server';
import { fetchCustomerRecommendedCarousel } from '@/lib/supabase-customer-products';
import { fetchCatalogCarouselProducts } from '@/lib/supabase-data';

export const dynamic = 'force-dynamic';

/**
 * GET /api/recommended-products?email=&hairType=&limit=6
 * 1) Personalized rows from `customer_products` when present
 * 2) Else `public.products` (hair-type match when possible) for dashboard carousel
 */
export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email')?.trim() || null;
  const hairType = request.nextUrl.searchParams.get('hairType')?.trim() || null;
  const limitRaw = request.nextUrl.searchParams.get('limit');
  const limit = limitRaw != null ? Number(limitRaw) : 6;
  const lim = Number.isFinite(limit) ? limit : 6;

  try {
    const fromCustomer = await fetchCustomerRecommendedCarousel({
      customerEmail: email,
      hairType,
      limit: lim,
    });

    if (fromCustomer.length > 0) {
      return NextResponse.json({
        ok: true,
        source: 'customer' as const,
        products: fromCustomer,
        debug:
          process.env.NODE_ENV === 'development'
            ? {
                schema: process.env.NEXT_PUBLIC_SUPABASE_CUSTOMER_PRODUCTS_SCHEMA || 'customer_products',
                table: process.env.NEXT_PUBLIC_SUPABASE_CUSTOMER_PRODUCTS_TABLE || 'customer_products',
                email,
                hairType,
              }
            : undefined,
      });
    }

    const fromCatalog = await fetchCatalogCarouselProducts({ hairType, limit: lim });
    return NextResponse.json({
      ok: true,
      source: fromCatalog.length > 0 ? ('catalog' as const) : ('none' as const),
      products: fromCatalog,
      debug:
        process.env.NODE_ENV === 'development'
          ? {
              fallback: 'public.products',
              email,
              hairType,
            }
          : undefined,
    });
  } catch (e) {
    console.error('[api/recommended-products]', e);
    return NextResponse.json({
      ok: false,
      products: [] as const,
      error: e instanceof Error ? e.message : 'Failed to load recommendations',
    });
  }
}
