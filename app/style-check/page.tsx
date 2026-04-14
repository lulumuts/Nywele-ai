'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Camera } from 'lucide-react';
import BottomNav from '@/app/components/BottomNav';
import { StyleCheckHubWhiteCard } from '@/app/components/BottomNavHubLayout';
import { STYLE_CARD_IMAGE_BY_SLUG } from '@/lib/style-check-card-images';
import { readHairHealthScoreFromLocalProfile } from '@/lib/style-check-health-score';

/** Upload flow only: default hub outer uses `flex-1` + `justify-end` on mobile, which pins the card to the bottom and leaves a huge gap under the hero. Keep the card directly under the subtitle instead. */
const STYLE_CHECK_UPLOAD_OUTER_CLASS =
  'flex min-h-0 w-full flex-none flex-col justify-start pt-2 md:pt-0 mt-2 md:mt-4 lg:mt-6';

export type StyleLibraryRow = { slug: string; name: string };

const FALLBACK_STYLES: StyleLibraryRow[] = [
  { slug: 'short-afro', name: 'Short Afro' },
  { slug: 'bantu-knots', name: 'Bantu Knots' },
  { slug: 'natural-afro', name: 'Natural Afro' },
  { slug: 'lines', name: 'Lines' },
  { slug: 'box-braids', name: 'Box Braids' },
  { slug: 'passion-twists', name: 'Passion Twists' },
  { slug: 'natural-locs', name: 'Natural Locs' },
  { slug: 'sister-locs', name: 'Sister Locs' },
  { slug: 'permed-hair', name: 'Permed Hair' },
  { slug: 'lace-front-wig', name: 'Lace Front Wig' },
];

function slugFromName(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-');
}

