'use client';

import { useId, type CSSProperties } from 'react';
import { Loader, CheckCircle } from 'lucide-react';

/** Title + body copy on opening / hair-care loading overlay */
const HAIR_ROUTINE_STATUS_TEXT = '#C47204' as const;

/** Same coil path as analytics / test-animation (pairs with `.animated-path` in globals.css) */
const COIL_PATH =
  'M26.4966 2.48801C26.3951 2.53364 19 5.49999 16.9876 6.83816C14.9751 8.17632 12.5 8.99998 11 10.5C9.5 12 8.99996 12.5 6.99998 15C4.99999 17.5 3.37849 22 2.49998 25C1.62146 28 1.4946 31.8377 1.62146 34C1.7588 36.3409 2.43922 39.7477 4.99999 44.5C6.82391 47.8848 11.324 50.4672 13.912 50.9836C16.5 51.5 18.739 52.5752 27.4314 52.3941C30.6672 52.3267 33.607 51.305 37.7457 49.8486C42.891 48.0379 45.9529 46.2163 46.875 45.6195C49.5 43.9205 50.7563 41.0973 51.4698 38.7876C52.0196 37.0077 51.259 35.1854 50.1632 33.8197C48.365 31.5788 43.594 30.5623 39 34.5C35.5 37.5 35.1779 38.9373 33.3263 43.0524C31.1063 47.986 30.7288 51.8903 30.6185 53.7675C30.4765 56.1835 30.886 58.0631 31.4959 59.8257C32.6579 63.1839 34.1784 65.9852 35.4366 67.8103C38.9107 72.8493 42.4709 74.0663 44.473 74.7322C47.2709 75.6628 52.7689 74.3876 57.9048 72.796C61.2178 71.7692 65.7232 69.5839 68.1525 68.3926C70.5817 67.2014 70.7364 66.8879 70.7973 66.5293C70.9233 65.7867 70.5795 64.9206 70.0774 64.14C69.8357 63.7643 69.3855 63.6101 69.026 63.5327C67.0206 63.1012 64.5379 65.1637 63.7591 66.2724C62.2038 68.4866 65.3164 71.8607 66.8905 73.2153C69.8084 74.7556 71.1363 74.9986 73.0121 75.015C74.2992 75.0036 76.2669 74.9524 78.6547 74.461';

/** Copy + checklist for OpeningSequence overlay (hair care analysis / routine generation). */
export function HairRoutineOpeningStatus({
  title = 'Analysing your hair...',
  description,
  showChecklist = true,
  titleStyle: titleStyleProp,
}: {
  title?: string;
  /** Shown under the title when set (e.g. full-screen OpeningSequence). */
  description?: string;
  showChecklist?: boolean;
  /** Override title typography (e.g. Bricolage for hair-care text phase). */
  titleStyle?: CSSProperties;
}) {
  const textStyle = { color: HAIR_ROUTINE_STATUS_TEXT, fontFamily: 'Bricolage Grotesque, sans-serif' } as const;
  const titleStyle = titleStyleProp ?? ({ color: HAIR_ROUTINE_STATUS_TEXT, fontFamily: 'Caprasimo, serif' } as const);

  return (
    <div className="mx-auto w-full max-w-md px-2 text-center">
      <div className="mb-3 flex items-center justify-center gap-2">
        <Loader className="h-5 w-5 shrink-0 animate-spin" style={{ color: HAIR_ROUTINE_STATUS_TEXT }} aria-hidden />
        <h3 className="text-xl font-bold" style={titleStyle}>
          {title}
        </h3>
      </div>
      {description ? (
        <p className="mb-4 text-center text-sm leading-snug" style={textStyle}>
          {description}
        </p>
      ) : null}
      {showChecklist && (
        <div className="mx-auto space-y-2 text-center">
          <p className="flex items-center justify-center gap-2 text-sm" style={textStyle}>
            <CheckCircle className="h-4 w-4 shrink-0" style={{ color: HAIR_ROUTINE_STATUS_TEXT }} aria-hidden />
            Hair type & texture
          </p>
          <p className="flex items-center justify-center gap-2 text-sm" style={textStyle}>
            ... Health & moisture levels
          </p>
          <p className="flex items-center justify-center gap-2 text-sm" style={textStyle}>
            ... Porosity indicators
          </p>
          <p className="flex items-center justify-center gap-2 text-sm" style={textStyle}>
            ... Damage assessment
          </p>
        </div>
      )}
    </div>
  );
}

export function HairRoutineAnalysingLoader({
  title = 'Analysing your hair...',
  showChecklist = true,
  className = '',
}: {
  title?: string;
  /** Set false e.g. while generating a style image */
  showChecklist?: boolean;
  className?: string;
}) {
  const rawId = useId();
  const gradientId = `hair-loader-grad-${rawId.replace(/:/g, '')}`;

  return (
    <div className={`text-center max-w-md px-4 mx-auto ${className}`}>
      <div className="animate-fade-in">
        <svg
          width={150}
          height={150}
          viewBox="0 0 81 77"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid meet"
          className="mx-auto mb-4 block"
          aria-hidden
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#643100" />
              <stop offset="100%" stopColor="#AF5500" />
            </linearGradient>
          </defs>
          <path className="animated-path" stroke={`url(#${gradientId})`} d={COIL_PATH} />
        </svg>
      </div>
      <HairRoutineOpeningStatus title={title} showChecklist={showChecklist} />
    </div>
  );
}
