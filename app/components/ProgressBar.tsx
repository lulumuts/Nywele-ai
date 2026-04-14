'use client';

interface ProgressBarProps {
  progress: number;
}

export default function ProgressBar({ progress }: ProgressBarProps) {
  const percent = Math.min(100, Math.max(0, progress));

  return (
    <div className="p-4 flex-shrink-0">
      <div
        className="h-2.5 w-full rounded-full overflow-hidden"
        style={{ background: '#E5E5E5' }}
      >
      <div
        className="h-full rounded-full transition-all duration-300 ease-out"
        style={{
          width: `${percent}%`,
          background: '#B26805',
        }}
      />
      </div>
    </div>
  );
}
