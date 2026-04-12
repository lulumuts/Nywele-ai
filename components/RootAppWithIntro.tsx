'use client';

import { useCallback, useEffect, useState } from 'react';
import OpeningSequence from '@/components/OpeningSequence';
import { APP_PAGE_BACKGROUND } from '@/lib/app-theme';
import {
  NYWELE_INTRO_CROSSFADE_EVENT,
  OPENING_CROSSFADE_SEC,
} from '@/lib/intro-crossfade';

/**
 * Bump when intro flow or visuals change so prod users see it once with the new behavior.
 */
const SESSION_KEY = 'nywele-opening-sequence-done-v11';

/**
 * Root shell: WebGL opening over `children`, then overlay unmounts.
 * `children` stay mounted under the intro so the bust scan runs first, then routes can fade in
 * (e.g. onboarding image) as the shell opacity fades out.
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

  const emitCrossfade = useCallback(() => {
    window.dispatchEvent(
      new CustomEvent(NYWELE_INTRO_CROSSFADE_EVENT, {
        detail: { durationSec: OPENING_CROSSFADE_SEC },
      }),
    );
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
      {children}
      {showIntro && (
        <OpeningSequence
          onFadeUiStart={emitCrossfade}
          onComplete={handleIntroComplete}
          backgroundColor={APP_PAGE_BACKGROUND}
        />
      )}
    </>
  );
}
