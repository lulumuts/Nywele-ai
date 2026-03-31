'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Loader } from 'lucide-react';
import BottomNav from '@/app/components/BottomNav';
import AccordionSection from '@/app/components/AccordionSection';
import { getStyleByName, getProductsForStyle, getAllStyles } from '@/lib/supabase-styles';
import { findStyleImage } from '@/lib/imageLibrary';

function slugFromName(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-');
}

function nameFromSlug(slug: string): string {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

const STYLE_DATA: Record<string, { name: string; score: number; thingsToKnow: string[]; whyWorks: string[]; careInstructions: string; productDetails: string }> = {
  'natural-afro': {
    name: 'Natural Afro',
    score: 6,
    thingsToKnow: ['Duration: 6-8 weeks', 'Maintenance: Weekly moisture', 'Cost estimate: 1500 KES'],
    whyWorks: ['Good for 4c hair type', 'Low tension (protects edges)', 'Works with high porosity'],
    careInstructions: 'Moisturise daily with a lightweight leave-in. Protect at night with a satin bonnet. Deep condition weekly. Avoid over-manipulation.',
    productDetails: 'Recommended: Leave-in conditioner, edge control, satin bonnet. Avoid heavy butters that can weigh down your natural texture.',
  },
  'lines': {
    name: 'Lines',
    score: 96,
    thingsToKnow: ['Duration: 6-8 weeks', 'Maintenance: Weekly moisture', 'Cost estimate: 1500 KES'],
    whyWorks: ['Good for 4c hair type', 'Low tension (protects edges)', 'Works with high porosity'],
    careInstructions: 'Moisturise your scalp and braids weekly. Apply oil to your edges. Wash every 2 weeks. Sleep in a satin bonnet.',
    productDetails: 'Use a lightweight oil for edges (e.g. jojoba, tea tree). Braid spray for moisture. Satin pillowcase or bonnet.',
  },
  'box-braids': {
    name: 'Box Braids',
    score: 82,
    thingsToKnow: ['Duration: 6-8 weeks', 'Maintenance: Scalp oiling', 'Cost estimate: 3000-5000 KES'],
    whyWorks: ['Protective style', 'Reduces breakage', 'Low manipulation'],
    careInstructions: 'Keep scalp moisturised. Avoid heavy product build-up. Wash every 2-3 weeks. Do not leave in longer than 8 weeks.',
    productDetails: 'Braid gel, edge control, lightweight oil. Avoid heavy pomades.',
  },
  'natural-locs': {
    name: 'Natural Locs',
    score: 82,
    thingsToKnow: ['Permanent style', 'Maintenance: Retwist every 4-8 weeks', 'Cost estimate: 2000 KES per retwist'],
    whyWorks: ['Low manipulation', 'Protects ends', 'Suitable for most hair types'],
    careInstructions: 'Retwist regularly. Keep scalp clean. Use lightweight oils. Avoid heavy products that cause build-up.',
    productDetails: 'Lightweight oils, loc gel, residue-free shampoo.',
  },
};

export default function StyleDetailPage() {
  const params = useParams();
  const slug = typeof params.slug === 'string' ? params.slug : '';
  const styleName = nameFromSlug(slug);
  const fallback = STYLE_DATA[slug] || STYLE_DATA['lines'];

  const [styleData, setStyleData] = useState<{
    name: string;
    score: number;
    thingsToKnow: string[];
    whyWorks: string[];
    careInstructions: string;
    productDetails: string | React.ReactNode;
  }>(fallback);

  const [styleInspirationImage, setStyleInspirationImage] = useState<string | null>(null);
  const [loadingStyleInspiration, setLoadingStyleInspiration] = useState(false);

  const handleGenerateStyleInspiration = async () => {
    setLoadingStyleInspiration(true);
    setStyleInspirationImage(null);
    try {
      const profile = localStorage.getItem('nywele-user-profile');
      const hairType = profile ? (JSON.parse(profile)?.hairType || '4c') : '4c';
      const response = await fetch('/api/style', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hairType,
          styleName: styleData.name,
          ethnicity: 'Black Woman',
          length: 'Shoulder-Length',
          vibe: 'Professional Studio Portrait',
        }),
      });
      const result = await response.json();
      if (result.success && result.data?.imageUrl) {
        setStyleInspirationImage(result.data.imageUrl);
      } else {
        const curated = findStyleImage(styleData.name, hairType, 'medium', 'back');
        setStyleInspirationImage(curated?.url || 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=800&q=80');
      }
    } catch {
      const curated = findStyleImage(styleData.name, '4c', 'medium', 'back');
      setStyleInspirationImage(curated?.url || 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=800&q=80');
    } finally {
      setLoadingStyleInspiration(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const fetchStyle = async () => {
      let style = await getStyleByName(styleName);
      if (!style) {
        const all = await getAllStyles();
        style = all?.find((s) => slugFromName(s.name) === slug) ?? null;
      }
      const resolvedName = style?.name ?? styleName;
      const products = await getProductsForStyle(resolvedName);
      return [style, products] as const;
    };
    fetchStyle().then(([style, products]) => {
      if (cancelled) return;
      if (style || products) {
        const thingsToKnow: string[] = [];
        if (style) {
          if (style.typical_duration_days) {
            thingsToKnow.push(`Duration: ${style.typical_duration_days} days`);
          }
          if (style.maintenance_level) {
            thingsToKnow.push(`Maintenance: ${style.maintenance_level}`);
          }
          if (style.price_range_min != null || style.price_range_max != null) {
            const min = style.price_range_min ?? 0;
            const max = style.price_range_max ?? min;
            thingsToKnow.push(`Cost estimate: ${min === max ? `${min} KES` : `${min}-${max} KES`}`);
          }
        }
        const productDetails =
          products && (products.essential?.length || products.recommended?.length) ? (
            <ul
              className="list-inside list-disc space-y-1.5"
              style={{ color: '#C17208', fontFamily: 'Bricolage Grotesque, sans-serif' }}
            >
              {[...(products.essential || []), ...(products.recommended || [])].map((p: any, i: number) => (
                <li key={i}>
                  <strong style={{ color: '#C17208' }}>
                    {p.brand} {p.name}
                  </strong>
                  {p.estimated_price != null && ` — ${p.currency || 'KES'} ${Number(p.estimated_price).toLocaleString()}`}
                  {p.notes && ` (${p.notes})`}
                </li>
              ))}
            </ul>
          ) : fallback.productDetails;

        setStyleData({
          name: style?.name ?? fallback.name,
          score: fallback.score,
          thingsToKnow: thingsToKnow.length ? thingsToKnow : fallback.thingsToKnow,
          whyWorks: fallback.whyWorks,
          careInstructions: fallback.careInstructions,
          productDetails,
        });
      }
    }).catch(() => { /* keep fallback */ });
    return () => { cancelled = true; };
  }, [styleName, slug]);

  const style = styleData;

  return (
    <div className="flex min-h-screen flex-col" style={{ background: '#FFFEE1' }}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Caprasimo&family=Bricolage+Grotesque:wght@400;500;600&display=swap');
      `}</style>
      <BottomNav />

      <div className="flex flex-1 flex-col px-4 pb-24 pt-6 md:px-6 md:pb-8 md:pt-20">
        <div
          className="mx-auto flex w-full max-w-4xl flex-1 flex-col rounded-2xl"
          style={{
            background: '#FFFFFF',
            border: '2px solid rgba(175, 85, 0, 0.25)',
          }}
        >
          <div className="flex flex-1 flex-col p-6 md:p-8">
            <Link
              href="/style-check"
              className="mb-6 inline-flex w-fit items-center gap-2 text-sm font-medium text-[#C17208] transition-colors hover:opacity-80"
              style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
            >
              <ArrowLeft className="h-5 w-5" />
              Back
            </Link>

            <div className="mb-8 flex flex-col gap-6 md:flex-row md:gap-8">
              <div
                className="flex h-40 w-32 shrink-0 items-center justify-center rounded-2xl md:h-48 md:w-40"
                style={{ background: 'rgba(206, 147, 95, 0.12)' }}
              >
                <svg
                  className="h-16 w-16 opacity-80 md:h-20 md:w-20"
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
              </div>
              <div>
                <h1
                  className="mb-2 text-3xl font-bold md:text-4xl"
                  style={{ color: '#C17208', fontFamily: 'Caprasimo, serif' }}
                >
                  {style.name}
                </h1>
                <p className="mb-1 text-4xl font-bold md:text-5xl" style={{ color: '#C17208', fontFamily: 'Caprasimo, serif' }}>
                  {style.score}%
                </p>
                <p
                  className="text-sm"
                  style={{ color: '#C17208', fontFamily: 'Bricolage Grotesque, sans-serif' }}
                >
                  Compatibility score
                </p>
              </div>
            </div>

            <div className="mb-6 space-y-4">
              <div
                className="rounded-2xl p-5"
                style={{
                  background: '#FFFCF3',
                  border: '1px solid rgba(175, 85, 0, 0.18)',
                }}
              >
                <h3
                  className="mb-2 text-base font-bold"
                  style={{ color: '#C17208', fontFamily: 'Caprasimo, serif' }}
                >
                  Things to know
                </h3>
                <ul
                  className="list-inside list-disc space-y-1 text-sm leading-relaxed md:text-base"
                  style={{ color: '#C17208', fontFamily: 'Bricolage Grotesque, sans-serif' }}
                >
                  {style.thingsToKnow.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
              <div
                className="rounded-2xl p-5"
                style={{
                  background: '#FFFCF3',
                  border: '1px solid rgba(175, 85, 0, 0.18)',
                }}
              >
                <h3
                  className="mb-2 text-base font-bold"
                  style={{ color: '#C17208', fontFamily: 'Caprasimo, serif' }}
                >
                  Why this works for you
                </h3>
                <ul
                  className="list-inside list-disc space-y-1 text-sm leading-relaxed md:text-base"
                  style={{ color: '#C17208', fontFamily: 'Bricolage Grotesque, sans-serif' }}
                >
                  {style.whyWorks.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div
              className="mb-6 rounded-2xl p-5"
              style={{
                background: '#FFFCF3',
                border: '1px solid rgba(175, 85, 0, 0.18)',
              }}
            >
              <h3
                className="mb-2 text-base font-bold"
                style={{ color: '#C17208', fontFamily: 'Caprasimo, serif' }}
              >
                Style inspiration
              </h3>
              {styleInspirationImage ? (
                <div className="mt-3">
                  <img
                    src={styleInspirationImage}
                    alt={`${style.name} inspiration`}
                    className="aspect-[4/3] w-full rounded-xl object-cover"
                  />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleGenerateStyleInspiration}
                  disabled={loadingStyleInspiration}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl py-4 text-sm font-semibold transition-all disabled:opacity-70 md:text-base"
                  style={{
                    background: 'rgba(193, 114, 8, 0.12)',
                    color: '#C17208',
                    border: '2px solid #C17208',
                    fontFamily: 'Bricolage Grotesque, sans-serif',
                  }}
                >
                  {loadingStyleInspiration ? (
                    <>
                      <Loader className="h-5 w-5 animate-spin" />
                      Generating…
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5" />
                      Generate style inspiration
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="space-y-3">
              <AccordionSection title="Care instructions">{style.careInstructions}</AccordionSection>
              <AccordionSection title="Product details">{style.productDetails}</AccordionSection>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
