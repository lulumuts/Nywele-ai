'use client';

import type { CSSProperties } from 'react';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Loader } from 'lucide-react';
import BottomNav from '@/app/components/BottomNav';
import { getStyleByName, getProductsForStyle, getAllStyles } from '@/lib/supabase-styles';
import { findStyleImage } from '@/lib/imageLibrary';
import { STYLE_CARD_IMAGE_BY_SLUG } from '@/lib/style-check-card-images';
import { readHairHealthScoreFromLocalProfile } from '@/lib/style-check-health-score';

/** Dashboard primary body text (`app/dashboard/page.tsx` → `DASHBOARD_CONTAINER_TEXT`). */
const DASH_TEXT = '#7A3500';

/** Routine-style cards on the dashboard (`app/dashboard/page.tsx`): cream fill, `#F8DD65` rim, soft shadow. */
const SECTION_CARD_SURFACE: CSSProperties = {
  background: '#FDF8E1',
  border: '1px solid #F8DD65',
  boxShadow: '0 10px 22px rgba(122, 53, 0, 0.08)',
};

/** Dashboard **Weekly** routine card fill (`#FFF4C2`). */
const WEEKLY_CARD_SURFACE: CSSProperties = {
  background: '#FFF4C2',
  border: '1px solid #F8DD65',
  boxShadow: '0 10px 22px rgba(122, 53, 0, 0.08)',
};

/** Care instructions — same Weekly hue, lower-opacity fill so the white shell shows through. */
const CARE_INSTRUCTIONS_SURFACE: CSSProperties = {
  background: 'rgba(255, 244, 194, 0.55)',
  border: '1px solid rgba(248, 221, 101, 0.75)',
  boxShadow: '0 10px 22px rgba(122, 53, 0, 0.06)',
};

/** Pale yellow panel — matches dashboard “Your recommended products” shell (`dashboard/page.tsx`). */
const PALE_YELLOW_SECTION_SURFACE: CSSProperties = {
  background: 'rgba(255, 254, 225, 0.43)',
  border: '1px solid rgba(175, 85, 0, 0.14)',
};

/** Same outer shell as dashboard routine cards (`rounded-[32px]` + padding). */
const ROUTINE_CARD_SHELL_CLASS =
  'relative min-h-0 rounded-[32px] px-6 pb-6 pt-10 md:px-7 md:pb-6 md:pt-10';

/** Care instructions — extra bottom padding inside the Weekly-style card. */
const ROUTINE_CARD_SHELL_CARE_CLASS =
  'relative min-h-0 rounded-[32px] px-6 pb-8 pt-10 md:px-7 md:pb-10 md:pt-10';

function ThingsToKnowLine({ text }: { text: string }) {
  const m = text.match(/^(.+?):\s*([\s\S]+)$/);
  if (m) {
    const label = m[1].trim();
    const detail = m[2].trim();
    const diyOrRest = detail.match(/^DIY\s+(or\s+.+)$/i);
    if (label.toLowerCase() === 'cost estimate' && diyOrRest) {
      return (
        <div className="space-y-1">
          <p
            className="text-sm font-semibold leading-tight md:text-base"
            style={{ color: DASH_TEXT, fontFamily: 'Bricolage Grotesque, sans-serif' }}
          >
            {label}
          </p>
          <p
            className="text-sm leading-snug md:text-base"
            style={{ color: DASH_TEXT, fontFamily: 'Bricolage Grotesque, sans-serif' }}
          >
            DIY
          </p>
          <p
            className="pt-1.5 text-sm leading-snug md:pt-2 md:text-base"
            style={{ color: DASH_TEXT, fontFamily: 'Bricolage Grotesque, sans-serif' }}
          >
            {diyOrRest[1]}
          </p>
        </div>
      );
    }
    return (
      <div className="space-y-1">
        <p
          className="text-sm font-semibold leading-tight md:text-base"
          style={{ color: DASH_TEXT, fontFamily: 'Bricolage Grotesque, sans-serif' }}
        >
          {label}
        </p>
        <p
          className="text-sm leading-snug md:text-base"
          style={{ color: DASH_TEXT, fontFamily: 'Bricolage Grotesque, sans-serif' }}
        >
          {detail}
        </p>
      </div>
    );
  }
  return (
    <p className="text-sm leading-snug md:text-base" style={{ color: DASH_TEXT, fontFamily: 'Bricolage Grotesque, sans-serif' }}>
      {text}
    </p>
  );
}

