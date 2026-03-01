'use client'

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { PricePoint, StockSignalResult } from '@/lib/stockAnalysis';

type SentimentRange = 'days' | 'months' | 'years';

interface SentimentPredictionPoint {
  [horizon: string]: {
    expected: string;
  };
}

interface SentimentEntry {
  timestamp: number;
  confidence: number;
  reputation: 'HIGH' | 'MEDIUM' | 'LOW' | string;
  sentimentText: string;
  futurePredictions: {
    days: SentimentPredictionPoint[];
    months: SentimentPredictionPoint[];
    years: SentimentPredictionPoint[];
  };
}

interface MiniSparkPoint {
  xLabel: string;
  yValue: number;
  tooltip: string;
  timestamp?: number;
}

interface TickerSectionProps {
  signal: StockSignalResult;
  series: PricePoint[];
  marketState: string;
  sentimentSeries: SentimentEntry[];
  pageLoadTimestamp: number;
}

function formatNumber(value: number | null, decimals = 2): string {
  if (value === null || Number.isNaN(value)) return '-';
  return value.toFixed(decimals);
}

function valuationPill(valuation: StockSignalResult['valuation']): string {
  if (valuation === 'Undervalued') {
    return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
  }
  if (valuation === 'Overvalued') {
    return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
  }
  return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200';
}

