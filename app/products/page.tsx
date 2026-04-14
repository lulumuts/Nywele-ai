'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, ArrowRight, User, ScanBarcode } from 'lucide-react';
import {
  BottomNavHubShell,
  StyleCheckHubWhiteCard,
  bottomNavHubMainStyleCheckGridClass,
  styleCheckHubWhiteCardOuterStartClass,
} from '@/app/components/BottomNavHubLayout';
import { normalizeUserProfile, type UserProfile } from '@/types/userProfile';
import {
  PRODUCTS,
  TABS,
  type ExplorerProduct,
  type TabKey,
  type IngredientStatus,
} from '@/lib/productExplorerCatalog';

/** White panel max-height: capped so cream stays visible above the floating nav; nudged taller than before. */
const PRODUCT_COMPAT_CARD_SHELL_CLASS =
  'max-md:[max-height:min(62dvh,calc(100dvh-13.5rem-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px)))] md:max-h-[min(68dvh,calc(100dvh-14rem-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px)))]';

/** Nudges the card up toward the hero copy; merges with shared hub outer. */
const PRODUCT_COMPAT_CARD_OUTER_CLASS = `${styleCheckHubWhiteCardOuterStartClass} -mt-1 pt-1 md:-mt-2 md:pt-0`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Brand accent — aligned with app-wide #B26805 */
const BR = '#B26805';
const BR_RGB = '178, 104, 5';

function compatStyle(score: number): { bg: string; text: string } {
  if (score >= 88) return { bg: `rgba(${BR_RGB}, 0.14)`, text: BR };
  if (score >= 65) return { bg: `rgba(${BR_RGB}, 0.22)`, text: BR };
  return { bg: `rgba(${BR_RGB}, 0.32)`, text: BR };
}

const INGR_STYLES: Record<IngredientStatus, { bg: string; text: string }> = {
  good: { bg: `rgba(${BR_RGB}, 0.12)`, text: BR },
  warn: { bg: `rgba(${BR_RGB}, 0.2)`, text: BR },
  bad: { bg: 'rgba(254, 202, 202, 0.65)', text: '#991B1B' },
};

const AVATAR_COLORS = [
  { bg: `rgba(${BR_RGB}, 0.2)`, text: BR },
  { bg: `rgba(${BR_RGB}, 0.12)`, text: BR },
  { bg: `rgba(${BR_RGB}, 0.26)`, text: BR },
  { bg: `rgba(${BR_RGB}, 0.16)`, text: BR },
];

function avatarColor(initials: string) {
  const idx = initials.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProductAvatar({ product }: { product: ExplorerProduct }) {
  const col = avatarColor(product.initials);

  if (product.imageSrc) {
    return (
      <img
        src={product.imageSrc}
        alt={product.name}
        className="h-14 w-14 shrink-0 rounded-2xl border-2 border-[rgba(178,104,5,0.22)] object-cover sm:h-16 sm:w-16"
      />
    );
  }

  return (
    <div
      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 border-[rgba(178,104,5,0.2)] text-xs font-semibold sm:h-16 sm:w-16"
      style={{ background: col.bg, color: col.text }}
    >
      {product.initials}
    </div>
  );
}

function ProductCard({ product }: { product: ExplorerProduct }) {
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const compat = compatStyle(product.compat);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => setOpen(!open)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setOpen(!open);
        }
      }}
      className={`cursor-pointer rounded-2xl px-4 py-3.5 transition-colors duration-200 ${
        open ? 'bg-white' : 'bg-white hover:bg-[rgba(178,104,5,0.04)]'
      }`}
    >
      <div className="flex items-start gap-3.5">
        <ProductAvatar product={product} />
        <div className="min-w-0 flex-1">
          <div className="mb-0.5 text-[11px] font-medium uppercase tracking-wide text-[#B26805]/80">
            {product.brand}
          </div>
          <div className="text-[15px] font-semibold leading-snug text-[#B26805]">{product.name}</div>
          <div className="mt-1 text-xs text-[#B26805]">{product.type}</div>
        </div>
        <div className="shrink-0 text-right">
          <div
            className="mb-1 ml-auto flex h-9 w-9 items-center justify-center rounded-full text-[11px] font-bold tabular-nums"
            style={{ background: compat.bg, color: compat.text }}
          >
            {product.compat}%
          </div>
          <div className="text-sm font-semibold text-[#B26805]">{product.price}</div>
        </div>
      </div>

      {open && (
        <div
          className="mt-3 border-t border-[rgba(178,104,5,0.15)] pt-3"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          {product.ingredients.length > 0 ? (
            <div className="mb-3 flex flex-wrap gap-1.5">
              {product.ingredients.map((ing, i) => {
                const s = INGR_STYLES[ing.status];
                return (
                  <span
                    key={i}
                    className="rounded-full px-2.5 py-1 text-[11px] font-medium"
                    style={{ background: s.bg, color: s.text }}
                  >
                    {ing.name}
                  </span>
                );
              })}
            </div>
          ) : (
            <div className="mb-3 text-xs text-[#B26805]">No ingredient list — physical product</div>
          )}

          <p className="m-0 text-xs leading-relaxed text-[#B26805]">
            <span className="font-semibold text-[#B26805]">Trichologist note: </span>
            {product.note}
          </p>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSaved(!saved);
            }}
            className={`mt-3 w-full rounded-xl border-2 px-3 py-2.5 text-xs font-semibold transition-colors ${
              saved
                ? 'border-[#B26805] bg-[rgba(178,104,5,0.1)] text-[#B26805]'
                : 'border-[rgba(178,104,5,0.35)] bg-transparent text-[#B26805] hover:bg-[rgba(178,104,5,0.06)]'
            }`}
          >
            {saved ? 'Saved to my products \u2713' : 'Save to my products'}
          </button>
        </div>
      )}
    </div>
  );
}

