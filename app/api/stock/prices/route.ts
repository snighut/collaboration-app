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

async function fetchYahooSeries(symbol: string): Promise<SymbolFetchResult> {
  const endpoint = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1m&range=1d`;
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

export async function GET(request: NextRequest) {
  const symbolsParam = request.nextUrl.searchParams.get('symbols') ?? '';
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

  await Promise.all(
    uniqueSymbols.map(async (symbol) => {
      try {
        const result = await fetchYahooSeries(symbol);
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

  if (Object.keys(resultData).length === 0) {
    return NextResponse.json(
      { error: 'Failed to fetch prices for all symbols', failedSymbols },
      { status: 502 }
    );
  }

  return NextResponse.json({
    source: 'yahoo',
    data: resultData,
    metadata,
    failedSymbols,
    timestamp: Date.now(),
  });
}
