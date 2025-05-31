"use client";

import React, { useEffect, useState } from 'react';
import { useDashboardData } from '../hooks/useDashboardData';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { calculateBeraInflation, calculateBeraBgtInflation, EmissionDataPoint, SupplyData, InflationStats } from '../../lib/inflation';
import { formatNumber, formatCurrency } from '../utils/format';

const TIMEFRAMES = [
  { label: '7d', days: 7 },
  { label: '30d', days: 30 },
  { label: '90d', days: 90 },
  { label: 'All-time', days: 365 },
];

// Unified mapping from CoinGecko IDs and dashboard keys to ticker and display name
const CHAIN_META: Record<string, { ticker: string; displayName: string }> = {
  BTC: { ticker: 'BTC', displayName: 'Bitcoin' },
  ETH: { ticker: 'ETH', displayName: 'Ethereum' },
  SOL: { ticker: 'SOL', displayName: 'Solana' },
  SUI: { ticker: 'SUI', displayName: 'Sui' },
  AVAX: { ticker: 'AVAX', displayName: 'Avalanche' },
  BNB: { ticker: 'BNB', displayName: 'BNB' },
  SEI: { ticker: 'SEI', displayName: 'Sei' },
  NEAR: { ticker: 'NEAR', displayName: 'Near' },
  APT: { ticker: 'APT', displayName: 'Aptos' },
  BERA: { ticker: 'BERA', displayName: 'BERA' },
  'BERA+BGT': { ticker: 'BERA+BGT', displayName: 'BERA+BGT' },
  // CoinGecko API symbols (fallbacks)
  BITCOIN: { ticker: 'BTC', displayName: 'Bitcoin' },
  ETHEREUM: { ticker: 'ETH', displayName: 'Ethereum' },
  SOLANA: { ticker: 'SOL', displayName: 'Solana' },
  SUI_NETWORK: { ticker: 'SUI', displayName: 'Sui' },
  AVALANCHE_2: { ticker: 'AVAX', displayName: 'Avalanche' },
  BINANCECOIN: { ticker: 'BNB', displayName: 'BNB' },
  SEI_NETWORK: { ticker: 'SEI', displayName: 'Sei' },
  APTOS: { ticker: 'APT', displayName: 'Aptos' },
};

const BERACHAIN_GENESIS_DATE = new Date('2025-01-20T14:00:00Z');

interface SupplyHistoryPoint {
  date: string;
  supply: number;
}

interface Chain {
  symbol: string;
  current?: {
    price: number;
    marketCap: number;
    circulatingSupply: number;
    totalSupply: number;
    maxSupply: number | null;
  };
  supplyHistory: SupplyHistoryPoint[];
  totalSupply?: number;
  inflation?: InflationStats | null;
}

