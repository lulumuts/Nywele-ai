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
  styleCheckHubWhiteCardOuterProductCompatClass,
  styleCheckHubWhiteCardShellProductCompatClass,
} from '@/app/components/BottomNavHubLayout';
import { normalizeUserProfile, type UserProfile } from '@/types/userProfile';
import {
  PRODUCTS,
  TABS,
  type ExplorerProduct,
  type TabKey,
  type IngredientStatus,
} from '@/lib/productExplorerCatalog';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Dashboard-like theme (brown) */
const DASH_TEXT = '#7A3500';
const DASH_RGB = '122, 53, 0';
/** Accent used throughout this page */
const BR = DASH_TEXT;
const BR_RGB = DASH_RGB;
const SAVED_PRODUCTS_STORAGE_KEY = 'nywele-saved-products-v1';

function productKey(product: ExplorerProduct): string {
  return `${product.brand}::${product.name}`.toLowerCase();
}

function loadSavedProductKeys(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SAVED_PRODUCTS_STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === 'string');
  } catch {
    return [];
  }
}

function persistSavedProductKeys(keys: string[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SAVED_PRODUCTS_STORAGE_KEY, JSON.stringify(keys));
  } catch {
    // Ignore storage failures (Safari private mode / quota, etc.)
  }
}

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
        className="h-14 w-14 shrink-0 rounded-2xl border-2 border-[rgba(122,53,0,0.22)] object-cover sm:h-16 sm:w-16"
      />
    );
  }

  return (
    <div
      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 border-[rgba(122,53,0,0.2)] text-xs font-semibold sm:h-16 sm:w-16"
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

  useEffect(() => {
    const keys = loadSavedProductKeys();
    setSaved(keys.includes(productKey(product)));
  }, [product]);

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
      className={`cursor-pointer shrink-0 w-[250px] min-w-[250px] sm:w-[280px] sm:min-w-[280px] rounded-2xl p-4 transition-colors duration-200 ${
        open ? 'bg-transparent' : 'bg-transparent hover:bg-[rgba(178,104,5,0.04)]'
      }`}
    >
      <div className="mb-4 h-40 w-full overflow-hidden rounded-xl border border-[rgba(178,104,5,0.18)] bg-[rgba(178,104,5,0.06)]">
        {product.imageSrc ? (
          <img src={product.imageSrc} alt={product.name} className="h-full w-full object-cover" loading="lazy" decoding="async" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ProductAvatar product={product} />
          </div>
        )}
      </div>

      <div className="flex items-start gap-3.5">
        <div className="min-w-0 flex-1">
          <div className="mb-0.5 text-[11px] font-medium uppercase tracking-wide" style={{ color: 'rgba(122, 53, 0, 0.8)' }}>
            {product.brand}
          </div>
          <div className="text-[15px] font-semibold leading-snug" style={{ color: DASH_TEXT }}>
            {product.name}
          </div>
          <div className="mt-1 text-xs" style={{ color: DASH_TEXT }}>
            {product.type}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div
            className="mb-1 ml-auto flex h-9 w-9 items-center justify-center rounded-full text-[11px] font-bold tabular-nums"
            style={{ background: compat.bg, color: compat.text }}
          >
            {product.compat}%
          </div>
          <div className="text-sm font-semibold" style={{ color: DASH_TEXT }}>
            {product.price}
          </div>
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
            <div className="mb-3 text-xs" style={{ color: DASH_TEXT }}>
              No ingredient list — physical product
            </div>
          )}

          <p className="m-0 text-xs leading-relaxed" style={{ color: DASH_TEXT }}>
            <span className="font-semibold" style={{ color: DASH_TEXT }}>
              Trichologist note:{' '}
            </span>
            {product.note}
          </p>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              const next = !saved;
              setSaved(next);
              const key = productKey(product);
              const current = loadSavedProductKeys();
              const nextKeys = next
                ? Array.from(new Set([...current, key]))
                : current.filter((k) => k !== key);
              persistSavedProductKeys(nextKeys);
            }}
            className={`mt-3 w-full rounded-xl border-2 px-3 py-2.5 text-xs font-semibold transition-colors ${
              saved
                ? 'border-[#7A3500] bg-[rgba(122,53,0,0.1)]'
                : 'border-[rgba(122,53,0,0.35)] bg-transparent hover:bg-[rgba(122,53,0,0.06)]'
            }`}
            style={{ color: DASH_TEXT }}
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
  const listScrollRef = useRef<HTMLDivElement>(null);
  const [savedKeys, setSavedKeys] = useState<string[]>([]);

  useEffect(() => {
    setSavedKeys(loadSavedProductKeys());
  }, []);

  const allProducts = Object.values(PRODUCTS).flat();
  const savedProducts = savedKeys
    .map((k) => allProducts.find((p) => productKey(p) === k))
    .filter((p): p is ExplorerProduct => Boolean(p));

  const tabCount = TABS.length;
  const activeTabIndex = Math.max(
    0,
    TABS.findIndex((t) => t.key === activeTab),
  );
  const segmentPct = 100 / tabCount;

  const products = PRODUCTS[activeTab];
  const activeTabLabel = TABS.find((t) => t.key === activeTab)?.label ?? 'this category';

  useEffect(() => {
    const el = listScrollRef.current;
    if (el) el.scrollTop = 0;
  }, [activeTab]);

  return (
    <div className="mx-auto w-full max-w-full pb-1 font-[family-name:var(--font-bricolage,ui-sans-serif)] [font-family:Bricolage_Grotesque,system-ui,sans-serif]">
      <div
        className="rounded-2xl border border-[rgba(178,104,5,0.18)] p-4 min-h-[min(46dvh,28rem)]"
        style={{ background: 'rgba(255, 254, 225, 0.43)' }}
      >
        <h3
          className="mb-3 text-base font-bold"
          style={{ color: DASH_TEXT, fontFamily: 'Caprasimo, serif' }}
        >
          Recommended for you
        </h3>
        <div className="mb-4">
          <div
            role="tablist"
            aria-label="Product categories"
            className="relative flex h-11 w-full overflow-hidden rounded-full border-2 sm:h-12"
            style={{ borderColor: DASH_TEXT, background: 'rgba(255, 254, 225, 0.43)' }}
          >
            <motion.div
              aria-hidden
              className="absolute inset-y-0 rounded-full"
              initial={false}
              animate={{
                left: `${activeTabIndex * segmentPct}%`,
                width: `${segmentPct}%`,
              }}
              style={{ background: DASH_TEXT }}
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
                className="relative z-10 flex min-w-0 flex-1 items-center justify-center px-2 py-0 text-center text-[11px] font-semibold leading-tight transition-colors sm:px-3 sm:text-xs"
                style={{
                  color: activeTab === tab.key ? '#FFFEE1' : DASH_TEXT,
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
        className="flex w-full gap-4 overflow-x-auto overscroll-x-contain pb-2 pr-1 [-webkit-overflow-scrolling:touch]"
      >
        {products.length > 0 ? (
          products.map((p, i) => <ProductCard key={`${activeTab}-${p.brand}-${p.name}-${i}`} product={p} />)
        ) : (
          <div
            className="flex min-h-[12rem] flex-1 items-center justify-center rounded-xl bg-[rgba(178,104,5,0.04)] px-4 py-10 text-center text-sm"
            style={{ color: DASH_TEXT }}
          >
            No products found in {activeTabLabel}.
          </div>
        )}
      </div>
      </div>

      <div className="mt-4 rounded-2xl bg-white px-3 py-4 text-center md:mt-5 md:px-4 md:py-5">
        <div className="mb-1 text-2xl" style={{ color: 'rgba(122, 53, 0, 0.8)' }} aria-hidden>
          {'\u2661'}
        </div>
        {savedProducts.length > 0 ? (
          <>
            <div className="text-sm font-semibold" style={{ color: DASH_TEXT }}>
              Saved products
            </div>
            <div className="mt-1 text-xs" style={{ color: DASH_TEXT }}>
              {savedProducts.length} saved on this device
            </div>
            <div className="mt-4 grid gap-2 text-left">
              {savedProducts.slice(0, 3).map((p) => (
                <div
                  key={productKey(p)}
                  className="flex items-center gap-3 rounded-xl border border-[rgba(178,104,5,0.18)] bg-[rgba(178,104,5,0.04)] px-3 py-2"
                >
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-[rgba(178,104,5,0.22)] bg-white">
                    {p.imageSrc ? (
                      <img src={p.imageSrc} alt={p.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] font-semibold" style={{ color: DASH_TEXT }}>
                        {p.initials}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-semibold" style={{ color: DASH_TEXT }}>
                      {p.name}
                    </div>
                    <div className="truncate text-[11px]" style={{ color: 'rgba(122, 53, 0, 0.8)' }}>
                      {p.brand}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {savedProducts.length > 3 ? (
              <div className="mt-3 text-xs" style={{ color: DASH_TEXT }}>
                +{savedProducts.length - 3} more saved
              </div>
            ) : null}
          </>
        ) : (
          <>
            <div className="text-sm font-semibold" style={{ color: DASH_TEXT }}>
              No saved products yet
            </div>
            <div className="mt-1 text-xs" style={{ color: DASH_TEXT }}>
              Tap the save button on any product to keep it here
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ProductsCompatibilityHeader() {
  return (
    <div className="mb-2 flex shrink-0 flex-col md:mb-3 lg:pt-10">
      <div className="flex flex-col lg:mt-12 lg:pt-10 lg:flex-row lg:items-start lg:justify-between lg:gap-6">
        <h1
          className="order-2 mt-8 min-w-0 text-3xl font-bold lg:order-1 lg:mt-0 lg:flex-1 lg:text-4xl"
          style={{ color: '#7A3500', fontFamily: 'Caprasimo, serif' }}
        >
          Product Compatibility
        </h1>
        <div className="order-1 mt-3 flex justify-end lg:order-2 lg:mt-0 lg:shrink-0 lg:justify-end lg:pt-1">
          <Link
            href="/products/scan"
            className="inline-flex min-h-[44px] shrink-0 items-center gap-2 border-0 bg-transparent p-0 text-sm font-semibold shadow-none transition-opacity hover:opacity-80 focus:outline-none focus-visible:underline lg:text-base"
            style={{ color: '#7A3500', fontFamily: 'Bricolage Grotesque, sans-serif' }}
          >
            <ScanBarcode className="h-5 w-5 shrink-0" aria-hidden style={{ color: '#7A3500' }} />
            Scan barcode
          </Link>
        </div>
      </div>
      <p
        className="mb-0 mt-1.5 max-w-2xl pb-6 text-base md:mt-2 md:pb-8 md:text-lg"
        style={{ color: '#7A3500', fontFamily: 'Bricolage Grotesque, sans-serif' }}
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
            <div
              className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-b-4"
              style={{ borderBottomColor: DASH_TEXT }}
            />
            <p style={{ color: DASH_TEXT, fontFamily: 'Bricolage Grotesque, sans-serif' }}>Loading...</p>
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
          outerClassName={styleCheckHubWhiteCardOuterProductCompatClass}
          shellClassName={styleCheckHubWhiteCardShellProductCompatClass}
          surfaceStyle={{ color: DASH_TEXT, border: '2px solid rgba(122, 53, 0, 0.25)' }}
        >
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
              style={{ background: 'rgba(122, 53, 0, 0.14)' }}
            >
              <User size={32} style={{ color: DASH_TEXT }} />
            </div>
            <h2 className="mb-4 text-2xl font-bold" style={{ color: DASH_TEXT, fontFamily: 'Caprasimo, serif' }}>
              Create Your Hair Profile First
            </h2>
            <p className="mb-6" style={{ color: DASH_TEXT, fontFamily: 'Bricolage Grotesque, sans-serif' }}>
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
        outerClassName={styleCheckHubWhiteCardOuterProductCompatClass}
        shellClassName={styleCheckHubWhiteCardShellProductCompatClass}
        surfaceStyle={{ color: DASH_TEXT, border: '2px solid rgba(122, 53, 0, 0.25)' }}
      >
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <ProductExplorer hairTypeLabel={hairLabel} />
        </motion.div>
      </StyleCheckHubWhiteCard>
    </BottomNavHubShell>
  );
}
