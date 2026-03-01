import { NextRequest, NextResponse } from 'next/server';

interface YahooChartResponse {
  chart?: {
    result?: Array<{
      timestamp?: number[];
      indicators?: {
        quote?: Array<{
          close?: Array<number | null>;
        }>;
      };
      meta?: {
        regularMarketPrice?: number;
        marketState?: string;
        exchangeTimezoneName?: string;
      };
    }>;
    error?: { description?: string } | null;
  };
}

interface ApiPricePoint {
  timestamp: number;
  price: number;
}

interface SymbolFetchResult {
  points: ApiPricePoint[];
  marketState: string;
  timezone: string;
  latestTimestamp: number | null;
}

// In-flight request cache to deduplicate simultaneous requests for the same symbol
const inflightRequests = new Map<string, Promise<SymbolFetchResult>>();

async function fetchYahooSeriesInternal(symbol: string, range: string = '1d'): Promise<SymbolFetchResult> {
  const endpoint = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1m&range=${range}`;
  const response = await fetch(endpoint, {
    cache: 'no-store',
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Yahoo fetch failed for ${symbol}`);
  }

  const payload = (await response.json()) as YahooChartResponse;
  const result = payload?.chart?.result?.[0];
  if (!result) {
    throw new Error(`No chart data for ${symbol}`);
  }

  const marketState = result.meta?.marketState ?? 'UNKNOWN';
  const timezone = result.meta?.exchangeTimezoneName ?? 'America/New_York';

  const timestamps = result.timestamp ?? [];
  const closes = result.indicators?.quote?.[0]?.close ?? [];
  const points: ApiPricePoint[] = [];

  for (let index = 0; index < timestamps.length; index += 1) {
    const close = closes[index];
    if (typeof close === 'number' && Number.isFinite(close)) {
      points.push({
        timestamp: timestamps[index] * 1000,
        price: Number(close.toFixed(2)),
      });
    }
  }

  if (points.length > 0) {
    return {
      points,
      marketState,
      timezone,
      latestTimestamp: points[points.length - 1].timestamp,
    };
  }

  if (typeof result.meta?.regularMarketPrice === 'number') {
    const now = Date.now();
    return {
      points: [{ timestamp: now, price: Number(result.meta.regularMarketPrice.toFixed(2)) }],
      marketState,
      timezone,
      latestTimestamp: now,
    };
  }

  throw new Error(`No valid close prices for ${symbol}`);
}

async function fetchYahooSeries(symbol: string, range: string = '1d'): Promise<SymbolFetchResult> {
  // Check if there's already an in-flight request for this symbol+range
  const cacheKey = `${symbol}:${range}`;
  const existing = inflightRequests.get(cacheKey);
  if (existing) {
    return existing;
  }

  // Create a new request and store it in the cache
  const promise = fetchYahooSeriesInternal(symbol, range).finally(() => {
    // Clean up the cache after the request completes (success or failure)
    inflightRequests.delete(cacheKey);
  });

  inflightRequests.set(cacheKey, promise);
  return promise;
}

async function fetchLatestPricesBatch(symbols: string[]): Promise<Record<string, SymbolFetchResult>> {
  // For latest mode, use a short 5-minute range instead of full day to minimize bandwidth
  // The key optimization is request deduplication (via inflightRequests cache)
  // If 100 users request the same symbols, they all share the same API calls
  const results = await Promise.all(
    symbols.map(async (symbol) => {
      try {
        const result = await fetchYahooSeries(symbol, '5m');
        // For "latest" mode, return only the most recent price point
        const latestPoint = result.points[result.points.length - 1];
        return {
          symbol,
          data: {
            points: latestPoint ? [latestPoint] : [],
            marketState: result.marketState,
            timezone: result.timezone,
            latestTimestamp: result.latestTimestamp,
          },
        };
      } catch {
        return { symbol, data: null };
      }
    })
  );

  const resultMap: Record<string, SymbolFetchResult> = {};
  for (const { symbol, data } of results) {
    if (data) {
      resultMap[symbol] = data;
    }
  }
  
  return resultMap;
}

export async function GET(request: NextRequest) {
  const symbolsParam = request.nextUrl.searchParams.get('symbols') ?? '';
  const mode = request.nextUrl.searchParams.get('mode') ?? 'historical'; // 'historical' or 'latest'
  
  const symbols = symbolsParam
    .split(',')
    .map((symbol) => symbol.trim().toUpperCase())
    .filter((symbol) => /^[A-Z]{1,6}$/.test(symbol));

  if (symbols.length === 0) {
    return NextResponse.json({ error: 'No valid symbols provided' }, { status: 400 });
  }

  const uniqueSymbols = [...new Set(symbols)].slice(0, 20);
  const resultData: Record<string, ApiPricePoint[]> = {};
  const metadata: Record<string, { marketState: string; timezone: string; latestTimestamp: number | null }> = {};
  const failedSymbols: string[] = [];

  if (mode === 'latest') {
    // Batched mode: Add a 1-second delay to batch concurrent requests from multiple users
    // Frontend is synchronized to poll at :00 and :30 seconds, so requests arrive in bursts
    // We wait 1 second to ensure all requests in the burst are batched together for deduplication
    const now = Date.now();
    const currentSecond = Math.floor(now / 1000) % 60;
    
    // If we're at :00 or :30 (the sync points), wait 1 second to batch all incoming requests
    if (currentSecond === 0 || currentSecond === 30) {
      const msIntoSecond = now % 1000;
      const delayMs = 1000 - msIntoSecond;
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
    
    try {
      const batchResults = await fetchLatestPricesBatch(uniqueSymbols);
      
      for (const symbol of uniqueSymbols) {
        if (batchResults[symbol]) {
          const result = batchResults[symbol];
          resultData[symbol] = result.points;
          metadata[symbol] = {
            marketState: result.marketState,
            timezone: result.timezone,
            latestTimestamp: result.latestTimestamp,
          };
        } else {
          failedSymbols.push(symbol);
        }
      }
    } catch {
      return NextResponse.json(
        { error: 'Failed to fetch latest prices', failedSymbols: uniqueSymbols },
        { status: 502 }
      );
    }
  } else {
    // Historical mode: Fetch each symbol individually (with deduplication)
    await Promise.all(
      uniqueSymbols.map(async (symbol) => {
        try {
          const result = await fetchYahooSeries(symbol, '1d');
          resultData[symbol] = result.points;
          metadata[symbol] = {
            marketState: result.marketState,
            timezone: result.timezone,
            latestTimestamp: result.latestTimestamp,
          };
        } catch {
          failedSymbols.push(symbol);
        }
      })
    );
  }

  if (Object.keys(resultData).length === 0) {
    return NextResponse.json(
      { error: 'Failed to fetch prices for all symbols', failedSymbols },
      { status: 502 }
    );
  }

  return NextResponse.json({
    source: 'yahoo',
    mode,
    data: resultData,
    metadata,
    failedSymbols,
    timestamp: Date.now(),
  });
}
