'use client';

import Link from 'next/link';
import { ArrowLeft, ScanBarcode } from 'lucide-react';
import {
  BottomNavHubShell,
  StyleCheckHubWhiteCard,
  bottomNavHubMainStyleCheckGridClass,
  styleCheckHubWhiteCardOuterProductCompatClass,
  styleCheckHubWhiteCardShellProductCompatClass,
} from '@/app/components/BottomNavHubLayout';

/** Align with dashboard primary copy (`app/dashboard/page.tsx` → `DASHBOARD_CONTAINER_TEXT`). */
const DASH_TEXT = '#7A3500';

export default function ProductScanPage() {
  return (
    <BottomNavHubShell mainAreaClassName={bottomNavHubMainStyleCheckGridClass}>
      <div className="mb-4 flex flex-col md:mb-6">
        <Link
          href="/products"
          className="mt-2 inline-flex w-fit items-center gap-2 text-sm font-medium transition-colors hover:opacity-80 md:mt-3"
          style={{ color: DASH_TEXT, fontFamily: 'Bricolage Grotesque, sans-serif' }}
        >
          <ArrowLeft className="h-5 w-5" aria-hidden />
          Back
        </Link>
        <h1
          className="mt-4 min-w-0 text-3xl font-bold md:mt-6 md:text-4xl"
          style={{ color: DASH_TEXT, fontFamily: 'Caprasimo, serif' }}
        >
          Scan a barcode
        </h1>
      </div>

      <p
        className="mb-2 max-w-2xl text-base md:mb-6 md:text-lg"
        style={{ color: DASH_TEXT, fontFamily: 'Bricolage Grotesque, sans-serif' }}
      >
        Point your camera at a product barcode to look it up and see compatibility with your hair profile.
      </p>

      <StyleCheckHubWhiteCard
        outerClassName={styleCheckHubWhiteCardOuterProductCompatClass}
        shellClassName={styleCheckHubWhiteCardShellProductCompatClass}
        surfaceStyle={{
          background: '#FFF9F4',
          color: DASH_TEXT,
          border: '2px solid rgba(122, 53, 0, 0.25)',
        }}
      >
        <div className="flex min-h-0 flex-1 flex-col gap-4">
          <div
            className="rounded-2xl p-5"
            style={{
              background: '#FFFCF3',
              border: '1px solid rgba(122, 53, 0, 0.18)',
            }}
          >
            <h3
              className="mb-2 text-base font-bold"
              style={{ color: DASH_TEXT, fontFamily: 'Caprasimo, serif' }}
            >
              Camera scanner
            </h3>
            <p
              className="m-0 text-sm leading-relaxed"
              style={{ color: DASH_TEXT, fontFamily: 'Bricolage Grotesque, sans-serif' }}
            >
              Barcode scanning will be available here soon. Until then, use{' '}
              <Link
                href="/products"
                className="font-semibold underline underline-offset-2 hover:opacity-80"
                style={{ color: DASH_TEXT }}
              >
                Product Compatibility
              </Link>{' '}
              to search by name or brand.
            </p>
          </div>

          <div
            className="flex min-h-[min(46dvh,22rem)] flex-1 items-center justify-center rounded-2xl border border-dashed border-[rgba(122,53,0,0.35)] p-8 md:min-h-[min(52dvh,28rem)]"
            style={{ background: 'rgba(122, 53, 0, 0.04)' }}
          >
            <div className="text-center">
              <ScanBarcode
                className="mx-auto mb-3 h-12 w-12 opacity-50 md:h-14 md:w-14"
                style={{ color: DASH_TEXT }}
                aria-hidden
              />
              <p
                className="m-0 text-sm"
                style={{ color: DASH_TEXT, fontFamily: 'Bricolage Grotesque, sans-serif' }}
              >
                Preview area
              </p>
            </div>
          </div>
        </div>
      </StyleCheckHubWhiteCard>
    </BottomNavHubShell>
  );
}
