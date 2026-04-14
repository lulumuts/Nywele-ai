/** Legacy asset path (e.g. tests / tools); home intro now uses WebGL `OpeningSequence` in layout. */
export const INTRO_VIDEO_SRC = '/videos/final-nywele-video.mp4';

/** Full-screen loading shell: matches opening plate + subtle grid hint (no video, no second intro). */
export default function IntroVideoFallback() {
  return (
    <div
      className="fixed inset-0 z-[9999] overflow-hidden"
           style={{ background: 'transparent' }}
      role="progressbar"
      aria-label="Loading"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.22]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, #FFF4C1 2px, #FFF4C1 3px)',
        }}
      />
    </div>
  );
}
