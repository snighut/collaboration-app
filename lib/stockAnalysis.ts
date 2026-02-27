export interface PricePoint {
  timestamp: number;
  price: number;
}

export interface StockSignalResult {
  ticker: string;
  latestPrice: number;
  sma20: number | null;
  sma50: number | null;
  ema20: number | null;
  volatility: number | null;
  zScore: number | null;
  trend: 'uptrend' | 'downtrend' | 'sideways';
  valuation: 'Undervalued' | 'Neutral' | 'Overvalued';
  score: number;
  confidence: number;
  rationale: string[];
}

export function calculateSMA(prices: number[], period: number): number | null {
  if (prices.length < period) return null;
  const window = prices.slice(-period);
  const total = window.reduce((sum, value) => sum + value, 0);
  return total / period;
}

export function calculateEMA(prices: number[], period: number): number | null {
  if (prices.length < period) return null;
  const smoothing = 2 / (period + 1);
  let ema = prices.slice(0, period).reduce((sum, value) => sum + value, 0) / period;
  for (let index = period; index < prices.length; index += 1) {
    ema = prices[index] * smoothing + ema * (1 - smoothing);
  }
  return ema;
}

function calculateStandardDeviation(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance = values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / values.length;
  return Math.sqrt(variance);
}

export function calculateVolatility(prices: number[], period = 20): number | null {
  if (prices.length < period + 1) return null;
  const window = prices.slice(-(period + 1));
  const returns: number[] = [];
  for (let index = 1; index < window.length; index += 1) {
    const current = window[index];
    const previous = window[index - 1];
    returns.push((current - previous) / previous);
  }
  return calculateStandardDeviation(returns);
}

export function calculateZScore(prices: number[], period = 20): number | null {
  if (prices.length < period) return null;
  const window = prices.slice(-period);
  const mean = window.reduce((sum, value) => sum + value, 0) / window.length;
  const standardDeviation = calculateStandardDeviation(window);
  if (standardDeviation === 0) return 0;
  const latest = window[window.length - 1];
  return (latest - mean) / standardDeviation;
}

export function classifyStock(ticker: string, series: PricePoint[]): StockSignalResult {
  const prices = series.map((point) => point.price);
  const latestPrice = prices[prices.length - 1] ?? 0;
  const sma20 = calculateSMA(prices, 20);
  const sma50 = calculateSMA(prices, 50);
  const ema20 = calculateEMA(prices, 20);
  const volatility = calculateVolatility(prices, 20);
  const zScore = calculateZScore(prices, 20);
  const rationale: string[] = [];

  let trend: 'uptrend' | 'downtrend' | 'sideways' = 'sideways';
  if (sma20 !== null && sma50 !== null) {
    if (sma20 > sma50 * 1.002) trend = 'uptrend';
    else if (sma20 < sma50 * 0.998) trend = 'downtrend';
  }

  let valuation: 'Undervalued' | 'Neutral' | 'Overvalued' = 'Neutral';
  if (zScore !== null) {
    if (zScore <= -1 && trend !== 'downtrend') valuation = 'Undervalued';
    else if (zScore >= 1 && trend !== 'uptrend') valuation = 'Overvalued';
  }

  if (zScore !== null) {
    if (zScore <= -1) rationale.push('Price is below recent average (mean-reversion candidate).');
    if (zScore >= 1) rationale.push('Price is above recent average (stretched to upside).');
  }

  if (trend === 'uptrend') rationale.push('Short moving average is above long moving average.');
  if (trend === 'downtrend') rationale.push('Short moving average is below long moving average.');
  if (trend === 'sideways') rationale.push('Moving averages indicate range-bound market.');

  if (volatility !== null) {
    if (volatility > 0.02) rationale.push('Volatility is elevated; reduce confidence in directional calls.');
    else rationale.push('Volatility is moderate; signal quality is more stable.');
  }

  const scoreFromZ = zScore === null ? 50 : Math.max(0, Math.min(100, Math.round(50 - zScore * 18)));
  const trendAdjustment = trend === 'uptrend' ? 8 : trend === 'downtrend' ? -8 : 0;
  const score = Math.max(0, Math.min(100, scoreFromZ + trendAdjustment));

  const confidenceBase = zScore === null || volatility === null ? 35 : 65;
  const volatilityPenalty = volatility ? Math.min(25, Math.round(volatility * 1000)) : 0;
  const confidence = Math.max(10, Math.min(95, confidenceBase - volatilityPenalty));

  if (rationale.length === 0) rationale.push('Not enough data yet for a strong signal.');

  return {
    ticker,
    latestPrice,
    sma20,
    sma50,
    ema20,
    volatility,
    zScore,
    trend,
    valuation,
    score,
    confidence,
    rationale,
  };
}
