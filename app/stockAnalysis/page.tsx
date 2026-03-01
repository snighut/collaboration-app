'use client'

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Play, Pause, Activity } from 'lucide-react';
import { PricePoint, classifyStock, StockSignalResult } from '@/lib/stockAnalysis';
import QuantDashboard from '@/components/QuantDashboard';
import TickerSection from '@/components/TickerSection';

const MAX_POINTS = 240;
const SIMULATION_INTERVAL_MS = 1000;
const OPEN_POLL_INTERVAL_MS = 30000;
const EXTENDED_HOURS_POLL_INTERVAL_MS = 60000;
const CLOSED_POLL_INTERVAL_MS = 300000;
const CLOSED_STALE_POLL_INTERVAL_MS = 900000;
const SENTIMENT_POLL_INTERVAL_MS = 120000;
const DEFAULT_TICKERS = ['CLX', 'TGT', 'FISV', 'ADBE', 'CRNC', 'BRCB'];

const BASE_PRICES: Record<string, number> = {
  'CLX': 190,
  'TGT': 160,
  'FISV': 120,
  'ADBE': 450,
  'CRNC': 25,
  'BRCB': 30
};

type SentimentRange = 'days' | 'months' | 'years';

interface SentimentEntry {
  timestamp: number;
  confidence: number;
  reputation: 'HIGH' | 'MEDIUM' | 'LOW' | string;
  sentimentText: string;
  futurePredictions: {
    days: any[];
    months: any[];
    years: any[];
  };
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

export default function StockAnalysisPage() {
  const router = useRouter();

  const [tickers, setTickers] = useState<string[]>(DEFAULT_TICKERS);
  const [isStreaming, setIsStreaming] = useState(true);
  const [dataMode, setDataMode] = useState<'live' | 'simulated'>('live');
  const [feedStatus, setFeedStatus] = useState('Connecting to live market feed...');
  const [marketStatusLabel, setMarketStatusLabel] = useState('Market status unknown');
  const [marketStateByTicker, setMarketStateByTicker] = useState<Record<string, string>>({});
  const [sentimentByTicker, setSentimentByTicker] = useState<Record<string, SentimentEntry[]>>({});
  const [sentimentFeedStatus, setSentimentFeedStatus] = useState('Loading sentiment feed...');
  const [lastUpdateAt, setLastUpdateAt] = useState<number | null>(null);
  const [pollIntervalMs, setPollIntervalMs] = useState(OPEN_POLL_INTERVAL_MS);
  const [sortBy, setSortBy] = useState<'price' | 'percentage' | 'confidence' | 'score'>('score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [priceSeriesByTicker, setPriceSeriesByTicker] = useState<Record<string, PricePoint[]>>({});
  const pageLoadTimestampRef = useRef(Date.now());
  const lastSeenTimestampRef = useRef<number | null>(null);
  const stalePollCountRef = useRef(0);
  const hydratedLiveTickersRef = useRef<Set<string>>(new Set());

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

      // Determine which tickers need historical data vs just latest price
      const needHistorical = tickers.filter(ticker => !hydratedLiveTickersRef.current.has(ticker));
      const needLatest = tickers.filter(ticker => hydratedLiveTickersRef.current.has(ticker));

      try {
        let incomingData: Record<string, PricePoint[]> = {};
        let metadata: Record<string, { marketState?: string; latestTimestamp?: number | null }> = {};
        let failedSymbols: string[] = [];

        // Fetch historical data for new tickers (initial load)
        if (needHistorical.length > 0) {
          const historicalSymbols = needHistorical.join(',');
          const historicalResponse = await fetch(
            `/api/stock/prices?symbols=${encodeURIComponent(historicalSymbols)}&mode=historical`,
            { cache: 'no-store' }
          );

          if (historicalResponse.ok) {
            const payload = await historicalResponse.json();
            incomingData = { ...incomingData, ...(payload?.data ?? {}) };
            metadata = { ...metadata, ...(payload?.metadata ?? {}) };
            failedSymbols = [...failedSymbols, ...(payload?.failedSymbols ?? [])];
          }
        }

        // Fetch latest prices for already-hydrated tickers (batch update)
        if (needLatest.length > 0) {
          const latestSymbols = needLatest.join(',');
          const latestResponse = await fetch(
            `/api/stock/prices?symbols=${encodeURIComponent(latestSymbols)}&mode=latest`,
            { cache: 'no-store' }
          );

          if (latestResponse.ok) {
            const payload = await latestResponse.json();
            incomingData = { ...incomingData, ...(payload?.data ?? {}) };
            metadata = { ...metadata, ...(payload?.metadata ?? {}) };
            failedSymbols = [...failedSymbols, ...(payload?.failedSymbols ?? [])];
          }
        }

        if (Object.keys(incomingData).length === 0) {
          throw new Error('No live price data returned');
        }
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

    // Synchronized polling: All users poll at :00 and :30 seconds of each minute
    // This maximizes request deduplication on the server
    let timeoutId: NodeJS.Timeout;
    
    const scheduleNextPoll = () => {
      const now = Date.now();
      const currentSecond = Math.floor(now / 1000) % 60;
      const msIntoSecond = now % 1000;
      
      let msUntilNextSync;
      if (currentSecond < 30) {
        // We're before :30, wait until :30
        msUntilNextSync = (30 - currentSecond) * 1000 - msIntoSecond;
      } else {
        // We're after :30, wait until next minute's :00
        msUntilNextSync = (60 - currentSecond) * 1000 - msIntoSecond;
      }
      
      timeoutId = setTimeout(() => {
        fetchLivePrices();
        scheduleNextPoll();
      }, msUntilNextSync);
    };
    
    scheduleNextPoll();

    return () => clearTimeout(timeoutId);
  }, [isStreaming, tickers]);

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

  const handleAddTicker = (ticker: string) => {
    setTickers((previous) => [ticker, ...previous]);
  };

  const handleRemoveTicker = (tickerToDelete: string) => {
    setTickers((previous) => previous.filter((ticker) => ticker !== tickerToDelete));
  };

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
        <QuantDashboard
          sortBy={sortBy}
          onSortByChange={setSortBy}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
          feedStatus={feedStatus}
          dataMode={dataMode}
          marketStatusLabel={marketStatusLabel}
          lastUpdateLabel={lastUpdateLabel}
          pollIntervalMs={pollIntervalMs}
          sentimentFeedStatus={sentimentFeedStatus}
          tickers={tickers}
          onAddTicker={handleAddTicker}
          onRemoveTicker={handleRemoveTicker}
        />

        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...stockSignals].sort((a, b) => {
            let comparison = 0;
            if (sortBy === 'price') {
              comparison = b.latestPrice - a.latestPrice;
            } else if (sortBy === 'percentage') {
              const seriesA = priceSeriesByTicker[a.ticker] ?? [];
              const seriesB = priceSeriesByTicker[b.ticker] ?? [];
              const percentA = seriesA[0]?.price ? ((a.latestPrice - seriesA[0].price) / seriesA[0].price) * 100 : 0;
              const percentB = seriesB[0]?.price ? ((b.latestPrice - seriesB[0].price) / seriesB[0].price) * 100 : 0;
              comparison = percentB - percentA;
            } else if (sortBy === 'confidence') {
              comparison = b.confidence - a.confidence;
            } else {
              comparison = b.score - a.score;
            }
            return sortOrder === 'asc' ? -comparison : comparison;
          }).map((signal) => {
            const series = priceSeriesByTicker[signal.ticker] ?? [];
            const tickerMarketState = (marketStateByTicker[signal.ticker] ?? 'UNKNOWN').toUpperCase();
            const sentimentSeries = sentimentByTicker[signal.ticker] ?? [];

            return (
              <TickerSection
                key={signal.ticker}
                signal={signal}
                series={series}
                marketState={tickerMarketState}
                sentimentSeries={sentimentSeries}
                pageLoadTimestamp={pageLoadTimestampRef.current}
              />
            );
          })}
        </section>

        <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200 text-center">
            ⚠️ <strong>Experimental Analysis:</strong> This chart and analysis are for experimental purposes only. 
            Do not follow this information blindly. Always conduct your own research and consult with financial professionals before making investment decisions.
          </p>
        </div>
      </main>
    </div>
  );
}
