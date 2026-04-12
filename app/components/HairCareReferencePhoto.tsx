'use client';

/** True for data URLs, blob URLs, or http(s) image links. */
export function isDisplayableHairReference(src: string | null | undefined): src is string {
  if (!src || typeof src !== 'string') return false;
  const s = src.trim();
  if (s.length < 12) return false;
  return (
    s.startsWith('data:image/') ||
    s.startsWith('blob:') ||
    /^https?:\/\//i.test(s)
  );
}

export default function HairCareReferencePhoto({
  src,
  compact,
}: {
  src: string | null | undefined;
  /** Tighter layout for dashboard / profile cards */
  compact?: boolean;
}) {
  if (!isDisplayableHairReference(src)) return null;
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
      <div className={`mx-auto w-full shrink-0 sm:mx-0 ${compact ? 'max-w-[160px]' : 'max-w-[220px]'}`}>
        <img
          src={src}
          alt="Photo used for this hair analysis"
          className={`w-full rounded-lg object-cover ${compact ? 'h-36' : 'h-44 sm:min-h-[11rem] sm:max-h-52 sm:h-full'}`}
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold" style={{ color: '#603E12', fontFamily: 'Caprasimo, serif' }}>
          Photo used for this analysis
        </p>
        <p
          className={`mt-2 leading-snug ${compact ? 'text-xs' : 'text-xs sm:text-sm'}`}
          style={{ color: '#6B5344', fontFamily: 'Bricolage Grotesque, sans-serif' }}
        >
          This is the image we analysed to produce the scores and recommendations below.
        </p>
      </div>
    </div>
  );
}
