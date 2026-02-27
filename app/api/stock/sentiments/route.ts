import { NextRequest, NextResponse } from 'next/server';

type Reputation = 'HIGH' | 'MEDIUM' | 'LOW';

interface PredictionPoint {
  [horizon: string]: {
    expected: string;
  };
}

interface SentimentEntry {
  timestamp: number;
  confidence: number;
  reputation: Reputation;
  sentimentText: string;
  futurePredictions: {
    days: PredictionPoint[];
    months: PredictionPoint[];
    years: PredictionPoint[];
  };
}

function buildFallbackSentimentEntry(): SentimentEntry {
  return {
    timestamp: Date.now(),
    confidence: 0,
    reputation: 'LOW',
    sentimentText: 'Sentiment data not available',
    futurePredictions: {
      days: [
        { '5': { expected: '0%' } },
        { '10': { expected: '0%' } },
        { '20': { expected: '0%' } },
        { '30': { expected: '0%' } },
      ],
      months: [
        { '1': { expected: '0%' } },
        { '3': { expected: '0%' } },
        { '6': { expected: '0%' } },
        { '12': { expected: '0%' } },
      ],
      years: [
        { '1': { expected: '0%' } },
        { '3': { expected: '0%' } },
        { '5': { expected: '0%' } },
      ],
    },
  };
}

function buildFallbackPayload(symbols: string[]) {
  const data: Record<string, SentimentEntry[]> = {};
  for (const symbol of symbols) {
    data[symbol] = [buildFallbackSentimentEntry()];
  }
  return {
    data,
    message: 'Sentiment data not available',
  };
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
  const fallbackPayload = buildFallbackPayload(uniqueSymbols);

  const quantServiceBaseUrl = process.env.QUANT_SERVICE_URL;
  if (quantServiceBaseUrl) {
    try {
      const proxyUrl = `${quantServiceBaseUrl.replace(/\/$/, '')}/api/v1/quant/sentiments?symbols=${encodeURIComponent(uniqueSymbols.join(','))}`;
      const response = await fetch(proxyUrl, {
        cache: 'no-store',
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        return NextResponse.json(fallbackPayload);
      }

      const payload = await response.json();
      if (payload?.data && typeof payload.data === 'object') {
        return NextResponse.json(payload);
      }
    } catch {
      return NextResponse.json(fallbackPayload);
    }
  }

  return NextResponse.json(fallbackPayload);
}