function parseExpectedPercent(value: string): number {
  const cleaned = value.replace('%', '').trim();
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

function buildConfidencePoints(entries: SentimentEntry[], range: SentimentRange): MiniSparkPoint[] {
  if (entries.length === 0) return [];

  const latestTimestamp = entries[entries.length - 1].timestamp;

  const daysWindow = entries.filter((entry) => latestTimestamp - entry.timestamp <= 30 * 24 * 60 * 60 * 1000);
  const monthsWindow = entries.filter((entry) => latestTimestamp - entry.timestamp <= 365 * 24 * 60 * 60 * 1000);
  const yearsWindow = entries.filter((entry) => latestTimestamp - entry.timestamp <= 5 * 365 * 24 * 60 * 60 * 1000);

  if (range === 'days') {
    return (daysWindow.length > 0 ? daysWindow : entries.slice(-30)).map((entry) => ({
      xLabel: String(entry.timestamp),
      yValue: entry.confidence,
      tooltip: `${entry.confidence.toFixed(1)} • ${new Date(entry.timestamp).toLocaleDateString()}`,
      timestamp: entry.timestamp,
    }));
  }

  const targetBuckets = range === 'months' ? 12 : 5;
  const source = range === 'months'
    ? (monthsWindow.length > 0 ? monthsWindow : entries)
    : (yearsWindow.length > 0 ? yearsWindow : entries);
  const bucketSize = Math.max(1, Math.ceil(source.length / targetBuckets));
  const buckets: MiniSparkPoint[] = [];

  for (let index = 0; index < source.length; index += bucketSize) {
    const slice = source.slice(index, index + bucketSize);
    if (slice.length === 0) continue;

    const avgConfidence = slice.reduce((sum, entry) => sum + entry.confidence, 0) / slice.length;
    const startTime = new Date(slice[0].timestamp).toLocaleDateString();
    const endTime = new Date(slice[slice.length - 1].timestamp).toLocaleDateString();

    buckets.push({
      xLabel: String(slice[slice.length - 1].timestamp),
      yValue: Number(avgConfidence.toFixed(2)),
      tooltip: `${avgConfidence.toFixed(1)} • ${startTime}-${endTime}`,
      timestamp: slice[slice.length - 1].timestamp,
    });
  }

  return buckets;
}

function MiniSparkline({
  points,
  lineClass,
  pageLoadTimestamp,
}: {
  points: MiniSparkPoint[];
  lineClass: string;
  pageLoadTimestamp: number;
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (points.length === 0) {
    return (
      <div className="h-16 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-[11px] text-slate-500 dark:text-slate-400">
        No data
      </div>
    );
  }

  const minValue = Math.min(...points.map((point) => point.yValue));
  const maxValue = Math.max(...points.map((point) => point.yValue));
  const range = Math.max(0.0001, maxValue - minValue);
  const hoveredPoint = hoveredIndex !== null ? points[hoveredIndex] : null;
  const x = hoveredIndex !== null
    ? (hoveredIndex / Math.max(1, points.length - 1)) * 300
    : null;
  const y = hoveredPoint
    ? 56 - ((hoveredPoint.yValue - minValue) / range) * 52
    : null;

  return (
    <div className="h-16 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-1.5 relative">
      <svg
        viewBox="0 0 300 60"
        className="w-full h-full"
        preserveAspectRatio="none"
        onMouseMove={(event) => {
          const bounds = event.currentTarget.getBoundingClientRect();
          const relativeX = event.clientX - bounds.left;
          const ratio = Math.max(0, Math.min(1, relativeX / bounds.width));
          const index = Math.round(ratio * Math.max(0, points.length - 1));
          setHoveredIndex(index);
        }}
        onMouseLeave={() => setHoveredIndex(null)}
      >
        <polyline
          fill="none"
          stroke="currentColor"
          className={lineClass}
          strokeWidth="2"
          points={points
            .map((point, index) => {
              const chartX = (index / Math.max(1, points.length - 1)) * 300;
              const normalized = (point.yValue - minValue) / range;
              const chartY = 56 - normalized * 52;
              return `${chartX},${chartY}`;
            })
            .join(' ')}
        />
        {points.map((point, index) => {
          if (!point.timestamp || point.timestamp <= pageLoadTimestamp) {
            return null;
          }

          const chartX = (index / Math.max(1, points.length - 1)) * 300;
          const normalized = (point.yValue - minValue) / range;
          const chartY = 56 - normalized * 52;

          return (
            <circle
              key={`${point.xLabel}-${index}`}
              cx={chartX}
              cy={chartY}
              r={2.2}
              fill="currentColor"
              className="text-emerald-500 dark:text-emerald-400"
            />
          );
        })}
        {hoveredPoint && x !== null && y !== null && (
          <>
            <line x1={x} y1={4} x2={x} y2={56} stroke="currentColor" className="text-slate-400 dark:text-slate-500" strokeDasharray="2 2" />
            <circle
              cx={x}
              cy={y}
              r={2.4}
              fill="currentColor"
              className={hoveredPoint.timestamp && hoveredPoint.timestamp > pageLoadTimestamp ? 'text-emerald-500 dark:text-emerald-400' : lineClass}
            />
          </>
        )}
      </svg>
      {hoveredPoint && x !== null && (
        <div
          className="absolute -top-8 z-10 px-2 py-1 rounded-md text-[11px] bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 whitespace-nowrap pointer-events-none"
          style={{ left: `${(x / 300) * 100}%`, transform: 'translateX(-50%)' }}
        >
          {hoveredPoint.tooltip}{hoveredPoint.timestamp && hoveredPoint.timestamp > pageLoadTimestamp ? ' • New' : ''}
        </div>
      )}
    </div>
  );
}

function SparklineChart({ points, pageLoadTimestamp }: { points: PricePoint[]; pageLoadTimestamp: number }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (points.length === 0) {
    return (
      <div className="mb-4 h-20 w-full rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2 flex items-center justify-center text-xs text-slate-500 dark:text-slate-400">
        No chart data
      </div>
    );
  }

  const minPrice = Math.min(...points.map((point) => point.price));
  const maxPrice = Math.max(...points.map((point) => point.price));
  const range = Math.max(0.0001, maxPrice - minPrice);

  const hoveredPoint = hoveredIndex !== null ? points[hoveredIndex] : null;
  const x = hoveredIndex !== null
    ? (hoveredIndex / Math.max(1, points.length - 1)) * 300
    : null;
  const y = hoveredPoint
    ? 56 - ((hoveredPoint.price - minPrice) / range) * 52
    : null;

  return (
    <div className="mb-4 h-20 w-full rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2 relative">
      <svg
        viewBox="0 0 300 60"
        className="w-full h-full"
        preserveAspectRatio="none"
        onMouseMove={(event) => {
          const bounds = event.currentTarget.getBoundingClientRect();
          const relativeX = event.clientX - bounds.left;
          const ratio = Math.max(0, Math.min(1, relativeX / bounds.width));
          const index = Math.round(ratio * Math.max(0, points.length - 1));
          setHoveredIndex(index);
        }}
        onMouseLeave={() => setHoveredIndex(null)}
      >
        <polyline
          fill="none"
          stroke="currentColor"
          className="text-blue-600 dark:text-blue-400"
          strokeWidth="2"
          points={points
            .map((point, index) => {
              const chartX = (index / Math.max(1, points.length - 1)) * 300;
              const normalized = (point.price - minPrice) / range;
              const chartY = 56 - normalized * 52;
              return `${chartX},${chartY}`;
            })
            .join(' ')}
        />
        {points.map((point, index) => {
          if (point.timestamp <= pageLoadTimestamp) {
            return null;
          }

          const chartX = (index / Math.max(1, points.length - 1)) * 300;
          const normalized = (point.price - minPrice) / range;
          const chartY = 56 - normalized * 52;

          return (
            <circle
              key={`${point.timestamp}-${index}`}
              cx={chartX}
              cy={chartY}
              r={2.4}
              fill="currentColor"
              className="text-emerald-500 dark:text-emerald-400"
            />
          );
        })}
        {hoveredPoint && x !== null && y !== null && (
          <>
            <line x1={x} y1={4} x2={x} y2={56} stroke="currentColor" className="text-slate-400 dark:text-slate-500" strokeDasharray="2 2" />
            <circle
              cx={x}
              cy={y}
              r={2.8}
              fill="currentColor"
              className={hoveredPoint.timestamp > pageLoadTimestamp ? 'text-emerald-500 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'}
            />
          </>
        )}
      </svg>
      {hoveredPoint && x !== null && (
        <div
          className="absolute -top-9 z-10 px-2 py-1 rounded-md text-xs bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 whitespace-nowrap pointer-events-none"
          style={{
            left: `${(x / 300) * 100}%`,
            transform: 'translateX(-50%)',
          }}
        >
          ${formatNumber(hoveredPoint.price)} • {new Date(hoveredPoint.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{hoveredPoint.timestamp > pageLoadTimestamp ? ' • New' : ''}
        </div>
      )}
    </div>
  );
}

export default function TickerSection({
  signal,
  series,
  marketState,
  sentimentSeries,
  pageLoadTimestamp,
}: TickerSectionProps) {
  const [chartView, setChartView] = useState<'auto' | 'recent' | 'full'>('full');
  const [sentimentRange, setSentimentRange] = useState<SentimentRange>('days');
  const [isSentimentCollapsed, setIsSentimentCollapsed] = useState(true);

  const shouldUseFull = chartView === 'full' || (chartView === 'auto' && marketState === 'CLOSED');
  const chartPoints = shouldUseFull ? series : series.slice(-30);
  const latestSentiment = sentimentSeries[sentimentSeries.length - 1] ?? null;

  // Calculate daily percentage change
  const firstPrice = series[0]?.price;
  const latestPrice = signal.latestPrice;
  const percentChange = firstPrice && latestPrice 
    ? ((latestPrice - firstPrice) / firstPrice) * 100 
    : null;
  const changeColor = percentChange !== null
    ? percentChange >= 0 
      ? 'text-emerald-600 dark:text-emerald-400'
      : 'text-red-600 dark:text-red-400'
    : 'text-gray-600 dark:text-gray-400';
  const changeSign = percentChange !== null && percentChange >= 0 ? '+' : '';

  const confidencePoints: MiniSparkPoint[] = buildConfidencePoints(sentimentSeries, sentimentRange);

  const selectedPredictionList = latestSentiment
    ? latestSentiment.futurePredictions[sentimentRange] ?? []
    : [];

  const growthPoints: MiniSparkPoint[] = selectedPredictionList
    .map((prediction) => {
      const horizon = Object.keys(prediction)[0];
      const expected = prediction[horizon]?.expected ?? '0%';
      return {
        horizon: Number(horizon),
        point: {
          xLabel: horizon,
          yValue: parseExpectedPercent(expected),
          tooltip: `${horizon}${sentimentRange === 'days' ? 'd' : sentimentRange === 'months' ? 'm' : 'y'} • ${expected}`,
        },
      };
    })
    .sort((left, right) => left.horizon - right.horizon)
    .map((entry) => entry.point);

  return (
    <article className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-bold">{signal.ticker}</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Price ${formatNumber(signal.latestPrice)}
            {percentChange !== null && (
              <span className={`ml-2 font-semibold ${changeColor}`}>
                {changeSign}{formatNumber(percentChange)}%
              </span>
            )}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Trend {signal.trend}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-md border border-slate-200 dark:border-slate-600 overflow-hidden">
              <button
                onClick={() => setChartView('auto')}
                className={`px-2 py-0.5 text-[11px] ${chartView === 'auto' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
              >
                Auto
              </button>
              <button
                onClick={() => setChartView('recent')}
                className={`px-2 py-0.5 text-[11px] border-l border-slate-200 dark:border-slate-600 ${chartView === 'recent' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
              >
                Last 30m
              </button>
              <button
                onClick={() => setChartView('full')}
                className={`px-2 py-0.5 text-[11px] border-l border-slate-200 dark:border-slate-600 ${chartView === 'full' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
              >
                Daily
              </button>
            </div>
          </div>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${valuationPill(signal.valuation)}`}>
          {signal.valuation}
        </span>
      </div>

      <SparklineChart points={chartPoints} pageLoadTimestamp={pageLoadTimestamp} />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm mb-4">
        <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900">
          <p className="text-gray-500 dark:text-gray-400">SMA 20</p>
          <p className="font-semibold">{formatNumber(signal.sma20)}</p>
        </div>
        <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900">
          <p className="text-gray-500 dark:text-gray-400">SMA 50</p>
          <p className="font-semibold">{formatNumber(signal.sma50)}</p>
        </div>
        <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900">
          <p className="text-gray-500 dark:text-gray-400">EMA 20</p>
          <p className="font-semibold">{formatNumber(signal.ema20)}</p>
        </div>
        <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900">
          <p className="text-gray-500 dark:text-gray-400">Z-Score</p>
          <p className="font-semibold">{formatNumber(signal.zScore, 3)}</p>
        </div>
        <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900">
          <p className="text-gray-500 dark:text-gray-400">Volatility</p>
          <p className="font-semibold">{formatNumber(signal.volatility, 4)}</p>
        </div>
        <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900">
          <p className="text-gray-500 dark:text-gray-400">Confidence</p>
          <p className="font-semibold">{signal.confidence}%</p>
        </div>
      </div>

      <div className="mb-3">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-gray-600 dark:text-gray-400">Opportunity Score</span>
          <span className="font-semibold">{signal.score}/100</span>
        </div>
        <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
          <div
            className="h-full bg-blue-600 dark:bg-blue-400"
            style={{ width: `${signal.score}%` }}
          />
        </div>
      </div>

      <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc pl-5">
        {signal.rationale.slice(0, 3).map((reason) => (
          <li key={reason}>{reason}</li>
        ))}
      </ul>

      <div className="mt-4 border-t border-slate-200 dark:border-slate-700 pt-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Sentiment</h3>
          <button
            onClick={() => setIsSentimentCollapsed(!isSentimentCollapsed)}
            className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
            aria-expanded={!isSentimentCollapsed}
            aria-label={`${isSentimentCollapsed ? 'Expand' : 'Collapse'} sentiment for ${signal.ticker}`}
          >
            {isSentimentCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
            {isSentimentCollapsed ? 'Show' : 'Hide'}
          </button>
          <div className="inline-flex rounded-md border border-slate-200 dark:border-slate-600 overflow-hidden">
            <button
              onClick={() => setSentimentRange('days')}
              className={`px-2 py-0.5 text-[11px] ${sentimentRange === 'days' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
            >
              DAYS
            </button>
            <button
              onClick={() => setSentimentRange('months')}
              className={`px-2 py-0.5 text-[11px] border-l border-slate-200 dark:border-slate-600 ${sentimentRange === 'months' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
            >
              MONTHS
            </button>
            <button
              onClick={() => setSentimentRange('years')}
              className={`px-2 py-0.5 text-[11px] border-l border-slate-200 dark:border-slate-600 ${sentimentRange === 'years' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
            >
              YEARS
            </button>
          </div>
        </div>

        {!isSentimentCollapsed && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Confidence History</p>
                <MiniSparkline
                  points={confidencePoints}
                  lineClass="text-violet-600 dark:text-violet-400"
                  pageLoadTimestamp={pageLoadTimestamp}
                />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Expected Growth ({sentimentRange.toUpperCase()})</p>
                <MiniSparkline
                  points={growthPoints}
                  lineClass="text-emerald-600 dark:text-emerald-400"
                  pageLoadTimestamp={pageLoadTimestamp}
                />
              </div>
            </div>

            {latestSentiment && (
              <div className="rounded-md bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2.5">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                  Reputation: <span className="font-semibold text-slate-700 dark:text-slate-200">{latestSentiment.reputation}</span>
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300">{latestSentiment.sentimentText}</p>
              </div>
            )}
          </>
        )}
      </div>
    </article>
  );
}
