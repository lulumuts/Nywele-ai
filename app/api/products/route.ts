import { NextRequest, NextResponse } from 'next/server';
import { fetchAllProducts, fetchProductsForHairType } from '@/lib/supabase-data';
import { MOCK_PRODUCTS } from '@/lib/products';

export const dynamic = 'force-dynamic';

function mockForHairType(hairType: string) {
  const n = hairType.trim().toLowerCase();
  return MOCK_PRODUCTS.filter((p) =>
    p.suitableFor.hairTypes.some((h) => h.trim().toLowerCase() === n),
  );
}

/**
 * GET /api/products — list products (optional ?hairType=4c) from Supabase with mock fallback.
 */
export async function GET(request: NextRequest) {
  const hairType = request.nextUrl.searchParams.get('hairType')?.trim();

  try {
    if (hairType) {
      const products = await fetchProductsForHairType(hairType);
      if (products.length > 0) {
        return NextResponse.json({
          ok: true,
          source: 'supabase' as const,
          products,
        });
      }

      const fullCatalog = await fetchAllProducts();
      if (fullCatalog.length > 0) {
        return NextResponse.json({
          ok: true,
          source: 'supabase' as const,
          products: fullCatalog,
          message:
            'No products matched your hair type tags in the database; showing the full catalog from Supabase.',
        });
      }

      return NextResponse.json({
        ok: true,
        source: 'mock' as const,
        message: 'Supabase unavailable or empty; using sample catalog for this hair type',
        products: mockForHairType(hairType),
      });
    }

    const products = await fetchAllProducts();
    if (products.length > 0) {
      return NextResponse.json({
        ok: true,
        source: 'supabase' as const,
        products,
      });
    }

    return NextResponse.json({
      ok: true,
      source: 'mock' as const,
      message: 'Supabase returned no rows; showing sample catalog',
      products: MOCK_PRODUCTS,
    });
  } catch (e) {
    console.error('[api/products]', e);
    return NextResponse.json(
      {
        ok: false,
        error: e instanceof Error ? e.message : 'Failed to load products',
        products: hairType ? mockForHairType(hairType) : MOCK_PRODUCTS,
        source: 'mock' as const,
      },
      { status: 200 },
    );
  }
}
