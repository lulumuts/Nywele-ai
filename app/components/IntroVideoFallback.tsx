export const INTRO_VIDEO_SRC = '/videos/final-nywele-video.mp4';

/** Full-screen intro video — used for Suspense fallbacks and page load states (matches home intro). */
export default function IntroVideoFallback() {
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
      style={{ background: '#FFFEE1' }}
    >
      <div
        className="absolute overflow-hidden rounded-2xl"
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '92%',
          height: '92%',
          maxWidth: 800,
          maxHeight: 800,
          minWidth: 280,
          minHeight: 280,
          background: '#FFFEE1',
        }}
      >
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          playsInline
          preload="auto"
          style={{ backgroundColor: '#FFFEE1' }}
        >
          <source src={INTRO_VIDEO_SRC} type="video/mp4" />
        </video>
      </div>
    </div>
  );
}