function ProductExplorer({ hairTypeLabel }: { hairTypeLabel: string }) {
  const [activeTab, setActiveTab] = useState<TabKey>('care');
  const [query, setQuery] = useState('');
  const listScrollRef = useRef<HTMLDivElement>(null);

  const tabCount = TABS.length;
  const activeTabIndex = Math.max(
    0,
    TABS.findIndex((t) => t.key === activeTab),
  );
  const segmentPct = 100 / tabCount;

  const products = PRODUCTS[activeTab].filter(
    (p) =>
      query === '' ||
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.brand.toLowerCase().includes(query.toLowerCase()),
  );

  useEffect(() => {
    const el = listScrollRef.current;
    if (el) el.scrollTop = 0;
  }, [activeTab]);

  return (
    <div className="mx-auto w-full max-w-full pb-1 font-[family-name:var(--font-bricolage,ui-sans-serif)] [font-family:Bricolage_Grotesque,system-ui,sans-serif]">
      <div className="mb-5 flex items-center gap-3 rounded-xl border-2 border-[rgba(178,104,5,0.22)] bg-[rgba(178,104,5,0.06)] px-3.5 py-3 transition-colors focus-within:border-[rgba(178,104,5,0.45)] focus-within:bg-[rgba(178,104,5,0.08)]">
        <Search className="h-[18px] w-[18px] shrink-0 text-[#B26805]/55" aria-hidden />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by product name or brand..."
          className="min-w-0 flex-1 border-0 bg-transparent text-sm text-[#B26805] outline-none placeholder:text-[#B26805]/55"
        />
      </div>

      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[rgba(178,104,5,0.2)] bg-[rgba(178,104,5,0.08)] px-3 py-1.5 text-xs font-medium text-[#B26805]">
        <span className="h-2 w-2 shrink-0 rounded-full bg-[#B26805]" aria-hidden />
        Matched to your <span className="font-semibold text-[#B26805]">{hairTypeLabel}</span> hair profile
      </div>

      <h3
        className="mb-3 text-base font-bold"
        style={{ color: '#B26805', fontFamily: 'Caprasimo, serif' }}
      >
        Recommended for you
      </h3>

      <div className="mb-4">
        <div
          role="tablist"
          aria-label="Product categories"
          className="relative flex h-9 w-full overflow-hidden rounded-full border-2 border-[#B26805] bg-white sm:h-10"
        >
          <motion.div
            aria-hidden
            className="absolute inset-y-0 rounded-full bg-[#B26805]"
            initial={false}
            animate={{
              left: `${activeTabIndex * segmentPct}%`,
              width: `${segmentPct}%`,
            }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          />
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.key}
              id={`product-compat-tab-${tab.key}`}
              onClick={() => setActiveTab(tab.key)}
              className="relative z-10 flex min-w-0 flex-1 items-center justify-center px-0.5 py-0 text-center text-[10px] font-semibold leading-tight transition-colors sm:px-1 sm:text-xs md:text-sm"
              style={{
                color: activeTab === tab.key ? '#FFFFFF' : '#B26805',
                fontFamily: 'Bricolage Grotesque, sans-serif',
                background: 'transparent',
              }}
            >
              <span className="max-w-full truncate">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div
        ref={listScrollRef}
        className="flex min-h-[min(34dvh,20rem)] max-h-[min(34dvh,20rem)] flex-col gap-3 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch] pr-1"
      >
        {products.length > 0 ? (
          products.map((p, i) => <ProductCard key={`${activeTab}-${p.brand}-${p.name}-${i}`} product={p} />)
        ) : (
          <div className="flex min-h-[12rem] flex-1 items-center justify-center rounded-xl bg-[rgba(178,104,5,0.04)] px-4 py-10 text-center text-sm text-[#B26805]">
            No products found for &quot;{query}&quot;
          </div>
        )}
      </div>

      <div className="mt-4 rounded-2xl bg-white px-3 py-4 text-center md:mt-5 md:px-4 md:py-5">
        <div className="mb-1 text-2xl text-[#B26805]/80" aria-hidden>
          {'\u2661'}
        </div>
        <div className="text-sm font-semibold text-[#B26805]">No saved products yet</div>
        <div className="mt-1 text-xs text-[#B26805]">Tap the save button on any product to keep it here</div>
      </div>
    </div>
  );
}

function ProductsCompatibilityHeader() {
  return (
    <div className="mb-2 flex shrink-0 flex-col md:mb-3">
      <div className="mt-3 flex justify-end md:mt-4">
        <Link
          href="/products/scan"
          className="inline-flex min-h-[44px] shrink-0 items-center gap-2 border-0 bg-transparent p-0 text-sm font-semibold shadow-none transition-opacity hover:opacity-80 focus:outline-none focus-visible:underline md:text-base"
          style={{ color: '#C17208', fontFamily: 'Bricolage Grotesque, sans-serif' }}
        >
          <ScanBarcode className="h-5 w-5 shrink-0" aria-hidden style={{ color: '#C17208' }} />
          Scan barcode
        </Link>
      </div>
      <h1
        className="mt-10 min-w-0 text-3xl font-bold md:mt-12 md:text-4xl"
        style={{ color: '#C17208', fontFamily: 'Caprasimo, serif' }}
      >
        Product Compatibility
      </h1>
      <p
        className="mb-0 mt-3 max-w-2xl pb-4 text-base md:mt-4 md:pb-5 md:text-lg"
        style={{ color: '#C17208', fontFamily: 'Bricolage Grotesque, sans-serif' }}
      >
        Scan or search products to see if they work with your hair profile
      </p>
    </div>
  );
}

export default function Products() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const profileData = localStorage.getItem('nywele-user-profile');
    if (profileData) {
      try {
        const parsed = normalizeUserProfile(JSON.parse(profileData));
        setProfile(parsed);
      } catch (error) {
        console.error('Error parsing profile:', error);
      }
    }
    setLoading(false);
  }, []);

  const hairLabel = profile?.hairType?.trim() || '4c';

  if (loading) {
    return (
      <BottomNavHubShell mainAreaClassName={bottomNavHubMainStyleCheckGridClass}>
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-b-4 border-[#B26805]" />
            <p style={{ color: '#B26805', fontFamily: 'Bricolage Grotesque, sans-serif' }}>Loading...</p>
          </div>
        </div>
      </BottomNavHubShell>
    );
  }

  if (!profile) {
    return (
      <BottomNavHubShell mainAreaClassName={bottomNavHubMainStyleCheckGridClass}>
        <ProductsCompatibilityHeader />
        <StyleCheckHubWhiteCard
          outerClassName={PRODUCT_COMPAT_CARD_OUTER_CLASS}
          shellClassName={PRODUCT_COMPAT_CARD_SHELL_CLASS}
        >
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
              style={{ background: 'rgba(178, 104, 5, 0.18)' }}
            >
              <User size={32} style={{ color: '#B26805' }} />
            </div>
            <h2 className="mb-4 text-2xl font-bold" style={{ color: '#B26805', fontFamily: 'Caprasimo, serif' }}>
              Create Your Hair Profile First
            </h2>
            <p className="mb-6" style={{ color: '#B26805', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
              Create your hair profile to check product compatibility
            </p>
            <button
              type="button"
              onClick={() => router.push('/onboarding')}
              className="mx-auto flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold shadow-lg transition-all hover:shadow-xl"
              style={{ background: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif', color: '#FFFEE1' }}
            >
              Get Started
              <ArrowRight size={20} />
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mt-8"
          >
            <ProductExplorer hairTypeLabel="4c" />
          </motion.div>
        </StyleCheckHubWhiteCard>
      </BottomNavHubShell>
    );
  }

  return (
    <BottomNavHubShell mainAreaClassName={bottomNavHubMainStyleCheckGridClass}>
      <ProductsCompatibilityHeader />
      <StyleCheckHubWhiteCard
        outerClassName={PRODUCT_COMPAT_CARD_OUTER_CLASS}
        shellClassName={PRODUCT_COMPAT_CARD_SHELL_CLASS}
      >
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <ProductExplorer hairTypeLabel={hairLabel} />
        </motion.div>
      </StyleCheckHubWhiteCard>
    </BottomNavHubShell>
  );
}
