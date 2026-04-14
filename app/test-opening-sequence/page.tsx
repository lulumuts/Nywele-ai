'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { APP_PAGE_BACKGROUND } from '@/lib/app-theme';

const OpeningSequence = dynamic(() => import('@/components/OpeningSequence'), {
  ssr: false,
});

/**
 * Dev route: full-screen R3F opening, then a replay control.
 * Run `npm run dev` and open http://localhost:3000/test-opening-sequence
 */
export default function TestOpeningSequencePage() {
  const [showOpening, setShowOpening] = useState(true);
  const [runs, setRuns] = useState(0);

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-4 bg-transparent p-8"
      style={{
        fontFamily: 'Bricolage Grotesque, sans-serif',
      }}
    >
      {showOpening && (
        <OpeningSequence
          key={runs}
          onComplete={() => setShowOpening(false)}
          backgroundColor={APP_PAGE_BACKGROUND}
        />
      )}

      {!showOpening && (
        <div className="max-w-md text-center">
          <p className="mb-2 text-lg font-semibold" style={{ color: '#B26805' }}>
            Opening sequence finished
          </p>
          <p className="mb-6 text-sm" style={{ color: '#B26805' }}>
            The reveal sequence completed and the overlay unmounted. Use replay to test again.
          </p>
          <button
            type="button"
            onClick={() => {
              setRuns((r) => r + 1);
              setShowOpening(true);
            }}
            className="rounded-xl px-6 py-3 font-semibold text-white"
            style={{ background: '#643100' }}
          >
            Replay opening
          </button>
        </div>
      )}
    </div>
  );
}
