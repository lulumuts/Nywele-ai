'use client';

import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

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
        <span className="text-lg font-bold sm:text-xl" style={{ color: '#B26805' }}>
          {total > 0 ? `KES ${total.toLocaleString()}` : '—'}
        </span>
        <span className="text-xs sm:text-sm" style={{ color: '#B26805' }}>
          {total > 0 ? 'Estimated total' : 'Share of top picks'}
        </span>
        </div>
      </div>
      {hasData && (
        <div className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-2.5">
          {labels.map((label, i) =>
            values[i] > 0 && label ? (
              <div key={`${label}-${i}`} className="flex max-w-[10rem] items-center gap-1.5 sm:max-w-none">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: segmentColors[i] }}
                  aria-hidden
                />
                <span className="shrink-0 text-sm font-bold sm:text-base" style={{ color: '#B26805' }}>
                  {total > 0 ? `KES ${values[i].toLocaleString()}` : `${values[i]}%`}
                </span>
                <span className="text-sm leading-snug sm:text-base" style={{ color: '#B26805' }}>
                  {label}
                </span>
              </div>
            ) : null
          )}
        </div>
      )}
    </div>
  );
}
