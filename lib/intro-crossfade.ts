/**
 * Shared intro / onboarding handoff — no React, safe for any client chunk (avoids circular imports).
 */
export const OPENING_CROSSFADE_SEC = 0.55 as const;

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
