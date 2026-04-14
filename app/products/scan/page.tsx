'use client';

import Link from 'next/link';
import { ArrowLeft, ScanBarcode } from 'lucide-react';
import {
  BottomNavHubShell,
  StyleCheckHubWhiteCard,
  bottomNavHubMainStyleCheckGridClass,
} from '@/app/components/BottomNavHubLayout';

export default function ProductScanPage() {
  return (
    <BottomNavHubShell mainAreaClassName={bottomNavHubMainStyleCheckGridClass}>
      <div className="mb-6 flex flex-col md:mb-8">
        {/* Same rhythm as Style Check grid: action row first (highest), right-aligned */}
        <div className="flex justify-end">
          <div
            className="inline-flex shrink-0 items-center gap-2 border-0 bg-transparent p-0 text-sm font-semibold shadow-none md:text-base"
            style={{
              color: '#C17208',
              fontFamily: 'Bricolage Grotesque, sans-serif',
            }}
          >
            <ScanBarcode className="h-5 w-5 shrink-0" aria-hidden style={{ color: '#C17208' }} />
            Scan barcode
          </div>
        </div>
        <Link
          href="/products"
          className="mt-4 inline-flex w-fit items-center gap-2 text-sm font-medium text-[#C17208] transition-colors hover:opacity-80 md:mt-5"
          style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
        >
          <ArrowLeft className="h-5 w-5" aria-hidden />
          Back
        </Link>
        <h1
          className="mt-6 min-w-0 text-3xl font-bold md:mt-8 md:text-4xl"
          style={{ color: '#C17208', fontFamily: 'Caprasimo, serif' }}
        >
          Scan a barcode
        </h1>
      </div>

      <p
        className="mb-2 max-w-2xl text-base md:mb-6 md:text-lg"
        style={{ color: '#C17208', fontFamily: 'Bricolage Grotesque, sans-serif' }}
      >
        Point your camera at a product barcode to look it up and see compatibility with your hair profile.
      </p>

      <StyleCheckHubWhiteCard
        outerClassName="flex min-h-0 flex-1 flex-col justify-start pt-2 md:min-h-0 md:flex-1 md:justify-start md:pt-0"
        shellClassName="md:min-h-[min(70dvh,calc(100dvh-13rem))]"
      >
        <div className="flex min-h-0 flex-1 flex-col gap-4">
          <div
            className="rounded-2xl p-5"
            style={{
              background: '#FFFCF3',
              border: '1px solid rgba(193, 114, 8, 0.18)',
            }}
          >
            <h3
              className="mb-2 text-base font-bold"
              style={{ color: '#C17208', fontFamily: 'Caprasimo, serif' }}
            >
              Camera scanner
            </h3>
            <p
              className="m-0 text-sm leading-relaxed"
              style={{ color: '#C17208', fontFamily: 'Bricolage Grotesque, sans-serif' }}
            >
              Barcode scanning will be available here soon. Until then, use{' '}
              <Link href="/products" className="font-semibold underline underline-offset-2 hover:opacity-80">
                Product Compatibility
              </Link>{' '}
              to search by name or brand.
            </p>
          </div>

          <div
            className="flex min-h-[min(48dvh,18rem)] flex-1 items-center justify-center rounded-2xl border border-dashed border-[rgba(193,114,8,0.35)] p-8 md:min-h-[min(52dvh,22rem)]"
            style={{ background: 'rgba(193, 114, 8, 0.04)' }}
          >
            <div className="text-center">
              <ScanBarcode
                className="mx-auto mb-3 h-12 w-12 opacity-50 md:h-14 md:w-14"
                style={{ color: '#C17208' }}
                aria-hidden
              />
              <p
                className="m-0 text-sm"
                style={{ color: '#C17208', fontFamily: 'Bricolage Grotesque, sans-serif' }}
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
