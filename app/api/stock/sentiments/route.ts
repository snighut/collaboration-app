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

function buildPredictions(baseBias: number, type: 'days' | 'months' | 'years'): PredictionPoint[] {
  const horizons =
    type === 'days'
      ? [5, 10, 20, 30]
      : type === 'months'
        ? [1, 3, 6, 12]
        : [1, 3, 5];

  return horizons.map((horizon, index) => {
    const drift = baseBias + (Math.random() - 0.5) * (type === 'days' ? 3 : type === 'months' ? 6 : 9);
    const scaled = type === 'days' ? drift : type === 'months' ? drift * 1.8 : drift * 2.4;
    const value = Number((scaled + index * 0.4).toFixed(1));
    const expected = `${value >= 0 ? '+' : ''}${value}%`;
    return { [String(horizon)]: { expected } };
  });
}

function randomReputation(confidence: number): Reputation {
  if (confidence >= 7) return 'HIGH';
  if (confidence >= 4) return 'MEDIUM';
  return 'LOW';
}

function buildSentimentText(ticker: string, confidence: number): string {
  if (confidence >= 7.5) {
    return `Analysts and community sentiment for ${ticker} are broadly positive with strong buying interest.`;
  }
  if (confidence >= 4.5) {
    return `Sentiment on ${ticker} is mixed; investors are waiting for clearer guidance before increasing exposure.`;
  }
  return `People are worried about leadership and execution risk in ${ticker}, leading to weaker near-term sentiment.`;
}

function buildSeriesForTicker(ticker: string): SentimentEntry[] {
  const now = Date.now();
  const points = 730;
  const spacingMs = 24 * 60 * 60 * 1000;
  let confidence = 5 + (Math.random() - 0.5) * 2;

  const result: SentimentEntry[] = [];
  for (let index = points - 1; index >= 0; index -= 1) {
    confidence = Math.max(1, Math.min(10, confidence + (Math.random() - 0.5) * 0.35));
    const baseBias = (confidence - 5) * 0.9;

    result.push({
      timestamp: now - index * spacingMs,
      confidence: Number(confidence.toFixed(1)),
      reputation: randomReputation(confidence),
      sentimentText: buildSentimentText(ticker, confidence),
      futurePredictions: {
        days: buildPredictions(baseBias, 'days'),
        months: buildPredictions(baseBias, 'months'),
        years: buildPredictions(baseBias, 'years'),
      },
    });
  }

  return result;
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
  const data: Record<string, SentimentEntry[]> = {};

  for (const symbol of uniqueSymbols) {
    data[symbol] = buildSeriesForTicker(symbol);
  }

  return NextResponse.json({
    timestamp: Date.now(),
    data,
  });
}
