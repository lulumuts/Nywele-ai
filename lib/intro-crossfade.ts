/**
 * Shared intro / onboarding handoff — no React, safe for any client chunk (avoids circular imports).
 */
/** GLB for `OpeningSequence`; keep in sync with preload in root layout. */
export const OPENING_GLB_URL = '/Final-nywele.glb?v=4' as const;

let openingGlbCached: ArrayBuffer | null = null;
let openingGlbInflight: Promise<ArrayBuffer> | null = null;

/**
 * Start the GLB download as early as possible (deduped across remounts / Strict Mode).
 * Pair with `<link rel="preload">` in layout so the bust can appear as soon as WebGL is ready.
 */
export function prefetchOpeningGlb(): Promise<ArrayBuffer> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('prefetchOpeningGlb is client-only'));
  }
  if (openingGlbCached) return Promise.resolve(openingGlbCached);
  if (openingGlbInflight) return openingGlbInflight;
  openingGlbInflight = fetch(OPENING_GLB_URL, { priority: 'high' } as RequestInit)
    .then((res) => {
      if (!res.ok) throw new Error(`Opening GLB HTTP ${res.status}`);
      return res.arrayBuffer();
    })
    .then((buf) => {
      openingGlbCached = buf;
      openingGlbInflight = null;
      return buf;
    })
    .catch((err) => {
      openingGlbInflight = null;
      throw err;
    });
  return openingGlbInflight;
}

if (typeof window !== 'undefined') {
  queueMicrotask(() => {
    void prefetchOpeningGlb().catch(() => {
      /* OpeningSequence `boot()` retries */
    });
  });
}

export const OPENING_CROSSFADE_SEC = 0.4 as const;

export const NYWELE_INTRO_CROSSFADE_EVENT = 'nywele-intro-crossfade' as const;

/** Extra seconds after min hold while waiting for first-paint assets; avoids a stuck intro. */
export const INTRO_HOLD_CONTENT_MAX_SEC = 14 as const;

let introContentHoldPending = false;

/** Routes that load under the WebGL intro call this so the bust stays in hold until assets are ready. */
export function setIntroContentHoldPending(value: boolean) {
  introContentHoldPending = value;
}

export function getIntroContentHoldPending() {
  return introContentHoldPending;
}
