'use client';

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const CHART_COLORS = {
  line: '#643100',
  fill: 'rgba(100, 49, 0, 0.2)',
  grid: 'rgba(156, 163, 175, 0.3)',
};

export interface HealthTrendChartProps {
  dates: string[];
  scores: number[];
}

export default function HealthTrendChart({ dates, scores }: HealthTrendChartProps) {
  const data = {
    labels: dates,
    datasets: [
      {
        label: 'Health Score',
        data: scores,
        borderColor: CHART_COLORS.line,
        backgroundColor: CHART_COLORS.fill,
        fill: true,
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    layout: { padding: { top: 8, right: 8, bottom: 4, left: 4 } },
    scales: {
      x: {
        grid: { color: CHART_COLORS.grid },
        ticks: {
          color: '#9ca3af',
          font: { size: 12, family: 'Bricolage Grotesque, sans-serif' },
          maxRotation: 45,
          autoSkip: true,
        },
      },
      y: {
        min: 0,
        max: 100,
        grid: { color: CHART_COLORS.grid },
        ticks: {
          color: '#9ca3af',
          font: { size: 12, family: 'Bricolage Grotesque, sans-serif' },
          padding: 6,
        },
      },
    },
  };

  if (dates.length === 0 || scores.length === 0) {
    return (
      <div
        className="flex h-64 items-center justify-center rounded-lg md:h-72"
        style={{ background: 'rgba(100, 49, 0, 0.05)' }}
      >
        <p className="text-sm" style={{ color: '#6b7280', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
          Complete a hair scan to see your health trend
        </p>
      </div>
    );
  }

  return (
    <div className="h-64 min-h-[16rem] md:h-72 md:min-h-[18rem]">
      <Line data={data} options={options} />
    </div>
  );
}
