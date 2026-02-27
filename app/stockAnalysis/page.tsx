'use client'

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Play, Pause, Plus, Trash2, Activity } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { PricePoint, classifyStock, StockSignalResult } from '@/lib/stockAnalysis';

const MAX_POINTS = 240;
const SIMULATION_INTERVAL_MS = 1000;
const OPEN_POLL_INTERVAL_MS = 30000;
const EXTENDED_HOURS_POLL_INTERVAL_MS = 60000;
const CLOSED_POLL_INTERVAL_MS = 300000;
const CLOSED_STALE_POLL_INTERVAL_MS = 900000;
const SENTIMENT_POLL_INTERVAL_MS = 120000;
const DEFAULT_TICKERS = ['AAPL', 'MSFT', 'NVDA'];

const BASE_PRICES: Record<string, number> = {
  AAPL: 190,
  MSFT: 420,
  NVDA: 910,
  TSLA: 210,
  AMZN: 175,
  META: 470,
  GOOGL: 165,
};

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
}

function makeInitialSeries(basePrice: number): PricePoint[] {
  const now = Date.now();
  let currentPrice = basePrice;
  const seedSeries: PricePoint[] = [];

  for (let index = 60; index >= 0; index -= 1) {
    const drift = (Math.random() - 0.48) * 0.005;
    currentPrice = Math.max(1, currentPrice * (1 + drift));
    seedSeries.push({
      timestamp: now - index * SIMULATION_INTERVAL_MS,
      price: Number(currentPrice.toFixed(2)),
    });
  }

  return seedSeries;
}

function formatNumber(value: number | null, decimals = 2): string {
  if (value === null || Number.isNaN(value)) return '-';
  return value.toFixed(decimals);
}

function mergeSeries(existing: PricePoint[], incoming: PricePoint[]): PricePoint[] {
  if (incoming.length === 0) return existing;
  const mergedByTimestamp = new Map<number, number>();

  for (const point of existing) {
    mergedByTimestamp.set(point.timestamp, point.price);
  }
  for (const point of incoming) {
    mergedByTimestamp.set(point.timestamp, point.price);
  }

  return [...mergedByTimestamp.entries()]
    .sort((left, right) => left[0] - right[0])
    .slice(-MAX_POINTS)
    .map(([timestamp, price]) => ({ timestamp, price }));
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
    });
  }

  return buckets;
}

function MiniSparkline({
  points,
  lineClass,
}: {
  points: MiniSparkPoint[];
  lineClass: string;
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
        {hoveredPoint && x !== null && y !== null && (
          <>
            <line x1={x} y1={4} x2={x} y2={56} stroke="currentColor" className="text-slate-400 dark:text-slate-500" strokeDasharray="2 2" />
            <circle cx={x} cy={y} r={2.4} fill="currentColor" className={lineClass} />
          </>
        )}
      </svg>
      {hoveredPoint && x !== null && (
        <div
          className="absolute -top-8 z-10 px-2 py-1 rounded-md text-[11px] bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 whitespace-nowrap pointer-events-none"
          style={{ left: `${(x / 300) * 100}%`, transform: 'translateX(-50%)' }}
        >
          {hoveredPoint.tooltip}
        </div>
      )}
    </div>
  );
}

