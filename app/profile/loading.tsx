'use client';

import { useEffect } from 'react';
import OpeningSequence from '@/components/OpeningSequence';
import { setIntroContentHoldPending } from '@/lib/intro-crossfade';

export default function Loading() {
  useEffect(() => {
    // If a root intro is currently holding, allow it to proceed once this route is ready to show its loader.
    setIntroContentHoldPending(false);
  }, []);

  return (
    <OpeningSequence
      phasePreset="full"
      holdUntilUnmount
      continuous
        bustScaleMul={1.1}
      cameraPullbackMul={1}
      loadingLabel="Preparing your profile"
    />
  );
}

