'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState } from 'react';
import { APP_PAGE_BACKGROUND } from '@/lib/app-theme';

/**
 * Bump when intro visuals change so devs / users see the new sequence once.
 * (Otherwise `sessionStorage` skips the overlay forever and edits look “unchanged”.)
 */
const SESSION_KEY = 'nywele-opening-sequence-done-v10';

const OpeningSequence = dynamic(() => import('@/components/OpeningSequence'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 400_000,
        background: APP_PAGE_BACKGROUND,
      }}
      aria-hidden
    />
  ),
});

/**
 * Root shell: WebGL opening, then `children`.
 * Production: skipped after first completion (sessionStorage). Development: runs every load so Three.js changes are visible.
 * Wired in `app/layout.tsx` around `{children}`.
 *
 * Children mount only after the intro completes (or session skip) so the route
 * tree (e.g. Chart.js on /dashboard) never competes with the intro for GPU /
 * WebGL while the intro canvas is active.
 */
export default function RootAppWithIntro({ children }: { children: React.ReactNode }) {
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('replayIntro') === '1') {
        sessionStorage.removeItem(SESSION_KEY);
        setShowIntro(true);
        params.delete('replayIntro');
        const q = params.toString();
        const next = `${window.location.pathname}${q ? `?${q}` : ''}${window.location.hash}`;
        window.history.replaceState(null, '', next);
        return;
      }
      // In development, always show the WebGL gate first so edits to OpeningSequence are visible.
      // (In production, remember completion so return visits go straight to the app.)
      const skipWebGlIntro =
        process.env.NODE_ENV === 'production' &&
        sessionStorage.getItem(SESSION_KEY) === '1';
      if (skipWebGlIntro) {
        requestAnimationFrame(() => setShowIntro(false));
      }
    } catch {
      /* private mode / no sessionStorage */
    }
  }, []);

  const handleIntroComplete = useCallback(() => {
    try {
      sessionStorage.setItem(SESSION_KEY, '1');
    } catch {
      /* ignore */
    }
    requestAnimationFrame(() => {
      setShowIntro(false);
    });
  }, []);

  return (
    <>
      {showIntro && (
        <OpeningSequence
          onComplete={handleIntroComplete}
          backgroundColor={APP_PAGE_BACKGROUND}
        />
      )}
      {!showIntro && children}
    </>
  );
}
