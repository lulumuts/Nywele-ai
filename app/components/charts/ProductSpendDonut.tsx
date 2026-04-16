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

/** Three brown shades for the top product slices (darkest → lightest). */
const CHART_COLORS = ['#4A320F', '#7A4A1C', '#C48B4C'];

export interface ProductSpendDonutProps {
  labels: string[];
  values: number[];
  total: number;
}

export default function ProductSpendDonut({ labels, values, total }: ProductSpendDonutProps) {
  const hasData = values.some((v) => v > 0);

  const segmentColors = labels.map((_, i) => CHART_COLORS[Math.min(i, CHART_COLORS.length - 1)]);

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

  return (
    <div className="flex flex-col items-center">
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
                  <span
                    className="text-sm font-bold tabular-nums sm:text-base"
                    style={{ color: DASHBOARD_CARD_TEXT }}
                  >
                    {total > 0 ? `KES ${values[i].toLocaleString()}` : `${values[i]}%`}
                  </span>
                  <span
                    className="text-sm leading-snug break-words sm:text-base"
                    style={{ color: DASHBOARD_CARD_TEXT }}
                  >
                    {label}
                  </span>
                </div>
              </div>
            ) : null
          )}
        </div>
      )}
    </div>
  );
}
