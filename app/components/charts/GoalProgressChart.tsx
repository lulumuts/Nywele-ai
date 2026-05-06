'use client';

import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { DASHBOARD_CARD_TEXT } from '@/lib/app-theme';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const CHART_COLORS = {
  bar: '#FB8C1C',
  grid: 'rgba(156, 163, 175, 0.3)',
};

const BAR_OPACITIES = [0.2, 0.4, 0.6];
function barColor(i: number) {
  const a = BAR_OPACITIES[i % BAR_OPACITIES.length];
  return `rgba(251, 140, 28, ${a})`;
}

export interface GoalProgressChartProps {
  labels: string[];
  values: number[];
}

export default function GoalProgressChart({ labels, values }: GoalProgressChartProps) {
  const data = {
    labels,
    datasets: [
      {
        label: 'Goal Progress',
        data: values,
        backgroundColor: labels.map((_, i) => barColor(i)),
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const,
    plugins: {
      legend: { display: false },
    },
    layout: { padding: { top: 4, right: 12, bottom: 4, left: 0 } },
    scales: {
      x: {
        min: 0,
        max: 100,
        grid: { color: CHART_COLORS.grid },
        ticks: {
          color: DASHBOARD_CARD_TEXT,
          font: { size: 12, family: 'Bricolage Grotesque, sans-serif' },
          padding: 6,
        },
      },
      y: {
        grid: { display: false },
        ticks: {
          color: DASHBOARD_CARD_TEXT,
          font: { size: 12, family: 'Bricolage Grotesque, sans-serif' },
          padding: 10,
        },
      },
    },
  };

  if (labels.length === 0 || values.length === 0) {
    return (
      <div
        className="flex h-40 items-center justify-center rounded-lg md:h-44"
        style={{ background: 'rgba(100, 49, 0, 0.05)' }}
      >
        <p className="text-sm" style={{ color: DASHBOARD_CARD_TEXT, fontFamily: 'Bricolage Grotesque, sans-serif' }}>
          Add hair goals in your profile to track progress
        </p>
      </div>
    );
  }

  const barCount = Math.max(labels.length, 1);
  const chartMinH = Math.min(420, Math.max(220, 56 + barCount * 44));

  return (
    <div className="w-full" style={{ minHeight: chartMinH, height: chartMinH }}>
      <Bar data={data} options={options} />
    </div>
  );
}
