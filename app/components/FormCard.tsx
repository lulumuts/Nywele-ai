'use client';

import { ReactNode } from 'react';

interface FormCardProps {
  children: ReactNode;
  progress?: number;
  className?: string;
}

export default function FormCard({ children, progress = 0, className = '' }: FormCardProps) {
  return (
    <div
      className={`rounded-2xl shadow-lg overflow-hidden ${className}`}
      style={{
        background: '#FFFFFF',
        border: '1px solid rgba(175, 85, 0, 0.2)',
      }}
    >
      {progress >= 0 && (
        <div
          className="h-1 w-full"
          style={{ background: 'rgba(175, 85, 0, 0.15)' }}
        >
          <div
            className="h-full transition-all duration-300 ease-out"
            style={{
              width: `${Math.min(100, Math.max(0, progress))}%`,
              background: '#AF5500',
            }}
          />
        </div>
      )}
      <div className="p-6 md:p-8">{children}</div>
    </div>
  );
}