// Helper to calculate inflation for a chain (for non-BERA chains)
function calcInflation(
  chain: Chain | null,
  days: number,
  useGenesis = false,
  useTotalSupply = false
): { value: number | null; actualDays: number | null } {
  if (!chain || !Array.isArray(chain.supplyHistory)) return { value: null, actualDays: null };
  let supplyHistory = chain.supplyHistory;
  if (useGenesis) {
    // Find the first data point on or after genesis
    const startIdx = supplyHistory.findIndex(point => new Date(point.date) >= BERACHAIN_GENESIS_DATE);
    if (startIdx === -1 || startIdx === supplyHistory.length - 1) return { value: null, actualDays: null };
    const start = useTotalSupply ? (chain.current?.totalSupply ?? chain.totalSupply) : supplyHistory[startIdx].supply;
    const end = useTotalSupply ? (chain.current?.totalSupply ?? chain.totalSupply) : supplyHistory[supplyHistory.length - 1].supply;
    const daysBetween = (new Date(supplyHistory[supplyHistory.length - 1].date).getTime() - new Date(supplyHistory[startIdx].date).getTime()) / (1000 * 60 * 60 * 24);
    if (start == null || end == null || daysBetween < 1) return { value: null, actualDays: null };
    return { value: (((end - start) * (365 / daysBetween)) / start) * 100, actualDays: daysBetween };
  } else {
    if (supplyHistory.length < 2) return { value: null, actualDays: null };
    const latest = new Date(supplyHistory[supplyHistory.length - 1].date);
    // Find the earliest point at least 'days' before the latest
    let startIdx = -1;
    for (let i = supplyHistory.length - 2; i >= 0; i--) {
      const d = new Date(supplyHistory[i].date);
      const diff = (latest.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
      if (diff >= days) {
        startIdx = i;
        break;
      }
    }
    if (startIdx === -1) return { value: null, actualDays: null };
    const start = useTotalSupply ? (chain.current?.totalSupply ?? chain.totalSupply) : supplyHistory[startIdx].supply;
    const end = useTotalSupply ? (chain.current?.totalSupply ?? chain.totalSupply) : supplyHistory[supplyHistory.length - 1].supply;
    const actualDays = (latest.getTime() - new Date(supplyHistory[startIdx].date).getTime()) / (1000 * 60 * 60 * 24);
    if (start == null || end == null || actualDays < 1) return { value: null, actualDays: null };
    return { value: (((end - start) * (365 / actualDays)) / start) * 100, actualDays };
  }
}

// Helper for inflation cell with tooltip if negative
function InflationCell({ value, actualDays, requestedDays }: { value: number | null; actualDays: number | null; requestedDays: number }) {
  if (value === null || value === undefined) return 'N/A';
  return (
    <span className={value < 0 ? 'text-red-500' : ''}>
      {value.toFixed(2)}%
    </span>
  );
}

// Helper to check if period is exactly N days
function isExactPeriod(latest: Date, start: Date, days: number) {
  const diff = (latest.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
  return Math.abs(diff - days) < 0.01; // allow tiny floating point error
}

function InflationComparisonContent() {
  const { beraSupply, bgtSupply, beraPrice, duneEmissions, isLoading, error } = useDashboardData();
  const [selectedTimeframe, setSelectedTimeframe] = useState(TIMEFRAMES[3]);
  const [otherChainsData, setOtherChainsData] = useState<Chain[]>([]);
  const [isLoadingOtherChains, setIsLoadingOtherChains] = useState(false);
  const [otherChainsError, setOtherChainsError] = useState<string | null>(null);
  const [staleWarning, setStaleWarning] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'inflation', direction: 'desc' });

  // Frontend cache key
  const CACHE_KEY = 'inflationComparisonOtherChains';
  const CACHE_TIME_KEY = 'inflationComparisonOtherChainsTime';
  const CACHE_MAX_AGE = 60 * 60 * 1000; // 60 minutes

  // On mount, load cached data if available
  useEffect(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    const cachedTime = localStorage.getItem(CACHE_TIME_KEY);
    if (cached && cachedTime && Date.now() - Number(cachedTime) < CACHE_MAX_AGE) {
      try {
        const parsed = JSON.parse(cached);
        setOtherChainsData(parsed.chains || []);
        if (parsed.warning) setStaleWarning(parsed.warning);
      } catch {}
    }
    // Always fetch fresh data in background
    fetchOtherChainsData();
    // eslint-disable-next-line
  }, []);

  async function fetchOtherChainsData() {
    setIsLoadingOtherChains(true);
    setOtherChainsError(null);
    try {
      const res = await fetch('/api/inflation?exclude=bera,bera+bgt');
      const json = await res.json();
      // Save to cache
      localStorage.setItem(CACHE_KEY, JSON.stringify(json));
      localStorage.setItem(CACHE_TIME_KEY, String(Date.now()));
      setOtherChainsData(json.chains || []);
      setStaleWarning(json.warning || null);
    } catch (e) {
      setOtherChainsError('Failed to fetch other chains data');
    } finally {
      setIsLoadingOtherChains(false);
    }
  }

  // Calculate inflation for BERA and BERA+BGT using shared logic
  const beraInflation = calculateBeraInflation(
    duneEmissions as EmissionDataPoint[] ?? [],
    beraSupply as SupplyData,
    selectedTimeframe.label === 'All-time' ? (duneEmissions?.length ?? 0) : selectedTimeframe.days
  );
  const beraBgtInflation = calculateBeraBgtInflation(
    duneEmissions as EmissionDataPoint[] ?? [],
    beraSupply as SupplyData,
    bgtSupply as SupplyData,
    selectedTimeframe.label === 'All-time' ? (duneEmissions?.length ?? 0) : selectedTimeframe.days
  );

  // Only include BERA and BERA+BGT from dashboard data
  const beraChain = {
    symbol: 'BERA',
    inflation: beraInflation,
  };
  const beraBgtChain = {
    symbol: 'BERA+BGT',
    inflation: beraBgtInflation,
  };

  // Filter out any BERA/BERA+BGT from API data (just in case)
  const filteredOtherChains = otherChainsData.filter(
    c => c.symbol !== 'BERA' && c.symbol !== 'BERA+BGT' && c.symbol !== 'BERACHAIN-BERA' && c.symbol !== 'BERACHAIN-BGT'
  );

  // Map CoinGecko API symbols to tickers if needed, normalizing hyphens to underscores
  const normalizedOtherChains = filteredOtherChains.map((chain: Chain) => {
    const normalizedSymbol = chain.symbol.replace(/-/g, '_');
    const meta = CHAIN_META[normalizedSymbol] || { ticker: chain.symbol, displayName: chain.symbol };
    return { ...chain, symbol: meta.ticker };
  });

  // Combine for table
  const allChains = [beraChain, beraBgtChain, ...normalizedOtherChains];

  // Sort the chains based on current sort configuration
  const sortedChains = React.useMemo(() => {
    const sorted = [...allChains].sort((a, b) => {
      let aValue: any = null;
      let bValue: any = null;

      switch (sortConfig.key) {
        case 'chain':
          aValue = CHAIN_META[a.symbol]?.ticker || a.symbol;
          bValue = CHAIN_META[b.symbol]?.ticker || b.symbol;
          break;
        case 'inflation':
          if (a.symbol === 'BERA' || a.symbol === 'BERA+BGT') {
            aValue = a.inflation?.inflationCirculating ?? null;
          } else {
            aValue = selectedTimeframe.label === 'All-time'
              ? calcInflation(a as Chain, 0, true, false).value
              : calcInflation(a as Chain, selectedTimeframe.days, false, false).value;
          }
          if (b.symbol === 'BERA' || b.symbol === 'BERA+BGT') {
            bValue = b.inflation?.inflationCirculating ?? null;
          } else {
            bValue = selectedTimeframe.label === 'All-time'
              ? calcInflation(b as Chain, 0, true, false).value
              : calcInflation(b as Chain, selectedTimeframe.days, false, false).value;
          }
          break;
        case 'absolute':
          if (a.symbol === 'BERA' || a.symbol === 'BERA+BGT') {
            aValue = a.inflation?.absolute ?? null;
          } else {
            const chainA = a as Chain;
            if (selectedTimeframe.label === 'All-time') {
              const startIdx = chainA.supplyHistory.findIndex((point: SupplyHistoryPoint) => new Date(point.date) >= BERACHAIN_GENESIS_DATE);
              if (startIdx !== -1 && startIdx < chainA.supplyHistory.length - 1) {
                aValue = chainA.supplyHistory[chainA.supplyHistory.length - 1].supply - chainA.supplyHistory[startIdx].supply;
              }
            } else {
              const days = selectedTimeframe.days;
              if (chainA.supplyHistory.length > days) {
                aValue = chainA.supplyHistory[chainA.supplyHistory.length - 1].supply - chainA.supplyHistory[chainA.supplyHistory.length - days - 1].supply;
              }
            }
          }
          if (b.symbol === 'BERA' || b.symbol === 'BERA+BGT') {
            bValue = b.inflation?.absolute ?? null;
          } else {
            const chainB = b as Chain;
            if (selectedTimeframe.label === 'All-time') {
              const startIdx = chainB.supplyHistory.findIndex((point: SupplyHistoryPoint) => new Date(point.date) >= BERACHAIN_GENESIS_DATE);
              if (startIdx !== -1 && startIdx < chainB.supplyHistory.length - 1) {
                bValue = chainB.supplyHistory[chainB.supplyHistory.length - 1].supply - chainB.supplyHistory[startIdx].supply;
              }
            } else {
              const days = selectedTimeframe.days;
              if (chainB.supplyHistory.length > days) {
                bValue = chainB.supplyHistory[chainB.supplyHistory.length - 1].supply - chainB.supplyHistory[chainB.supplyHistory.length - days - 1].supply;
              }
            }
          }
          break;
        case 'absoluteUsd':
          if (a.symbol === 'BERA' || a.symbol === 'BERA+BGT') {
            const abs = a.inflation?.absolute ?? null;
            aValue = abs !== null && beraPrice?.usd ? abs * beraPrice.usd : null;
          } else {
            const chainA = a as Chain;
            let abs = null;
            if (selectedTimeframe.label === 'All-time') {
              const startIdx = chainA.supplyHistory.findIndex((point: SupplyHistoryPoint) => new Date(point.date) >= BERACHAIN_GENESIS_DATE);
              if (startIdx !== -1 && startIdx < chainA.supplyHistory.length - 1) {
                abs = chainA.supplyHistory[chainA.supplyHistory.length - 1].supply - chainA.supplyHistory[startIdx].supply;
              }
            } else {
              const days = selectedTimeframe.days;
              if (chainA.supplyHistory.length > days) {
                abs = chainA.supplyHistory[chainA.supplyHistory.length - 1].supply - chainA.supplyHistory[chainA.supplyHistory.length - days - 1].supply;
              }
            }
            aValue = abs !== null && chainA.current?.price ? abs * chainA.current.price : null;
          }
          if (b.symbol === 'BERA' || b.symbol === 'BERA+BGT') {
            const abs = b.inflation?.absolute ?? null;
            bValue = abs !== null && beraPrice?.usd ? abs * beraPrice.usd : null;
          } else {
            const chainB = b as Chain;
            let abs = null;
            if (selectedTimeframe.label === 'All-time') {
              const startIdx = chainB.supplyHistory.findIndex((point: SupplyHistoryPoint) => new Date(point.date) >= BERACHAIN_GENESIS_DATE);
              if (startIdx !== -1 && startIdx < chainB.supplyHistory.length - 1) {
                abs = chainB.supplyHistory[chainB.supplyHistory.length - 1].supply - chainB.supplyHistory[startIdx].supply;
              }
            } else {
              const days = selectedTimeframe.days;
              if (chainB.supplyHistory.length > days) {
                abs = chainB.supplyHistory[chainB.supplyHistory.length - 1].supply - chainB.supplyHistory[chainB.supplyHistory.length - days - 1].supply;
              }
            }
            bValue = abs !== null && chainB.current?.price ? abs * chainB.current.price : null;
          }
          break;
      }

      // Handle null values
      if (aValue === null && bValue === null) return 0;
      if (aValue === null) return 1;
      if (bValue === null) return -1;

      // Compare values
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [allChains, sortConfig, selectedTimeframe, beraPrice]);

  const handleSort = (key: string) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Inflation Comparison</h1>
        {staleWarning && (
          <div className="mb-4 p-2 bg-yellow-100 text-yellow-800 rounded text-center text-xs font-mono border border-yellow-300">
            {staleWarning}
          </div>
        )}
        
        {/* Timeframe selector */}
        <div className="mb-4 flex gap-2">
          {TIMEFRAMES.map(tf => (
            <button
              key={tf.label}
              className={`px-4 py-2 rounded text-sm font-mono relative ${selectedTimeframe.label === tf.label ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
              onClick={() => setSelectedTimeframe(tf)}
              title={tf.label === 'All-time' ? 'Since Bera Genesis (2025-01-20)' : undefined}
            >
              {tf.label}
            </button>
          ))}
        </div>
        
        {isLoading || isLoadingOtherChains ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : (error || otherChainsError) ? (
          <div className="text-center text-red-500">{String(error || otherChainsError)}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border rounded-lg bg-white dark:bg-gray-800">
              <thead>
                <tr>
                  <th 
                    className="p-2 text-left font-mono text-xs text-gray-500 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => handleSort('chain')}
                  >
                    Chain {sortConfig.key === 'chain' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="p-2 text-left font-mono text-xs text-gray-500 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => handleSort('inflation')}
                  >
                    Annualized Inflation ({selectedTimeframe.label})
                    {sortConfig.key === 'inflation' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="p-2 text-left font-mono text-xs text-gray-500 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => handleSort('absolute')}
                  >
                    Absolute (Tokens) {sortConfig.key === 'absolute' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="p-2 text-left font-mono text-xs text-gray-500 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => handleSort('absoluteUsd')}
                  >
                    Absolute (USD) {sortConfig.key === 'absoluteUsd' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedChains.map((chain: any) => {
                  const meta = CHAIN_META[chain.symbol] || { ticker: chain.symbol, displayName: chain.symbol };
                  if (chain.symbol === 'BERA' || chain.symbol === 'BERA+BGT') {
                    const abs = chain.inflation?.absolute ?? null;
                    const absUsd = abs !== null && beraPrice?.usd ? abs * beraPrice.usd : null;
                    return (
                      <tr key={meta.ticker}>
                        <td className="p-2 font-mono text-sm">{meta.ticker}</td>
                        <td className="p-2 font-mono text-sm">
                          <InflationCell value={chain.inflation && chain.inflation.inflationCirculating !== null ? chain.inflation.inflationCirculating : null} actualDays={selectedTimeframe.days} requestedDays={selectedTimeframe.days} />
                        </td>
                        <td className="p-2 font-mono text-sm">{abs !== null ? formatNumber(abs, { decimals: 0 }) : '-'}</td>
                        <td className="p-2 font-mono text-sm">{absUsd !== null ? formatCurrency(absUsd, { decimals: 0 }) : '-'}</td>
                      </tr>
                    );
                  }
                  let abs = null;
                  let absUsd = null;
                  let showValue = true;
                  let inflationResult = null;
                  let exactPeriod = true;
                  if (selectedTimeframe.label === 'All-time') {
                    const startIdx = chain.supplyHistory.findIndex((point: SupplyHistoryPoint) => new Date(point.date) >= BERACHAIN_GENESIS_DATE);
                    if (startIdx !== -1 && startIdx < chain.supplyHistory.length - 1) {
                      const start = new Date(chain.supplyHistory[startIdx].date);
                      const end = new Date(chain.supplyHistory[chain.supplyHistory.length - 1].date);
                      exactPeriod = isExactPeriod(end, start, (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
                      abs = chain.supplyHistory[chain.supplyHistory.length - 1].supply - chain.supplyHistory[startIdx].supply;
                    } else {
                      showValue = false;
                    }
                  } else {
                    const days = selectedTimeframe.days;
                    if (chain.supplyHistory.length > days) {
                      const end = new Date(chain.supplyHistory[chain.supplyHistory.length - 1].date);
                      const start = new Date(chain.supplyHistory[chain.supplyHistory.length - days - 1].date);
                      exactPeriod = isExactPeriod(end, start, days);
                      abs = chain.supplyHistory[chain.supplyHistory.length - 1].supply - chain.supplyHistory[chain.supplyHistory.length - days - 1].supply;
                    } else {
                      showValue = false;
                    }
                  }
                  if (abs !== null && chain.current?.price) {
                    absUsd = abs * chain.current.price;
                  }
                  if (selectedTimeframe.label === 'All-time') {
                    inflationResult = calcInflation(chain, 0, true, false);
                  } else {
                    inflationResult = calcInflation(chain, selectedTimeframe.days, false, false);
                  }
                  return (
                    <tr key={meta.ticker}>
                      <td className="p-2 font-mono text-sm">{meta.ticker}</td>
                      <td className="p-2 font-mono text-sm">
                        {showValue && inflationResult.value !== null ? (
                          <span>
                            <InflationCell value={inflationResult.value} actualDays={inflationResult.actualDays} requestedDays={selectedTimeframe.days} />
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="p-2 font-mono text-sm">{showValue && abs !== null ? formatNumber(abs, { decimals: 0 }) : '-'}</td>
                      <td className="p-2 font-mono text-sm">{showValue && absUsd !== null ? formatCurrency(absUsd, { decimals: 0 }) : '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <div className="text-xs text-gray-500 mt-4 text-center">
          <span className="block text-gray-400 mb-2">Based on Circulating Supply</span>
          <span>
            All inflation rates shown are annualized. Historical supply is estimated as market cap divided by price, sourced from CoinGecko. Data may not reflect on-chain unlocks, burns, or supply events. See project README for details.
          </span>
          {sortedChains.some(chain => {
            const value = chain.symbol === 'BERA' || chain.symbol === 'BERA+BGT' 
              ? chain.inflation?.inflationCirculating 
              : selectedTimeframe.label === 'All-time'
                ? calcInflation(chain as Chain, 0, true, false).value
                : calcInflation(chain as Chain, selectedTimeframe.days, false, false).value;
            return value !== null && value !== undefined && value < 0;
          }) && (
            <div className="mt-2 text-red-500">
              Note: Negative inflation values may be due to data artifacts or incomplete periods from CoinGecko.
            </div>
          )}
        </div>
        <div className="text-xs text-gray-500 mt-6 text-center">
          Data provided by <a href="https://www.coingecko.com?utm_source=berachain-dashboard&utm_medium=referral" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600">CoinGecko</a>
        </div>
        {/* Add a small note if price data is stale or from a fallback source */}
        {(beraPrice as any)?.stale || (beraPrice as any)?.source !== 'CoinGecko' ? (
          <div className="text-xs text-yellow-600 mt-2 text-center">
            Note: BERA price data is {(beraPrice as any)?.stale ? 'stale' : 'from a fallback source'} ({(beraPrice as any)?.source || 'unknown'}). Results may be less accurate.
          </div>
        ) : null}
      </div>
    </div>
  );
}

const queryClient = new QueryClient();

export default function InflationComparisonPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <InflationComparisonContent />
    </QueryClientProvider>
  );
} 