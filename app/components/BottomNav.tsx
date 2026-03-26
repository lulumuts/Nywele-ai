'use client';

import type { FC } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import { Home, ScanLine } from 'lucide-react';

function StyleCheckNavIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 54 52"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <g clipPath="url(#bottomNavStyleCheckClip)">
        <path
          d="M46.4251 51.4978H35.3715V47.2063H46.4251C47.0114 47.2063 47.5737 46.9803 47.9883 46.5779C48.4029 46.1755 48.6358 45.6297 48.6358 45.0606V34.3321H53.0573V45.0606C53.0573 46.7679 52.3586 48.4052 51.1148 49.6124C49.871 50.8196 48.1841 51.4978 46.4251 51.4978Z"
          fill="currentColor"
        />
        <path
          d="M4.42147 17.1657H0V6.43714C0 4.7299 0.698748 3.09259 1.94253 1.88539C3.18631 0.678196 4.87323 0 6.6322 0L17.6859 0V4.29143H6.6322C6.04588 4.29143 5.48357 4.51749 5.06898 4.91989C4.65438 5.32229 4.42147 5.86806 4.42147 6.43714V17.1657Z"
          fill="currentColor"
        />
        <path
          d="M17.6859 51.4978H6.6322C4.87323 51.4978 3.18631 50.8196 1.94253 49.6124C0.698748 48.4052 0 46.7679 0 45.0606L0 34.3321H4.42147V45.0606C4.42147 45.6297 4.65438 46.1755 5.06898 46.5779C5.48357 46.9803 6.04588 47.2063 6.6322 47.2063H17.6859V51.4978Z"
          fill="currentColor"
        />
        <path
          d="M53.0573 17.1657H48.6358V6.43711C48.6358 5.86803 48.4029 5.32226 47.9883 4.91986C47.5737 4.51746 47.0114 4.29139 46.4251 4.29139H35.3715V-3.05176e-05H46.4251C48.1841 -3.05176e-05 49.871 0.678166 51.1148 1.88536C52.3586 3.09256 53.0573 4.72987 53.0573 6.43711V17.1657Z"
          fill="currentColor"
        />
      </g>
      <path
        d="M22.4793 12.8706C22.4428 12.887 19.7866 13.9525 19.0637 14.4332C18.3408 14.9138 17.4518 15.2097 16.913 15.7485C16.3742 16.2873 16.1946 16.4668 15.4762 17.3648C14.7578 18.2628 14.1754 19.8792 13.8599 20.9568C13.5443 22.0344 13.4987 23.4128 13.5443 24.1895C13.5936 25.0304 13.838 26.2541 14.7578 27.961C15.413 29.1768 17.0294 30.1044 17.959 30.2899C18.8886 30.4754 19.6928 30.8616 22.8151 30.7966C23.9773 30.7724 25.0333 30.4054 26.5199 29.8822C28.3681 29.2318 29.4679 28.5775 29.7991 28.3632C30.742 27.7529 31.1932 26.7388 31.4495 25.9092C31.647 25.2699 31.3738 24.6153 30.9802 24.1248C30.3343 23.3198 28.6206 22.9547 26.9704 24.3691C25.7133 25.4467 25.5976 25.963 24.9325 27.4411C24.1351 29.2132 23.9995 30.6156 23.9598 31.2899C23.9088 32.1577 24.0559 32.8328 24.275 33.4659C24.6924 34.6722 25.2385 35.6784 25.6905 36.334C26.9384 38.1439 28.2172 38.5811 28.9363 38.8203C29.9413 39.1545 31.9161 38.6965 33.7609 38.1248C34.9509 37.756 36.5692 36.971 37.4418 36.5431C38.3144 36.1153 38.3699 36.0026 38.3918 35.8738C38.4371 35.6071 38.3136 35.296 38.1332 35.0156C38.0464 34.8807 37.8847 34.8253 37.7556 34.7975C37.0353 34.6425 36.1435 35.3833 35.8637 35.7816C35.3051 36.5769 36.4231 37.7888 36.9885 38.2754C38.0366 38.8287 38.5136 38.916 39.1874 38.9218C39.6497 38.9178 40.3565 38.8994 41.2141 38.7229"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <defs>
        <clipPath id="bottomNavStyleCheckClip">
          <rect width="53.0576" height="51.4971" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

function ProductScanNavIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 27 27"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M14.5 4.5C14.5 3.94772 14.0523 3.5 13.5 3.5C12.9477 3.5 12.5 3.94772 12.5 4.5H13.5H14.5ZM12.5 5.625C12.5 6.17728 12.9477 6.625 13.5 6.625C14.0523 6.625 14.5 6.17728 14.5 5.625H13.5H12.5ZM20.25 17C19.6977 17 19.25 17.4477 19.25 18C19.25 18.5523 19.6977 19 20.25 19V18V17ZM22.5 19C23.0523 19 23.5 18.5523 23.5 18C23.5 17.4477 23.0523 17 22.5 17V18V19ZM13.5 18V17C12.9477 17 12.5 17.4477 12.5 18H13.5ZM15.75 19C16.3023 19 16.75 18.5523 16.75 18C16.75 17.4477 16.3023 17 15.75 17V18V19ZM12.5 22.5C12.5 23.0523 12.9477 23.5 13.5 23.5C14.0523 23.5 14.5 23.0523 14.5 22.5H13.5H12.5ZM14.5 10.125C14.5 9.57272 14.0523 9.125 13.5 9.125C12.9477 9.125 12.5 9.57272 12.5 10.125H13.5H14.5ZM13.5 13.5H12.5C12.5 14.0523 12.9477 14.5 13.5 14.5V13.5ZM18 21.5C17.4477 21.5 17 21.9477 17 22.5C17 23.0523 17.4477 23.5 18 23.5V22.5V21.5ZM22.5 23.5C23.0523 23.5 23.5 23.0523 23.5 22.5C23.5 21.9477 23.0523 21.5 22.5 21.5V22.5V23.5ZM4.5 12.5C3.94772 12.5 3.5 12.9477 3.5 13.5C3.5 14.0523 3.94772 14.5 4.5 14.5V13.5V12.5ZM9 14.5C9.55228 14.5 10 14.0523 10 13.5C10 12.9477 9.55228 12.5 9 12.5V13.5V14.5ZM13.5113 14.5C14.0635 14.5 14.5113 14.0523 14.5113 13.5C14.5113 12.9477 14.0635 12.5 13.5113 12.5V13.5V14.5ZM18.0113 14.5C18.5635 14.5 19.0113 14.0523 19.0113 13.5C19.0113 12.9477 18.5635 12.5 18.0113 12.5V13.5V14.5ZM22.5 12.5C21.9477 12.5 21.5 12.9477 21.5 13.5C21.5 14.0523 21.9477 14.5 22.5 14.5V13.5V12.5ZM22.5112 14.5C23.0635 14.5 23.5112 14.0523 23.5112 13.5C23.5112 12.9477 23.0635 12.5 22.5112 12.5V13.5V14.5ZM5.625 4.5V5.5H7.875V4.5V3.5H5.625V4.5ZM9 5.625H8V7.875H9H10V5.625H9ZM7.875 9V8H5.625V9V10H7.875V9ZM4.5 7.875H5.5V5.625H4.5H3.5V7.875H4.5ZM5.625 9V8C5.55596 8 5.5 7.94404 5.5 7.875H4.5H3.5C3.5 9.0486 4.45139 10 5.625 10V9ZM9 7.875H8C8 7.94404 7.94404 8 7.875 8V9V10C9.0486 10 10 9.0486 10 7.875H9ZM7.875 4.5V5.5C7.94404 5.5 8 5.55596 8 5.625H9H10C10 4.45139 9.0486 3.5 7.875 3.5V4.5ZM5.625 4.5V3.5C4.45139 3.5 3.5 4.45139 3.5 5.625H4.5H5.5C5.5 5.55596 5.55596 5.5 5.625 5.5V4.5ZM19.125 4.5V5.5H21.375V4.5V3.5H19.125V4.5ZM22.5 5.625H21.5V7.875H22.5H23.5V5.625H22.5ZM21.375 9V8H19.125V9V10H21.375V9ZM18 7.875H19V5.625H18H17V7.875H18ZM19.125 9V8C19.056 8 19 7.94404 19 7.875H18H17C17 9.0486 17.9514 10 19.125 10V9ZM22.5 7.875H21.5C21.5 7.94404 21.444 8 21.375 8V9V10C22.5486 10 23.5 9.0486 23.5 7.875H22.5ZM21.375 4.5V5.5C21.444 5.5 21.5 5.55596 21.5 5.625H22.5H23.5C23.5 4.45139 22.5486 3.5 21.375 3.5V4.5ZM19.125 4.5V3.5C17.9514 3.5 17 4.45139 17 5.625H18H19C19 5.55596 19.056 5.5 19.125 5.5V4.5ZM5.625 18V19H7.875V18V17H5.625V18ZM9 19.125H8V21.375H9H10V19.125H9ZM7.875 22.5V21.5H5.625V22.5V23.5H7.875V22.5ZM4.5 21.375H5.5V19.125H4.5H3.5V21.375H4.5ZM5.625 22.5V21.5C5.55596 21.5 5.5 21.444 5.5 21.375H4.5H3.5C3.5 22.5486 4.45139 23.5 5.625 23.5V22.5ZM9 21.375H8C8 21.444 7.94404 21.5 7.875 21.5V22.5V23.5C9.0486 23.5 10 22.5486 10 21.375H9ZM7.875 18V19C7.94404 19 8 19.056 8 19.125H9H10C10 17.9514 9.0486 17 7.875 17V18ZM5.625 18V17C4.45139 17 3.5 17.9514 3.5 19.125H4.5H5.5C5.5 19.056 5.55596 19 5.625 19V18ZM13.5 4.5H12.5V5.625H13.5H14.5V4.5H13.5ZM20.25 18V19H22.5V18V17H20.25V18ZM13.5 18V19H15.75V18V17H13.5V18ZM13.5 18H12.5V22.5H13.5H14.5V18H13.5ZM13.5 10.125H12.5V13.5H13.5H14.5V10.125H13.5ZM18 22.5V23.5H22.5V22.5V21.5H18V22.5ZM4.5 13.5V14.5H9V13.5V12.5H4.5V13.5ZM13.5 13.5V14.5H13.5113V13.5V12.5H13.5V13.5ZM22.5 13.5V14.5H22.5112V13.5V12.5H22.5V13.5ZM13.5 13.5V14.5H18.0113V13.5V12.5H13.5V13.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

type NavItem =
  | { name: string; href: string; kind: 'lucide'; Icon: LucideIcon }
  | { name: string; href: string; kind: 'custom'; Icon: FC<{ className?: string }> };

const navItems: NavItem[] = [
  { name: 'home', href: '/dashboard', kind: 'lucide', Icon: Home },
  { name: 'scan profile', href: '/hair-care', kind: 'lucide', Icon: ScanLine },
  { name: 'product scan', href: '/products', kind: 'custom', Icon: ProductScanNavIcon },
  { name: 'style check', href: '/style-check', kind: 'custom', Icon: StyleCheckNavIcon },
];

export default function BottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard' || pathname === '/';
    if (href === '/style-check') return pathname.startsWith('/style-check');
    return pathname.startsWith(href);
  };

  return (
    <nav
      className="fixed left-0 right-0 z-50 shadow-lg md:shadow-none
        bottom-0 top-auto rounded-t-2xl
        md:top-0 md:bottom-auto md:rounded-none
        border-t border-[rgba(175,85,0,0.15)] md:border-0
        bg-white md:bg-transparent"
    >
      <div className="flex items-center justify-around md:justify-between gap-2 py-3 px-2 md:pr-8 md:pl-6 max-w-6xl mx-auto w-full">
        <Link
          href="/dashboard"
          className="hidden shrink-0 items-center md:flex"
          aria-label="Home"
        >
          <img src="/icons/coil.svg" alt="" className="h-8 w-8" />
        </Link>
        <div className="flex w-full min-w-0 flex-1 items-center justify-around md:w-auto md:flex-initial md:justify-end md:gap-8">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center gap-0.5 min-w-[64px] py-1 rounded-xl transition-colors"
                style={{
                  color: active ? '#DD8106' : '#9CA3AF',
                  backgroundColor: active ? 'rgba(221, 129, 6, 0.08)' : 'transparent',
                }}
              >
                {item.kind === 'lucide' ? (
                  <item.Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
                ) : (
                  <item.Icon className="h-5 w-5 shrink-0" />
                )}
                <span
                  className="text-[10px] font-medium capitalize"
                  style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
