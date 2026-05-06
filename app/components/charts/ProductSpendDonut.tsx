'use client';

import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { DASHBOARD_CARD_TEXT } from '@/lib/app-theme';

ChartJS.register(ArcElement, Tooltip, Legend);

/** Luminous orange aligned with Routine cards (#FB8C1C) using varying opacities. */
const ORANGE_RGB = '251, 140, 28';
const SLICE_OPACITIES = [0.2, 0.4, 0.6];
function sliceColor(i: number) {
  const a = SLICE_OPACITIES[i % SLICE_OPACITIES.length];
  return `rgba(${ORANGE_RGB}, ${a})`;
}

export interface ProductSpendDonutProps {
  labels: string[];
  values: number[];
  total: number;
  /** Default 'stack' (donut + legend below). Use 'grid2x2' for dashboard layout. */
  layout?: 'stack' | 'grid2x2';
}

export default function ProductSpendDonut({ labels, values, total, layout = 'stack' }: ProductSpendDonutProps) {
  const hasData = values.some((v) => v > 0);

  const segmentColors = labels.map((_, i) => sliceColor(i));

  const data = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: segmentColors,
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 1,
    cutout: '58%',
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: any) => {
            const tot = values.reduce((a, b) => a + b, 0);
            const pct = tot > 0 ? ((ctx.raw / tot) * 100).toFixed(1) : 0;
            return `${ctx.label}: ${ctx.raw.toLocaleString()} (${pct}%)`;
          },
        },
      },
    },
  };

  const donut = (
    <div className="relative mx-auto h-56 w-56 max-w-full sm:h-60 sm:w-60 md:h-64 md:w-64">
      <Doughnut data={data} options={options} />
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold sm:text-xl" style={{ color: DASHBOARD_CARD_TEXT }}>
          {total > 0 ? `KES ${total.toLocaleString()}` : '—'}
        </span>
        <span className="text-xs sm:text-sm" style={{ color: DASHBOARD_CARD_TEXT }}>
          {total > 0 ? 'Estimated total' : 'Share of top picks'}
        </span>
      </div>
    </div>
  );

  const legendItems = labels
    .map((label, i) => ({ label, i, value: values[i] ?? 0 }))
    .filter((x) => x.value > 0 && Boolean(x.label))
    .slice(0, 3);

  if (layout === 'grid2x2') {
    return (
      <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 md:gap-6 md:items-start">
        <div className="rounded-xl p-3 sm:p-4" style={{ background: 'rgba(255, 255, 255, 0.55)' }}>
          {donut}
        </div>

        <div className="grid grid-cols-2 gap-4 sm:gap-5">
          {Array.from({ length: 3 }).map((_, slotIdx) => {
            const item = legendItems[slotIdx];
            if (!item) {
              return (
                <div
                  key={`empty-${slotIdx}`}
                  className="rounded-xl p-4"
                  style={{ background: 'rgba(255, 255, 255, 0.55)' }}
                  aria-hidden
                />
              );
            }
            return (
              <div
                key={`${item.label}-${item.i}`}
                className="rounded-xl p-4"
                style={{ background: 'rgba(255, 255, 255, 0.55)' }}
              >
                <div className="flex items-start gap-3">
                  <span
                    className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: segmentColors[item.i] }}
                    aria-hidden
                  />
                  <div className="min-w-0">
                    <div className="text-sm font-bold tabular-nums" style={{ color: DASHBOARD_CARD_TEXT }}>
                      {total > 0 ? `KES ${item.value.toLocaleString()}` : `${item.value}%`}
                    </div>
                    <div className="text-sm leading-snug break-words" style={{ color: DASHBOARD_CARD_TEXT }}>
                      {item.label}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="rounded-xl p-4" style={{ background: 'rgba(255, 255, 255, 0.55)' }}>
            <div className="text-sm font-bold" style={{ color: DASHBOARD_CARD_TEXT }}>
              Top picks
            </div>
            <div className="text-sm" style={{ color: DASHBOARD_CARD_TEXT }}>
              {legendItems.length > 0 ? `${legendItems.length} shown` : '—'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      {donut}
      {hasData && (
        <div className="mx-auto mt-5 flex w-full max-w-md flex-col gap-4">
          {labels.map((label, i) =>
            values[i] > 0 && label ? (
              <div key={`${label}-${i}`} className="flex gap-3 items-start text-left">
                <span
                  className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: segmentColors[i] }}
                  aria-hidden
                />
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="text-sm font-bold tabular-nums sm:text-base" style={{ color: DASHBOARD_CARD_TEXT }}>
                    {total > 0 ? `KES ${values[i].toLocaleString()}` : `${values[i]}%`}
                  </span>
                  <span className="text-sm leading-snug break-words sm:text-base" style={{ color: DASHBOARD_CARD_TEXT }}>
                    {label}
                  </span>
                </div>
              </div>
            ) : null,
          )}
        </div>
      )}
    </div>
  );
}
