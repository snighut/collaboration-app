'use client'

import { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

interface QuantDashboardProps {
  sortBy: 'price' | 'percentage' | 'confidence' | 'score';
  onSortByChange: (sortBy: 'price' | 'percentage' | 'confidence' | 'score') => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (sortOrder: 'asc' | 'desc') => void;
  feedStatus: string;
  dataMode: 'live' | 'simulated';
  marketStatusLabel: string;
  lastUpdateLabel: string;
  pollIntervalMs: number;
  sentimentFeedStatus: string;
  tickers: string[];
  onAddTicker: (ticker: string) => void;
  onRemoveTicker: (ticker: string) => void;
}

export default function QuantDashboard({
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  feedStatus,
  dataMode,
  marketStatusLabel,
  lastUpdateLabel,
  pollIntervalMs,
  sentimentFeedStatus,
  tickers,
  onAddTicker,
  onRemoveTicker,
}: QuantDashboardProps) {
  const [tickerInput, setTickerInput] = useState('');

  const handleAddTicker = () => {
    const normalized = tickerInput.trim().toUpperCase();
    if (!normalized) return;
    if (!/^[A-Z]{1,6}$/.test(normalized)) return;
    if (tickers.includes(normalized)) {
      setTickerInput('');
      return;
    }
    onAddTicker(normalized);
    setTickerInput('');
  };
  return (
    <section className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-4 sm:p-5">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-xl sm:text-2xl font-bold">Quant Signal Dashboard</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value as 'price' | 'percentage' | 'confidence' | 'score')}
            className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm"
          >
            <option value="score">Opportunity Score</option>
            <option value="price">Price</option>
            <option value="percentage">Percentage</option>
            <option value="confidence">Confidence</option>
          </select>
          <button
            onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-1.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800"
            title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
          >
            {sortOrder === 'desc' ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
        </div>
      </div>
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
              onClick={() => onRemoveTicker(ticker)}
              className="text-slate-500 hover:text-red-500 dark:text-slate-300 dark:hover:text-red-400"
              aria-label={`Remove ${ticker}`}
            >
              <Trash2 size={14} />
            </button>
          </span>
        ))}
      </div>
    </section>
  );
}
