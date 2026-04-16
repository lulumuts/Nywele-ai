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
  headingColor = '#B26805',
  bodyColor = '#B26805',
  alignStart = false,
}: {
  src: string | null | undefined;
  /** Tighter layout for dashboard / profile cards */
  compact?: boolean;
  headingColor?: string;
  bodyColor?: string;
  /** Left-align block (e.g. photo column beside metrics). */
  alignStart?: boolean;
}) {
  if (!isDisplayableHairReference(src)) return null;
  return (
    <div
      className={`flex flex-col gap-3 ${alignStart ? 'items-start text-left' : 'items-center text-center'}`}
    >
      <div className={`w-full shrink-0 ${compact ? 'max-w-[160px]' : 'max-w-[220px]'}`}>
        <img
          src={src}
          alt="Photo used for this hair analysis"
          className={`w-full rounded-lg object-cover ${compact ? 'h-36' : 'h-44 sm:min-h-[11rem] sm:max-h-52 sm:h-full'}`}
        />
      </div>
      <div className="w-full max-w-md">
        <p
          className="text-sm font-semibold uppercase tracking-wide"
          style={{ color: headingColor, fontFamily: 'Bricolage Grotesque, sans-serif' }}
        >
          Photo used for this analysis
        </p>
        <p
          className={`mt-2 leading-snug ${compact ? 'text-xs' : 'text-xs sm:text-sm'}`}
          style={{ color: bodyColor, fontFamily: 'Bricolage Grotesque, sans-serif' }}
        >
          This is the image we analysed to produce the scores and recommendations below.
        </p>
      </div>
    </div>
  );
}
