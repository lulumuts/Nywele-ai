'use client';

import type { CSSProperties, ReactNode } from 'react';
import BottomNav from '@/app/components/BottomNav';

/** Bottom padding for mobile nav: see `.bottom-nav-hub-main` in `globals.css` (Tailwind-safe). */
export const bottomNavHubMainClass =
  'bottom-nav-hub-main flex min-h-0 flex-1 flex-col px-7 pt-[calc(6rem+env(safe-area-inset-top,0px))] sm:px-8 md:px-14 md:pt-[calc(7rem+env(safe-area-inset-top,0px))] lg:px-16';

/** Less top offset so hero/header content sits higher (e.g. Product Compatibility). */
export const bottomNavHubMainTightClass =
  'bottom-nav-hub-main flex min-h-0 flex-1 flex-col px-7 pt-[calc(4.25rem+env(safe-area-inset-top,0px))] sm:px-8 md:px-14 md:pt-[calc(5.25rem+env(safe-area-inset-top,0px))] lg:px-16';

/**
 * Identical to the inner column on `app/style-check/page.tsx`.
 */
export const bottomNavHubInnerClass =
  'mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col px-3 sm:px-4 md:px-6 lg:px-8';

/** Same inline styles as the white card on `app/style-check/page.tsx` (hub upload / library flow). */
export const styleCheckHubWhiteCardStyle: CSSProperties = {
  background: '#FFFFFF',
  border: '2px solid rgba(178, 104, 5, 0.25)',
  color: '#B26805',
};

/**
 * Mobile: `justify-end` + non-growing shell pins the card just above the hub bottom padding
 * (clear of the floating nav). Desktop: unchanged hub rhythm.
 */
export const styleCheckHubWhiteCardOuterClass =
  'flex min-h-0 flex-1 flex-col justify-end pt-2 md:flex-none md:justify-start md:pt-0';

/**
 * Mobile: max height reserves top + **floating nav** band so the card ends visibly above the pill.
 */
export const styleCheckHubWhiteCardShellClass =
  'style-check-hub-white-shell-mobile flex min-h-0 w-full flex-none flex-col overflow-hidden rounded-2xl p-5 md:h-auto md:flex-none md:p-6';

/** Inner scroll — extra bottom padding so the last list row clears the rounded inset. */
export const styleCheckHubWhiteCardScrollClass =
  'flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pb-3 max-md:pb-5 [scroll-padding-bottom:1.25rem] md:gap-5 md:pb-0 md:scroll-pb-0';

/** White card block copied from `app/style-check/page.tsx` (Feeling Inspired / upload section). */
export function StyleCheckHubWhiteCard({
  children,
  surfaceStyle,
  outerClassName,
  shellClassName,
  scrollClassName,
}: {
  children: ReactNode;
  /** Merged over default hub card (e.g. products page dark-brown theme). */
  surfaceStyle?: CSSProperties;
  /** Replaces default outer flex wrapper when set (e.g. fill remaining hub height on desktop). */
  outerClassName?: string;
  /** Appended to the white shell (e.g. min-height on md). */
  shellClassName?: string;
  /** Appended to inner scroll column (e.g. tighter gap between stacked sections). */
  scrollClassName?: string;
}) {
  return (
    <div className={outerClassName ?? styleCheckHubWhiteCardOuterClass}>
      <div
        className={[styleCheckHubWhiteCardShellClass, shellClassName].filter(Boolean).join(' ')}
        style={{ ...styleCheckHubWhiteCardStyle, ...surfaceStyle }}
      >
        <div
          className={[styleCheckHubWhiteCardScrollClass, scrollClassName].filter(Boolean).join(' ')}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export function CaprasimoBricolageFonts() {
  return (
    <style jsx global>{`
      @import url('https://fonts.googleapis.com/css2?family=Caprasimo&family=Bricolage+Grotesque:wght@400;500;600&display=swap');
    `}</style>
  );
}

/** Same outer shell as `app/style-check/page.tsx`. */
export function BottomNavHubShell({
  children,
  background = 'transparent',
  mainAreaClassName,
}: {
  children: ReactNode;
  background?: string;
  /** Override main column padding (default `bottomNavHubMainClass`). */
  mainAreaClassName?: string;
}) {
  return (
    <div className="flex min-h-dvh flex-col" style={{ background }}>
      <CaprasimoBricolageFonts />
      <BottomNav />
      <div className={mainAreaClassName ?? bottomNavHubMainClass}>
        <div className={bottomNavHubInnerClass}>{children}</div>
      </div>
    </div>
  );
}