export default function StyleCheckPage() {
  const router = useRouter();
  const [showGrid, setShowGrid] = useState(true);
  const [styles, setStyles] = useState<StyleLibraryRow[]>(FALLBACK_STYLES);
  /** 0–100; shown as compatibility % — same underlying value as Dashboard → Metrics health score when a scan exists. */
  const [healthScore, setHealthScore] = useState<number | null>(null);

  const refreshHealthScore = useCallback(() => {
    setHealthScore(readHairHealthScoreFromLocalProfile());
  }, []);

  useEffect(() => {
    refreshHealthScore();
    const onFocus = () => refreshHealthScore();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [refreshHealthScore]);

  const fetchStyles = useCallback(() => {
    fetch('/api/styles')
      .then((res) => {
        if (!res.ok) throw new Error('styles');
        return res.json();
      })
      .then((body: { styles?: { name: string }[] }) => {
        const supabaseStyles = body.styles;
        if (supabaseStyles && supabaseStyles.length > 0) {
          setStyles(
            supabaseStyles.map((s) => ({
              slug: slugFromName(s.name),
              name: s.name,
            })),
          );
        } else {
          setStyles(FALLBACK_STYLES);
        }
      })
      .catch(() => {
        setStyles(FALLBACK_STYLES);
      });
  }, []);

  const openLibraryGrid = useCallback(() => {
    setShowGrid(true);
    fetchStyles();
  }, [fetchStyles]);

  useEffect(() => {
    fetchStyles();
  }, [fetchStyles]);

  return (
    <div className="relative flex h-dvh max-h-dvh flex-col overflow-hidden bg-transparent">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Caprasimo&family=Bricolage+Grotesque:wght@400;500;600&display=swap');
      `}</style>
      <BottomNav />

      <div
        className={`bottom-nav-hub-main flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden px-7 sm:px-8 md:px-14 lg:px-16 ${
          showGrid
            ? 'pt-[calc(0.35rem+env(safe-area-inset-top,0px))] md:pt-[calc(0.5rem+env(safe-area-inset-top,0px))]'
            : 'pt-32 md:pt-40 lg:pt-44'
        }`}
      >
        <div className="mx-auto w-full max-w-6xl flex flex-col px-3 pb-4 sm:px-4 md:px-6 lg:px-8">
          {showGrid ? (
            <div className="mb-6 flex flex-col md:mb-8">
              <div className="mt-10 flex justify-end md:mt-12">
                <button
                  type="button"
                  onClick={() => setShowGrid(false)}
                  className="inline-flex shrink-0 items-center gap-2 border-0 bg-transparent p-0 text-sm font-semibold shadow-none transition-opacity hover:opacity-80 focus:outline-none focus-visible:underline md:text-base"
                  style={{
                    color: '#C17208',
                    fontFamily: 'Bricolage Grotesque, sans-serif',
                  }}
                >
                  <Camera className="h-5 w-5 shrink-0" aria-hidden style={{ color: '#C17208' }} />
                  Scan a style
                </button>
              </div>
              <h1
                className="mt-10 min-w-0 text-3xl font-bold md:mt-12 md:text-4xl"
                style={{
                  color: '#C17208',
                  fontFamily: 'Caprasimo, serif',
                }}
              >
                Style Check
              </h1>
            </div>
          ) : (
            <div className="mb-2 flex items-start justify-between gap-4">
              <h1
                className="min-w-0 flex-1 text-3xl font-bold md:text-4xl"
                style={{
                  color: '#C17208',
                  fontFamily: 'Caprasimo, serif',
                }}
              >
                Feeling Inspired?
              </h1>
            </div>
          )}
          <p
            className={`text-base md:mb-6 ${showGrid ? 'mb-5 mt-3 md:mb-6 md:mt-4' : 'mb-2'}`}
            style={{
              color: '#C17208',
              fontFamily: 'Bricolage Grotesque, sans-serif',
            }}
          >
            {showGrid
              ? healthScore !== null
                ? 'Select a style for your next look. The percentage on each card is your compatibility score — aligned with your dashboard metrics (latest Hair care scan).'
                : 'Select a style to explore details. Complete a Hair care scan to see your compatibility score here; it matches your dashboard once you have a scan.'
              : 'Upload your image below for a compatibility and maintenance check.'}
          </p>

          {showGrid ? (
            <div
              className="mt-5 px-6 pb-6 pt-6 md:mt-7 md:px-8 md:pb-8 md:pt-8 lg:mt-8"
              style={{
                background: 'transparent',
                color: '#C17208',
              }}
            >
              <div className="grid w-full auto-rows-min grid-cols-2 gap-4 md:gap-6 lg:flex lg:min-h-0 lg:flex-nowrap lg:items-start lg:gap-6 lg:overflow-x-auto lg:overflow-y-visible lg:pb-2">
                {styles.map((style) => (
                    <button
                      key={style.slug}
                      type="button"
                      onClick={() => router.push(`/style-check/${style.slug}`)}
                      className="flex min-h-0 flex-col overflow-hidden rounded-[32px] border-2 border-solid border-[rgba(193,114,8,0.35)] bg-transparent text-left shadow-none transition-[border-width,border-color,background-color] duration-200 hover:border-[3px] hover:border-[#C17208] hover:bg-[rgba(193,114,8,0.2)] active:border-[3px] active:border-[#C17208] active:bg-[rgba(193,114,8,0.2)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C17208] focus-visible:ring-offset-2 lg:shrink-0 lg:basis-[calc((100%-1.5rem)/2-3.625rem)]"
                    >
                      <div className="px-4 pt-5 text-center md:px-5 md:pt-6 lg:pt-6">
                        <h3
                          className="text-xl font-normal not-italic leading-tight tracking-wide md:text-2xl md:tracking-wider"
                          style={{ color: '#C17208', fontFamily: 'Caprasimo, serif' }}
                        >
                          {style.name}
                        </h3>
                      </div>
                      <div
                        className="flex aspect-[3/4] w-full min-h-0 items-center justify-center px-5 py-4 lg:aspect-[6/7] lg:px-5 lg:py-2"
                        style={{ background: 'transparent' }}
                      >
                        {STYLE_CARD_IMAGE_BY_SLUG[style.slug] ? (
                          <img
                            src={STYLE_CARD_IMAGE_BY_SLUG[style.slug]}
                            alt={style.name}
                            className={
                              style.slug === 'sister-locs'
                                ? 'mx-auto block h-80 w-80 max-h-full max-w-full shrink-0 object-contain object-center sm:h-[22rem] sm:w-[22rem] md:h-[28rem] md:w-[28rem] lg:h-[30rem] lg:w-[30rem]'
                                : 'mx-auto block h-72 w-72 max-h-full max-w-full shrink-0 object-contain object-center sm:h-80 sm:w-80 md:h-96 md:w-96'
                            }
                          />
                        ) : (
                          <svg
                            className="mx-auto block h-20 w-20 shrink-0 opacity-80 md:h-24 md:w-24"
                            viewBox="0 0 81 77"
                            fill="none"
                            style={{ color: '#C17208' }}
                            aria-hidden
                          >
                            <path
                              d="M26.4168 1.50037C26.3153 1.546 18.9202 4.51235 16.9078 5.85052C14.8953 7.18868 12.4202 8.01234 10.9202 9.51236C9.42023 11.0124 8.92019 11.5124 6.92021 14.0124C4.92022 16.5124 3.29872 21.0124 2.42021 24.0124C1.54169 27.0124 1.41483 30.8501 1.54169 33.0124C1.67903 35.3533 2.35945 38.7601 4.92022 43.5124C6.74414 46.8972 11.2442 49.4796 13.8322 49.996C16.4202 50.5124 18.6592 51.5876 27.3516 51.4065C30.5874 51.3391 33.5272 50.3174 37.6659 48.861C42.8112 47.0503 45.8731 45.2287 46.7952 44.6319C49.4202 42.9329 50.6765 40.1097 51.39 37.8C51.9398 36.0201 51.1792 34.1978 50.0834 32.8321C48.2852 30.5912 43.5142 29.5747 38.9202 33.5124C35.4202 36.5124 35.0981 37.9497 33.2465 42.0648C31.0265 46.9984 30.649 50.9027 30.5387 52.7799C30.3967 55.1959 30.8062 57.0755 31.4161 58.8381C32.5781 62.1963 34.0986 64.9976 35.3568 66.8227C38.8309 71.8617 42.3911 73.0787 44.3932 73.7446C47.1911 74.6752 52.6891 73.4 57.825 71.8084C61.138 70.7816 65.6434 68.5963 68.0727 67.405C70.5019 66.2138 70.6566 65.9003 70.7175 65.5417C70.8435 64.7991 70.4997 63.933 69.9976 63.1524C69.7559 62.7767 69.3057 62.6225 68.9462 62.5451C66.9408 62.1136 64.4581 64.1761 63.6793 65.2848C62.124 67.499 65.2366 70.8731 66.8107 72.2277C69.7286 73.768 71.0565 74.011 72.9323 74.0274C74.2194 74.016 76.1871 73.9648 78.5749 73.4734"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                            />
                          </svg>
                        )}
                      </div>
                      <div className="space-y-1 px-4 pb-3 text-right md:px-5 md:pb-4 lg:pt-1 lg:pb-4">
                        <div className="flex justify-end">
                          <div
                            className="inline-block rounded-full px-3 py-1 text-sm font-bold tabular-nums"
                            style={{
                              background: 'rgba(193, 114, 8, 0.15)',
                              color: '#C17208',
                              fontFamily: 'Bricolage Grotesque, sans-serif',
                            }}
                          >
                            {healthScore !== null ? `${healthScore}%` : '—'}
                          </div>
                        </div>
                        <p
                          className="text-xs"
                          style={{ color: '#C17208', fontFamily: 'Bricolage Grotesque, sans-serif' }}
                        >
                          Compatibility score
                        </p>
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          ) : (
            <StyleCheckHubWhiteCard outerClassName={STYLE_CHECK_UPLOAD_OUTER_CLASS}>
              <div className="flex w-full items-center justify-center py-2 md:py-4">
                <div
                  className="w-full max-w-xs rounded-2xl p-5 sm:max-w-sm md:max-w-4xl md:p-6"
                  style={{
                    background: '#FFFCF3',
                    border: '1px solid rgba(193, 114, 8, 0.25)',
                  }}
                >
                  <p
                    className="mb-5 text-center text-base md:mb-6 md:text-lg"
                    style={{ color: '#C17208', fontFamily: 'Bricolage Grotesque, sans-serif' }}
                  >
                    Upload a clear photo of your hair for AI-powered analysis.
                  </p>
                  <button
                    type="button"
                    onClick={() => router.push('/style-advisor')}
                    className="mx-auto flex aspect-square w-full max-w-[min(100%,17.5rem)] flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all hover:bg-opacity-80 md:max-w-xs"
                    style={{ borderColor: 'rgba(193, 114, 8, 0.45)', background: 'rgba(193, 114, 8, 0.06)' }}
                  >
                    <Camera className="mb-2 h-11 w-11 shrink-0 md:mb-3 md:h-14 md:w-14" style={{ color: '#C17208' }} />
                    <p
                      className="px-3 text-center text-xs leading-snug md:px-4 md:text-sm"
                      style={{ color: '#C17208', fontFamily: 'Bricolage Grotesque, sans-serif' }}
                    >
                      Click to upload or drag and drop PNG, JPG or JPEG (max. 10MB)
                    </p>
                  </button>
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-center gap-3 self-center pt-2 pb-6 text-center md:pb-8">
                <p
                  className="text-base font-medium md:text-lg"
                  style={{ color: '#C17208', fontFamily: 'Bricolage Grotesque, sans-serif' }}
                >
                  Don&apos;t know what you want yet?
                </p>
                <button
                  type="button"
                  onClick={openLibraryGrid}
                  className="w-full max-w-sm rounded-xl py-3 text-sm font-semibold transition-all md:max-w-md md:text-base"
                  style={{
                    background: 'rgba(193, 114, 8, 0.12)',
                    color: '#C17208',
                    border: '2px solid rgba(193, 114, 8, 0.45)',
                    fontFamily: 'Bricolage Grotesque, sans-serif',
                  }}
                >
                  Browse our library
                </button>
              </div>
            </StyleCheckHubWhiteCard>
          )}
        </div>
      </div>
    </div>
  );
}

