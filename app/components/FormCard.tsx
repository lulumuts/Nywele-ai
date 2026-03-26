'use client';

import { ReactNode } from 'react';
import ProgressBar from './ProgressBar';

interface FormCardProps {
  children: ReactNode;
  progress?: number;
  className?: string;
}

export default function FormCard({ children, progress = 0, className = '' }: FormCardProps) {
  return (
    <div
      className={`rounded-2xl shadow-lg overflow-hidden flex flex-col min-h-0 ${className}`}
      style={{
        background: '#FFFFFF',
        border: '1px solid rgba(175, 85, 0, 0.2)',
      }}
    >
      {progress >= 0 && <ProgressBar progress={progress} />}
      <div className="p-6 md:p-8 flex-1 min-h-0 overflow-auto">{children}</div>
    </div>
  );
}