function SparklineChart({ points }: { points: PricePoint[] }) {
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
        {hoveredPoint && x !== null && y !== null && (
          <>
            <line x1={x} y1={4} x2={x} y2={56} stroke="currentColor" className="text-slate-400 dark:text-slate-500" strokeDasharray="2 2" />
            <circle cx={x} cy={y} r={2.8} fill="currentColor" className="text-blue-600 dark:text-blue-400" />
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
          ${formatNumber(hoveredPoint.price)} • {new Date(hoveredPoint.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      )}
    </div>
  );
}

export default function StockAnalysisPage() {
  const router = useRouter();
  const { session, loading } = useAuth();

  const [tickers, setTickers] = useState<string[]>(DEFAULT_TICKERS);
  const [tickerInput, setTickerInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(true);
  const [dataMode, setDataMode] = useState<'live' | 'simulated'>('live');
  const [feedStatus, setFeedStatus] = useState('Connecting to live market feed...');
  const [marketStatusLabel, setMarketStatusLabel] = useState('Market status unknown');
  const [marketStateByTicker, setMarketStateByTicker] = useState<Record<string, string>>({});
  const [chartViewByTicker, setChartViewByTicker] = useState<Record<string, 'auto' | 'recent' | 'full'>>({});
  const [sentimentByTicker, setSentimentByTicker] = useState<Record<string, SentimentEntry[]>>({});
  const [sentimentRangeByTicker, setSentimentRangeByTicker] = useState<Record<string, SentimentRange>>({});
  const [sentimentFeedStatus, setSentimentFeedStatus] = useState('Loading sentiment feed...');
  const [lastUpdateAt, setLastUpdateAt] = useState<number | null>(null);
  const [pollIntervalMs, setPollIntervalMs] = useState(OPEN_POLL_INTERVAL_MS);
  const [priceSeriesByTicker, setPriceSeriesByTicker] = useState<Record<string, PricePoint[]>>({});
  const lastSeenTimestampRef = useRef<number | null>(null);
  const stalePollCountRef = useRef(0);
  const hydratedLiveTickersRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!loading && !session) {
      router.replace('/login?redirect=/stockAnalysis');
    }
  }, [loading, session, router]);

  useEffect(() => {
    setPriceSeriesByTicker((previous) => {
      const nextState = { ...previous };
      for (const ticker of tickers) {
        if (!nextState[ticker]) {
          nextState[ticker] = [];
        }
      }
      for (const existingTicker of Object.keys(nextState)) {
        if (!tickers.includes(existingTicker)) {
          delete nextState[existingTicker];
          hydratedLiveTickersRef.current.delete(existingTicker);
        }
      }
      return nextState;
    });

    setMarketStateByTicker((previous) => {
      const nextState = { ...previous };
      for (const existingTicker of Object.keys(nextState)) {
        if (!tickers.includes(existingTicker)) {
          delete nextState[existingTicker];
        }
      }
      return nextState;
    });

    setChartViewByTicker((previous) => {
      const nextState = { ...previous };
      for (const ticker of tickers) {
        if (!nextState[ticker]) {
          nextState[ticker] = 'auto';
        }
      }
      for (const existingTicker of Object.keys(nextState)) {
        if (!tickers.includes(existingTicker)) {
          delete nextState[existingTicker];
        }
      }
      return nextState;
    });

    setSentimentRangeByTicker((previous) => {
      const nextState = { ...previous };
      for (const ticker of tickers) {
        if (!nextState[ticker]) {
          nextState[ticker] = 'days';
        }
      }
      for (const existingTicker of Object.keys(nextState)) {
        if (!tickers.includes(existingTicker)) {
          delete nextState[existingTicker];
        }
      }
      return nextState;
    });

    setSentimentByTicker((previous) => {
      const nextState = { ...previous };
      for (const existingTicker of Object.keys(nextState)) {
        if (!tickers.includes(existingTicker)) {
          delete nextState[existingTicker];
        }
      }
      return nextState;
    });
  }, [tickers]);

  useEffect(() => {
    if (!isStreaming || tickers.length === 0) return;

    const fetchSentiments = async () => {
      try {
        const symbols = tickers.join(',');
        const response = await fetch(`/api/stock/sentiments?symbols=${encodeURIComponent(symbols)}`, {
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error('Sentiment request failed');
        }

        const payload = await response.json();
        const data = (payload?.data ?? {}) as Record<string, SentimentEntry[]>;
        setSentimentByTicker((previous) => {
          const nextState = { ...previous };
          for (const ticker of tickers) {
            nextState[ticker] = Array.isArray(data[ticker]) ? data[ticker] : [];
          }
          return nextState;
        });
        setSentimentFeedStatus('Sentiment feed active.');
      } catch {
        setSentimentFeedStatus('Sentiment feed unavailable.');
      }
    };

    fetchSentiments();
    const intervalId = setInterval(fetchSentiments, SENTIMENT_POLL_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [isStreaming, tickers]);

  useEffect(() => {
    if (!isStreaming) return;

    const fetchLivePrices = async () => {
      if (tickers.length === 0) return;
      const symbols = tickers.join(',');

      try {
        const response = await fetch(`/api/stock/prices?symbols=${encodeURIComponent(symbols)}`, {
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error('Live price request failed');
        }

        const payload = await response.json();
        const incomingData = payload?.data as Record<string, PricePoint[]> | undefined;
        if (!incomingData || Object.keys(incomingData).length === 0) {
          throw new Error('No live price data returned');
        }

        const metadata = (payload?.metadata ?? {}) as Record<string, {
          marketState?: string;
          latestTimestamp?: number | null;
        }>;

        setMarketStateByTicker((previous) => {
          const nextState = { ...previous };
          for (const ticker of tickers) {
            const state = (metadata[ticker]?.marketState ?? 'UNKNOWN').toUpperCase();
            nextState[ticker] = state;
          }
          return nextState;
        });

        const activeMetadata = tickers
          .map((ticker) => metadata[ticker])
          .filter(Boolean) as Array<{ marketState?: string; latestTimestamp?: number | null }>;

        const states = activeMetadata
          .map((entry) => (entry.marketState ?? 'UNKNOWN').toUpperCase());
        const hasRegular = states.some((state) => state === 'REGULAR');
        const hasExtended = states.some((state) => state === 'PRE' || state === 'POST' || state === 'PREPRE' || state === 'POSTPOST');
        const allClosed = states.length > 0 && states.every((state) => state === 'CLOSED');

        if (hasRegular) {
          setMarketStatusLabel('Market Open');
        } else if (hasExtended) {
          setMarketStatusLabel('Extended Hours');
        } else if (allClosed) {
          setMarketStatusLabel('Market Closed');
        } else {
          setMarketStatusLabel('Market Status Unknown');
        }

        const latestTsFromApi = activeMetadata
          .map((entry) => (typeof entry.latestTimestamp === 'number' ? entry.latestTimestamp : null))
          .filter((value): value is number => value !== null)
          .reduce((max, value) => Math.max(max, value), 0);

        if (latestTsFromApi > 0) {
          if (lastSeenTimestampRef.current === null || latestTsFromApi > lastSeenTimestampRef.current) {
            lastSeenTimestampRef.current = latestTsFromApi;
            stalePollCountRef.current = 0;
            setLastUpdateAt(latestTsFromApi);
          } else {
            stalePollCountRef.current += 1;
          }
        }

        let nextPollInterval = pollIntervalMs;
        if (hasRegular) {
          nextPollInterval = OPEN_POLL_INTERVAL_MS;
        } else if (hasExtended) {
          nextPollInterval = EXTENDED_HOURS_POLL_INTERVAL_MS;
        } else if (allClosed) {
          nextPollInterval = stalePollCountRef.current >= 2
            ? CLOSED_STALE_POLL_INTERVAL_MS
            : CLOSED_POLL_INTERVAL_MS;
        }

        if (nextPollInterval !== pollIntervalMs) {
          setPollIntervalMs(nextPollInterval);
        }

        setPriceSeriesByTicker((previous) => {
          const nextState = { ...previous };
          for (const ticker of tickers) {
            const current = previous[ticker] ?? [];
            const incoming = incomingData[ticker] ?? [];
            if (incoming.length > 0) {
              if (!hydratedLiveTickersRef.current.has(ticker) || current.length === 0) {
                nextState[ticker] = incoming.slice(-MAX_POINTS);
                hydratedLiveTickersRef.current.add(ticker);
              } else {
                nextState[ticker] = mergeSeries(current, incoming);
              }
            } else {
              nextState[ticker] = current;
            }
          }
          return nextState;
        });

        setDataMode('live');
        const failedSymbols = Array.isArray(payload?.failedSymbols) ? payload.failedSymbols : [];
        if (failedSymbols.length > 0) {
          setFeedStatus(`Live feed active (partial): ${failedSymbols.join(', ')} unavailable.`);
        } else {
          setFeedStatus('Live feed active (Yahoo intraday).');
        }
      } catch {
        setDataMode('simulated');
        setMarketStatusLabel('Market Status Unknown');
        if (pollIntervalMs !== CLOSED_POLL_INTERVAL_MS) {
          setPollIntervalMs(CLOSED_POLL_INTERVAL_MS);
        }
        setPriceSeriesByTicker((previous) => {
          const nextState = { ...previous };
          for (const ticker of tickers) {
            if (!nextState[ticker] || nextState[ticker].length === 0) {
              const basePrice = BASE_PRICES[ticker] ?? (80 + Math.random() * 300);
              nextState[ticker] = makeInitialSeries(basePrice);
            }
          }
          return nextState;
        });
        setFeedStatus('Live feed unavailable. Running simulated stream fallback.');
      }
    };

    fetchLivePrices();

    const liveIntervalId = setInterval(() => {
      fetchLivePrices();
    }, pollIntervalMs);

    return () => clearInterval(liveIntervalId);
  }, [isStreaming, tickers, pollIntervalMs]);

  useEffect(() => {
    if (!isStreaming || dataMode !== 'simulated') return;

    const intervalId = setInterval(() => {
      setPriceSeriesByTicker((previous) => {
        const nextState: Record<string, PricePoint[]> = {};

        for (const ticker of Object.keys(previous)) {
          const series = previous[ticker];
          const latestPrice = series[series.length - 1]?.price ?? (BASE_PRICES[ticker] ?? 100);
          const randomShock = (Math.random() - 0.5) * 0.006;
          const meanReversionBias = ((BASE_PRICES[ticker] ?? latestPrice) - latestPrice) / latestPrice * 0.03;
          const nextPrice = Math.max(1, latestPrice * (1 + randomShock + meanReversionBias));
          const updatedSeries = [
            ...series,
            { timestamp: Date.now(), price: Number(nextPrice.toFixed(2)) },
          ].slice(-MAX_POINTS);

          nextState[ticker] = updatedSeries;
        }

        return nextState;
      });
    }, SIMULATION_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [isStreaming, dataMode]);

  const stockSignals = useMemo(() => {
    return tickers
      .map((ticker) => {
        const series = priceSeriesByTicker[ticker] ?? [];
        if (series.length === 0) return null;
        return classifyStock(ticker, series);
      })
      .filter(Boolean) as StockSignalResult[];
  }, [tickers, priceSeriesByTicker]);

  const handleAddTicker = () => {
    const normalized = tickerInput.trim().toUpperCase();
    if (!normalized) return;
    if (!/^[A-Z]{1,6}$/.test(normalized)) return;
    if (tickers.includes(normalized)) {
      setTickerInput('');
      return;
    }
    setTickers((previous) => [normalized, ...previous]);
    setTickerInput('');
  };

  const handleRemoveTicker = (tickerToDelete: string) => {
    setTickers((previous) => previous.filter((ticker) => ticker !== tickerToDelete));
  };

  if (loading || !session) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400">Loading stock analysis...</p>
        </div>
      </div>
    );
  }

  const lastUpdateLabel = lastUpdateAt
    ? new Date(lastUpdateAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : 'N/A';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <header className="h-16 border-b border-gray-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
          >
            <ArrowLeft size={18} />
            <span className="font-medium">Home</span>
          </button>
          <div className="hidden sm:flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <Activity size={18} />
            <span className="font-semibold">Stock Quant Analysis</span>
          </div>
        </div>

        <button
          onClick={() => setIsStreaming((previous) => !previous)}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium"
        >
          {isStreaming ? <Pause size={16} /> : <Play size={16} />}
          {isStreaming ? 'Pause Stream' : 'Resume Stream'}
        </button>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-6 space-y-6">
        <section className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-4 sm:p-5">
          <h1 className="text-xl sm:text-2xl font-bold mb-2">Quant Signal Dashboard</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Real-time market polling with moving averages and z-score based valuation classification.
          </p>
          <div className="mb-4 flex flex-wrap gap-2">
            <div className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200">
              <span className={`w-2.5 h-2.5 rounded-full ${dataMode === 'live' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span>{feedStatus}</span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200">
              <span className={`w-2.5 h-2.5 rounded-full ${marketStatusLabel === 'Market Open' ? 'bg-emerald-500' : marketStatusLabel === 'Extended Hours' ? 'bg-blue-500' : 'bg-amber-500'}`} />
              <span>{marketStatusLabel} • Last update {lastUpdateLabel}</span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200">
              <span>Poll interval: {Math.round(pollIntervalMs / 1000)}s</span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200">
              <span>{sentimentFeedStatus}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              value={tickerInput}
              onChange={(event) => setTickerInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  handleAddTicker();
                }
              }}
              placeholder="Add ticker (e.g., TSLA)"
              className="w-full sm:w-72 px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900"
            />
            <button
              onClick={handleAddTicker}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
            >
              <Plus size={16} />
              Add Ticker
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {tickers.map((ticker) => (
              <span
                key={ticker}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200"
              >
                {ticker}
                <button
                  onClick={() => handleRemoveTicker(ticker)}
                  className="text-slate-500 hover:text-red-500 dark:text-slate-300 dark:hover:text-red-400"
                  aria-label={`Remove ${ticker}`}
                >
                  <Trash2 size={14} />
                </button>
              </span>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {stockSignals.map((signal) => {
            const series = priceSeriesByTicker[signal.ticker] ?? [];
            const tickerMarketState = (marketStateByTicker[signal.ticker] ?? 'UNKNOWN').toUpperCase();
            const selectedView = chartViewByTicker[signal.ticker] ?? 'auto';
            const shouldUseFull = selectedView === 'full' || (selectedView === 'auto' && tickerMarketState === 'CLOSED');
            const chartPoints = shouldUseFull ? series : series.slice(-30);
            const sentimentSeries = sentimentByTicker[signal.ticker] ?? [];
            const latestSentiment = sentimentSeries[sentimentSeries.length - 1] ?? null;
            const selectedSentimentRange = sentimentRangeByTicker[signal.ticker] ?? 'days';

            const confidencePoints: MiniSparkPoint[] = buildConfidencePoints(sentimentSeries, selectedSentimentRange);

            const selectedPredictionList = latestSentiment
              ? latestSentiment.futurePredictions[selectedSentimentRange] ?? []
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
                    tooltip: `${horizon}${selectedSentimentRange === 'days' ? 'd' : selectedSentimentRange === 'months' ? 'm' : 'y'} • ${expected}`,
                  },
                };
              })
              .sort((left, right) => left.horizon - right.horizon)
              .map((entry) => entry.point);

            const rangeLabel = selectedView === 'recent'
              ? 'Recent 30 points (manual)'
              : selectedView === 'full'
                ? 'Full-day view (manual)'
                : tickerMarketState === 'CLOSED'
                  ? 'Full-day view (market closed)'
                  : 'Recent 30 points';

            return (
              <article
                key={signal.ticker}
                className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-4 sm:p-5"
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <h2 className="text-lg font-bold">{signal.ticker}</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Price ${formatNumber(signal.latestPrice)} • Trend {signal.trend}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400">{rangeLabel}</p>
                      <div className="inline-flex rounded-md border border-slate-200 dark:border-slate-600 overflow-hidden">
                        <button
                          onClick={() => setChartViewByTicker((previous) => ({ ...previous, [signal.ticker]: 'auto' }))}
                          className={`px-2 py-0.5 text-[11px] ${selectedView === 'auto' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
                        >
                          Auto
                        </button>
                        <button
                          onClick={() => setChartViewByTicker((previous) => ({ ...previous, [signal.ticker]: 'recent' }))}
                          className={`px-2 py-0.5 text-[11px] border-l border-slate-200 dark:border-slate-600 ${selectedView === 'recent' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
                        >
                          Recent
                        </button>
                        <button
                          onClick={() => setChartViewByTicker((previous) => ({ ...previous, [signal.ticker]: 'full' }))}
                          className={`px-2 py-0.5 text-[11px] border-l border-slate-200 dark:border-slate-600 ${selectedView === 'full' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
                        >
                          Full
                        </button>
                      </div>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${valuationPill(signal.valuation)}`}>
                    {signal.valuation}
                  </span>
                </div>

                <SparklineChart points={chartPoints} />

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
                    <div className="inline-flex rounded-md border border-slate-200 dark:border-slate-600 overflow-hidden">
                      <button
                        onClick={() => setSentimentRangeByTicker((previous) => ({ ...previous, [signal.ticker]: 'days' }))}
                        className={`px-2 py-0.5 text-[11px] ${selectedSentimentRange === 'days' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
                      >
                        DAYS
                      </button>
                      <button
                        onClick={() => setSentimentRangeByTicker((previous) => ({ ...previous, [signal.ticker]: 'months' }))}
                        className={`px-2 py-0.5 text-[11px] border-l border-slate-200 dark:border-slate-600 ${selectedSentimentRange === 'months' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
                      >
                        MONTHS
                      </button>
                      <button
                        onClick={() => setSentimentRangeByTicker((previous) => ({ ...previous, [signal.ticker]: 'years' }))}
                        className={`px-2 py-0.5 text-[11px] border-l border-slate-200 dark:border-slate-600 ${selectedSentimentRange === 'years' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
                      >
                        YEARS
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Confidence History</p>
                      <MiniSparkline points={confidencePoints} lineClass="text-violet-600 dark:text-violet-400" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Future Expected Growth ({selectedSentimentRange.toUpperCase()})</p>
                      <MiniSparkline points={growthPoints} lineClass="text-emerald-600 dark:text-emerald-400" />
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
                </div>
              </article>
            );
          })}
        </section>
      </main>
    </div>
  );
}