function slugFromName(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-');
}

function nameFromSlug(slug: string): string {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

const STYLE_DATA: Record<
  string,
  { name: string; thingsToKnow: string[]; whyWorks: string[]; careInstructions: string; productDetails: string }
> = {
  'short-afro': {
    name: 'Short Afro',
    thingsToKnow: ['Low-maintenance length', 'Maintenance: Weekly moisture + shape-up as needed', 'Cost estimate: 800-2500 KES'],
    whyWorks: ['Lightweight daily routine', 'Easy wash days', 'Works well with coils and sponges'],
    careInstructions:
      'Cleanse and deep condition regularly. Detangle gently when wet using conditioner. Moisturise with a light leave-in; seal ends if needed. Refresh shape with a pick, sponge, or finger coils. Protect with a satin bonnet at night.',
    productDetails: 'Lightweight leave-in, curl cream or mousse, wide-tooth comb, satin bonnet. Avoid heavy build-up on short hair.',
  },
  'bantu-knots': {
    name: 'Bantu Knots',
    thingsToKnow: ['Wear: 3-10 days typical', 'Maintenance: Moisturise scalp lightly', 'Cost estimate: DIY or 1500-4000 KES'],
    whyWorks: ['Heat-free definition', 'Protective mini sections', 'Unravels to curls or waves'],
    careInstructions:
      'Section on damp, moisturised hair; twist and wrap into neat knots without excess tension at the roots. Oil scalp as needed. Undo gently when dry for a twist-out. Sleep with a satin bonnet or scarf. Avoid styles that pull painfully tight.',
    productDetails: 'Leave-in or styling cream, light gel or edge control for hold, satin bonnet, rat-tail comb for parting.',
  },
  'natural-afro': {
    name: 'Natural Afro',
    thingsToKnow: ['Duration: 6-8 weeks', 'Maintenance: Weekly moisture', 'Cost estimate: 1500 KES'],
    whyWorks: ['Good for 4c hair type', 'Low tension (protects edges)', 'Works with high porosity'],
    careInstructions: 'Moisturise daily with a lightweight leave-in. Protect at night with a satin bonnet. Deep condition weekly. Avoid over-manipulation.',
    productDetails: 'Recommended: Leave-in conditioner, edge control, satin bonnet. Avoid heavy butters that can weigh down your natural texture.',
  },
  'lines': {
    name: 'Lines',
    thingsToKnow: ['Duration: 6-8 weeks', 'Maintenance: Weekly moisture', 'Cost estimate: 1500 KES'],
    whyWorks: ['Good for 4c hair type', 'Low tension (protects edges)', 'Works with high porosity'],
    careInstructions: 'Moisturise your scalp and braids weekly. Apply oil to your edges. Wash every 2 weeks. Sleep in a satin bonnet.',
    productDetails: 'Use a lightweight oil for edges (e.g. jojoba, tea tree). Braid spray for moisture. Satin pillowcase or bonnet.',
  },
  'box-braids': {
    name: 'Box Braids',
    thingsToKnow: ['Duration: 6-8 weeks', 'Maintenance: Scalp oiling', 'Cost estimate: 3000-5000 KES'],
    whyWorks: ['Protective style', 'Reduces breakage', 'Low manipulation'],
    careInstructions: 'Keep scalp moisturised. Avoid heavy product build-up. Wash every 2-3 weeks. Do not leave in longer than 8 weeks.',
    productDetails: 'Braid gel, edge control, lightweight oil. Avoid heavy pomades.',
  },
  'passion-twists': {
    name: 'Passion Twists',
    thingsToKnow: ['Duration: 4-8 weeks typical', 'Maintenance: Scalp care + light misting', 'Cost estimate: 4000-9000 KES'],
    whyWorks: ['Lightweight compared to some twists', 'Protective install', 'Natural, textured finish'],
    careInstructions:
      'Keep your scalp clean and comfortable—use a nozzle or diluted shampoo between rows if washing in the shower. Pat dry gently; avoid rough towel friction. Moisturise your own hair at the roots lightly. Do not leave installs in too long; take down if itching, pain, or excess tension occurs.',
    productDetails: 'Scalp oil or serum, leave-in spray, satin bonnet or pillowcase, anti-itch spray if needed (patch test).',
  },
  'natural-locs': {
    name: 'Natural Locs',
    thingsToKnow: ['Permanent style', 'Maintenance: Retwist every 4-8 weeks', 'Cost estimate: 2000 KES per retwist'],
    whyWorks: ['Low manipulation', 'Protects ends', 'Suitable for most hair types'],
    careInstructions: 'Retwist regularly. Keep scalp clean. Use lightweight oils. Avoid heavy products that cause build-up.',
    productDetails: 'Lightweight oils, loc gel, residue-free shampoo.',
  },
  'sister-locs': {
    name: 'Sister Locs',
    thingsToKnow: ['Long-term install', 'Maintenance: Retighten every 4-6 weeks', 'Cost estimate: 3500-8000 KES'],
    whyWorks: ['Uniform small locs', 'Low day-to-day styling', 'Versatile updos'],
    careInstructions:
      'Keep the scalp clean with a residue-free cleanser. Moisturise lightly; avoid heavy butters that trap lint. Protect locs at night with satin. See a loctician for retightening on schedule.',
    productDetails: 'Lightweight scalp oil, clarifying or loc-safe shampoo, satin bonnet or pillowcase.',
  },
  'permed-hair': {
    name: 'Permed Hair',
    thingsToKnow: ['Chemically relaxed or texturised', 'Maintenance: Regular deep conditioning', 'Cost estimate: 2500-6000 KES per touch-up'],
    whyWorks: ['Easier detangling and styling', 'Defined length and swing', 'Pairs well with heat-free sets'],
    careInstructions:
      'Use sulphate-free, moisturising shampoos. Deep condition weekly. Protect ends and minimise heat. Space relaxer touch-ups safely; see a professional for overlapping chemical services.',
    productDetails: 'Protein-moisture balance treatments, leave-in conditioner, heat protectant if blow-drying, wide-tooth comb.',
  },
  'lace-front-wig': {
    name: 'Lace Front Wig',
    thingsToKnow: ['Install: glue, tape, or glueless', 'Wear: weeks to months with care', 'Cost estimate: 8000-40000+ KES unit + install'],
    whyWorks: ['Natural-looking hairline', 'Versatile parting and updos', 'Protective when braided down underneath'],
    careInstructions:
      'Keep your bio hair clean and dry under the cap; avoid prolonged dampness. Gently cleanse the lace and hair following your adhesive method. Sleep on satin; use a wig band or low tension for edges. Reinstall or adjust at a stylist if the lace lifts or itches.',
    productDetails: 'Wig-safe shampoo, knot sealer spray if needed, edge-friendly adhesive or elastic band, satin bonnet, wide-tooth comb.',
  },
};

export default function StyleDetailPage() {
  const params = useParams();
  const slug = typeof params.slug === 'string' ? params.slug : '';
  const styleName = nameFromSlug(slug);
  const fallback = STYLE_DATA[slug] || STYLE_DATA['lines'];

  const [styleData, setStyleData] = useState<{
    name: string;
    score: number | null;
    thingsToKnow: string[];
    whyWorks: string[];
    careInstructions: string;
    productDetails: string | React.ReactNode;
  }>(() => ({
    ...fallback,
    score: typeof window !== 'undefined' ? readHairHealthScoreFromLocalProfile() : null,
  }));

  const [styleInspirationImage, setStyleInspirationImage] = useState<string | null>(null);
  const [loadingStyleInspiration, setLoadingStyleInspiration] = useState(false);

  useEffect(() => {
    const fb = STYLE_DATA[slug] || STYLE_DATA['lines'];
    setStyleData({
      ...fb,
      score: readHairHealthScoreFromLocalProfile(),
      productDetails: fb.productDetails,
    });
  }, [slug]);

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
              style={{ color: DASH_TEXT, fontFamily: 'Bricolage Grotesque, sans-serif' }}
            >
              {[...(products.essential || []), ...(products.recommended || [])].map((p: any, i: number) => (
                <li key={i}>
                  <strong style={{ color: DASH_TEXT }}>
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
          score: readHairHealthScoreFromLocalProfile(),
          thingsToKnow: thingsToKnow.length ? thingsToKnow : fallback.thingsToKnow,
          whyWorks: fallback.whyWorks,
          careInstructions: fallback.careInstructions,
          productDetails,
        });
      }
    }).catch(() => { /* keep fallback */ });
    return () => { cancelled = true; };
  }, [styleName, slug]);

  useEffect(() => {
    const refreshScore = () =>
      setStyleData((prev) => ({ ...prev, score: readHairHealthScoreFromLocalProfile() }));
    refreshScore();
    window.addEventListener('focus', refreshScore);
    return () => window.removeEventListener('focus', refreshScore);
  }, []);

  const style = styleData;

  return (
    <div className="flex min-h-screen flex-col bg-transparent">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Caprasimo&family=Bricolage+Grotesque:wght@400;500;600&display=swap');
      `}</style>
      <BottomNav />

      <div className="flex min-h-0 flex-1 flex-col px-4 pb-[max(7.5rem,calc(env(safe-area-inset-bottom,0px)+6rem))] pt-[calc(4rem+env(safe-area-inset-top,0px))] sm:pt-[calc(4.5rem+env(safe-area-inset-top,0px))] md:px-6 md:pb-8 md:pt-[calc(4rem+env(safe-area-inset-top,0px))]">
        <div className="mx-auto flex min-h-0 w-full max-w-4xl flex-1 flex-col">
          <div className="flex flex-col px-2 pb-0 sm:px-3 md:px-4 md:pb-1">
            <Link
              href="/style-check"
              className="mb-3 inline-flex w-fit items-center gap-2 text-sm font-medium transition-colors hover:opacity-80 md:mb-4"
              style={{ color: DASH_TEXT, fontFamily: 'Bricolage Grotesque, sans-serif' }}
            >
              <ArrowLeft className="h-5 w-5" />
              Back
            </Link>

            <div className="flex flex-row items-center gap-4 sm:gap-6 md:gap-8">
              <div
                className={`flex shrink-0 items-center justify-center overflow-hidden rounded-2xl ${
                  slug === 'sister-locs'
                    ? 'h-80 w-56 md:h-[28rem] md:w-72'
                    : 'h-64 w-48 md:h-80 md:w-56'
                }`}
              >
                {STYLE_CARD_IMAGE_BY_SLUG[slug] ? (
                  <img
                    src={STYLE_CARD_IMAGE_BY_SLUG[slug]}
                    alt={`${style.name} illustration`}
                    className="max-h-full max-w-full object-contain object-center"
                  />
                ) : (
                  <svg
                    className="h-24 w-24 opacity-80 md:h-28 md:w-28"
                    viewBox="0 0 81 77"
                    fill="none"
                    style={{ color: DASH_TEXT }}
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
              <div className="flex min-w-0 flex-1 flex-col-reverse gap-1 md:gap-1.5">
                <h1
                  className="text-2xl font-bold md:text-3xl"
                  style={{ color: DASH_TEXT, fontFamily: 'Caprasimo, serif' }}
                >
                  {style.name}
                </h1>
                <div className="flex min-w-0 flex-col gap-0.5">
                  <p
                    className="text-6xl font-bold leading-none tabular-nums sm:text-7xl md:text-8xl xl:text-9xl"
                    style={{ color: DASH_TEXT, fontFamily: 'Bricolage Grotesque, sans-serif' }}
                  >
                    {style.score !== null ? (
                      <>
                        {style.score}
                        <span className="text-2xl font-semibold opacity-80 md:text-3xl">%</span>
                      </>
                    ) : (
                      <span className="text-4xl md:text-5xl xl:text-6xl">—</span>
                    )}
                  </p>
                  <p
                    className="text-sm leading-tight"
                    style={{ color: DASH_TEXT, fontFamily: 'Bricolage Grotesque, sans-serif' }}
                  >
                    Compatibility score
                  </p>
                  {style.score === null ? (
                    <p
                      className="mt-1.5 max-w-md text-xs leading-snug opacity-90"
                      style={{ color: DASH_TEXT, fontFamily: 'Bricolage Grotesque, sans-serif' }}
                    >
                      Complete a Hair care scan to see your compatibility percentage — it aligns with your dashboard metrics.
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <div
            className="-mt-2 mb-0 w-full min-h-[min(52dvh,26rem)] max-h-[min(68dvh,38rem)] overflow-x-hidden overflow-y-auto overscroll-y-contain rounded-2xl p-6 sm:-mt-2 sm:min-h-[min(54dvh,28rem)] sm:max-h-[min(70dvh,42rem)] md:-mt-1 md:min-h-[min(56dvh,30rem)] md:max-h-[min(72dvh,46rem)] md:p-8"
            style={{
              background: '#FFFFFF',
              border: '2px solid rgba(122, 53, 0, 0.25)',
              color: DASH_TEXT,
            }}
          >
            <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
              <div className={ROUTINE_CARD_SHELL_CLASS} style={PALE_YELLOW_SECTION_SURFACE}>
                <h3
                  className="mb-3 text-lg font-bold md:mb-4 md:text-xl"
                  style={{ color: DASH_TEXT, fontFamily: 'Caprasimo, serif' }}
                >
                  Things to know
                </h3>
                <ul className="list-none space-y-5 md:space-y-6">
                  {style.thingsToKnow.map((item, i) => (
                    <li key={i}>
                      <ThingsToKnowLine text={item} />
                    </li>
                  ))}
                </ul>
              </div>
              <div className={ROUTINE_CARD_SHELL_CLASS} style={SECTION_CARD_SURFACE}>
                <h3
                  className="mb-3 text-lg font-bold md:mb-4 md:text-xl"
                  style={{ color: DASH_TEXT, fontFamily: 'Caprasimo, serif' }}
                >
                  Why this works for you
                </h3>
                <ul
                  className="list-inside list-disc space-y-1 text-sm leading-relaxed md:text-base"
                  style={{ color: DASH_TEXT, fontFamily: 'Bricolage Grotesque, sans-serif' }}
                >
                  {style.whyWorks.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mb-6 space-y-5 md:space-y-6">
              <div className={ROUTINE_CARD_SHELL_CARE_CLASS} style={CARE_INSTRUCTIONS_SURFACE}>
                <h3
                  className="mb-3 text-lg font-bold md:mb-4 md:text-xl"
                  style={{ color: DASH_TEXT, fontFamily: 'Caprasimo, serif' }}
                >
                  Care instructions
                </h3>
                <div
                  className="whitespace-pre-line text-sm leading-relaxed md:text-base"
                  style={{ color: DASH_TEXT, fontFamily: 'Bricolage Grotesque, sans-serif' }}
                >
                  {style.careInstructions}
                </div>
              </div>
              <div className={ROUTINE_CARD_SHELL_CLASS} style={WEEKLY_CARD_SURFACE}>
                <h3
                  className="mb-3 text-lg font-bold md:mb-4 md:text-xl"
                  style={{ color: DASH_TEXT, fontFamily: 'Caprasimo, serif' }}
                >
                  Product details
                </h3>
                <div
                  className="text-sm leading-relaxed md:text-base [&_ul]:list-inside [&_ul]:list-disc [&_ul]:space-y-1"
                  style={{ color: DASH_TEXT, fontFamily: 'Bricolage Grotesque, sans-serif' }}
                >
                  {style.productDetails}
                </div>
              </div>
            </div>

            <div className={ROUTINE_CARD_SHELL_CLASS} style={SECTION_CARD_SURFACE}>
              <h3
                className="mb-3 text-lg font-bold md:mb-4 md:text-xl"
                style={{ color: DASH_TEXT, fontFamily: 'Caprasimo, serif' }}
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
                    background: 'rgba(122, 53, 0, 0.12)',
                    color: DASH_TEXT,
                    border: `2px solid ${DASH_TEXT}`,
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
          </div>
        </div>
      </div>
    </div>
  );
}
