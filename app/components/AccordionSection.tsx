'use client';

import { useState, ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

interface AccordionSectionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export default function AccordionSection({ title, children, defaultOpen = false }: AccordionSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className="overflow-hidden rounded-xl"
      style={{
        background: '#FFFCF3',
        border: '1px solid rgba(175, 85, 0, 0.18)',
      }}
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 text-left font-semibold transition-colors hover:opacity-90"
        style={{ color: '#603E12', fontFamily: 'Bricolage Grotesque, sans-serif' }}
      >
        {title}
        <ChevronDown
          className={`h-5 w-5 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          style={{ color: '#603E12' }}
        />
      </button>
      {open && (
        <div
          className="px-4 pb-4 text-sm leading-relaxed md:text-base"
          style={{ color: '#44403C', fontFamily: 'Bricolage Grotesque, sans-serif' }}
        >
          {children}
        </div>
      )}
    </div>
  );
}
