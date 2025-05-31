'use client';

import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TokenSupply, TokenPrice, DuneDataPoint, ChartData } from './types';
import { formatNumber, formatCurrency } from './utils/format';
import { Tooltip } from './components/Tooltip';
import { useDashboardData } from './hooks/useDashboardData';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, ChartTooltip, Legend);

const METRIC_EXPLANATIONS = {
  beraSupply: {
    circulating: 'The total amount of BERA tokens currently in circulation, excluding locked or reserved tokens.',
    total: 'The maximum supply of BERA tokens that will ever exist.',
  },
  bgtSupply: {
    circulating: 'The total amount of BGT tokens currently in circulation.',
    total: 'The total supply of BGT tokens, including both circulating and non-circulating tokens.',
  },
  marketCap: {
    marketCap: 'The total value of all BERA tokens in circulation, calculated by multiplying the current price by the circulating supply.',
    fdv: 'Fully Diluted Valuation - The total value of all BERA tokens if all tokens were in circulation.',
  },
  emissions: {
    latest: 'The most recent daily emission of BGT tokens.',
    avg7d: 'The average daily BGT emission over the past 7 days.',
  },
  chart: 'Shows the relationship between daily BGT emissions and BERA tokens generated from BGT burns over time.',
};

function DashboardContent() {
  const { beraSupply, bgtSupply, beraPrice, duneEmissions, duneLastUpdated, supplyData, isLoading, error, refetch } = useDashboardData();
  const [supplyWarning, setSupplyWarning] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    async function checkSupply() {
      try {
        const beraRes = await fetch('https://supply-api.berachain.com/api/stats/bera?t=' + Date.now());
        const beraApi = await beraRes.json();
        const bgtRes = await fetch('https://supply-api.berachain.com/api/stats/bgt?t=' + Date.now());
        const bgtApi = await bgtRes.json();
        const beraCircDiff = beraSupply ? Math.abs(beraSupply.circulatingSupply - beraApi.circulatingSupply) : 0;
        const beraTotalDiff = beraSupply ? Math.abs(beraSupply.totalSupply - beraApi.totalSupply) : 0;
        const bgtCircDiff = bgtSupply ? Math.abs(bgtSupply.circulatingSupply - bgtApi.circulatingSupply) : 0;
        const bgtTotalDiff = bgtSupply ? Math.abs(bgtSupply.totalSupply - bgtApi.totalSupply) : 0;
        console.log('Supply check:', {
          beraSupply, beraApi, beraCircDiff, beraTotalDiff, bgtSupply, bgtApi, bgtCircDiff, bgtTotalDiff
        });
        if (
          beraSupply && bgtSupply &&
          (beraCircDiff > 10 || beraTotalDiff > 10 || bgtCircDiff > 10 || bgtTotalDiff > 10)
        ) {
          setSupplyWarning(`Warning: Displayed supply values differ from official Berachain API.\nBERA Circ: ${beraSupply.circulatingSupply} vs ${beraApi.circulatingSupply} (Δ${beraCircDiff})\nBERA Total: ${beraSupply.totalSupply} vs ${beraApi.totalSupply} (Δ${beraTotalDiff})\nBGT Circ: ${bgtSupply.circulatingSupply} vs ${bgtApi.circulatingSupply} (Δ${bgtCircDiff})\nBGT Total: ${bgtSupply.totalSupply} vs ${bgtApi.totalSupply} (Δ${bgtTotalDiff})`);
        } else {
          setSupplyWarning(null);
        }
      } catch (e) {
        setSupplyWarning('Warning: Could not verify supply values with official Berachain API.');
      }
    }
    checkSupply();
  }, [beraSupply, bgtSupply]);

  // Defensive: check for data
  if (!duneEmissions) {
    console.warn('Missing duneEmissions', { duneEmissions });
  }

  // Process CoinGecko supply data
  const beraHistory = supplyData?.supplyHistory?.map((point: any) => point.supply) ?? [];
  const beraLabels = supplyData?.supplyHistory?.map((point: any) => point.date) ?? [];

  // Process BGT emissions data
  const emissionsByPeriod = (duneEmissions ?? []).reduce((acc: any, d: any) => {
    acc[d.period] = d;
    return acc;
  }, {});
  // Sort periods descending (newest first)
  const periods = Object.keys(emissionsByPeriod).sort((a, b) => b.localeCompare(a));

  let bgtCumulative = 0;
  const bgtHistory = [...periods].reverse().map(p => {
    bgtCumulative += emissionsByPeriod[p]?.daily_emission ?? 0;
    return bgtCumulative;
  });

  // Calculate BERA total supply (500M + BGT burns)
  let beraTotalCumulative = 500000000; // Initial supply
  const beraTotalHistory = [...periods].reverse().map(p => {
    beraTotalCumulative += Math.abs(emissionsByPeriod[p]?.burnt_amount ?? 0);
    return beraTotalCumulative;
  });

  // Helper to sum BGT emissions for BGT inflation (latest N days)
  function sumEmissions(days: number) {
    if (!periods.length) return null;
    return periods.slice(0, days).reduce((sum, p) => sum + (emissionsByPeriod[p]?.daily_emission ?? 0), 0);
  }

  // Helper to sum BGT burned for BERA (i.e., new BERA issued) for BERA inflation (latest N days)
  function sumBeraFromBgt(days: number) {
    if (!periods.length) return null;
    return periods.slice(0, days).reduce((sum, p) => sum + Math.abs(emissionsByPeriod[p]?.burnt_amount ?? 0), 0);
  }

  // Calculate emissions and inflation for 24h, 7d, 30d
  const emissions24h = sumEmissions(1);
  const emissions7d = sumEmissions(7);
  const emissions30d = sumEmissions(30);

  const beraFromBgt24h = sumBeraFromBgt(1);
  const beraFromBgt7d = sumBeraFromBgt(7);
  const beraFromBgt30d = sumBeraFromBgt(30);

  function annualizedInflation(emission: number, supply: number, periodDays: number) {
    if (!supply || supply === 0) return null;
    return ((emission * (365 / periodDays)) / supply) * 100;
  }
  const inflation = (emission: number, supply: number, days: number) =>
    annualizedInflation(emission, supply, days)?.toFixed(2);

  // Calculate Market Cap and FDV for BERA and BGT
  const beraMarketCap = beraPrice?.usd && beraSupply?.circulatingSupply
    ? beraPrice.usd * beraSupply.circulatingSupply
    : null;
  const beraFDV = beraPrice?.usd && beraSupply?.totalSupply
    ? beraPrice.usd * beraSupply.totalSupply
    : null;
  const bgtMarketCap = beraPrice?.usd && bgtSupply?.circulatingSupply
    ? beraPrice.usd * bgtSupply.circulatingSupply
    : null;
  const bgtFDV = beraPrice?.usd && bgtSupply?.totalSupply
    ? beraPrice.usd * bgtSupply.totalSupply
    : null;

  // Combined stats
  const combinedCirculating = (beraSupply?.circulatingSupply ?? 0) + (bgtSupply?.circulatingSupply ?? 0);
  const combinedTotal = (beraSupply?.totalSupply ?? 0) + (bgtSupply?.totalSupply ?? 0);
  const combinedMarketCap = (beraMarketCap ?? 0) + (bgtMarketCap ?? 0);
  const combinedFDV = (beraFDV ?? 0) + (bgtFDV ?? 0);

  // Chart data for each supply
  const beraChartData: ChartData = {
    labels: beraLabels,
    datasets: [
      {
        label: 'BERA Circulating Supply',
        data: beraHistory,
        borderColor: 'rgba(255,0,0,1)',
        fill: false,
      },
    ],
  };
  const bgtChartData: ChartData = {
    labels: periods,
    datasets: [
      {
        label: 'BGT Circulating Supply',
        data: bgtHistory,
        borderColor: 'rgba(0,123,255,1)',
        fill: false,
      },
    ],
  };
  const beraTotalChartData: ChartData = {
    labels: periods,
    datasets: [
      {
        label: 'BERA Total Supply',
        data: beraTotalHistory,
        borderColor: 'rgba(255,215,0,1)',
        fill: false,
      },
    ],
  };

  // Chart tab state
  const [selectedChart, setSelectedChart] = useState<'bera' | 'bgt' | 'beraTotal'>('bera');

  // Format last updated time for Dune data
  let duneLastUpdatedDisplay = null;
  if (duneLastUpdated) {
    const date = new Date(duneLastUpdated);
    duneLastUpdatedDisplay = `Last updated: ${date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}`;
  }

  // Force refresh all data
  const handleRefresh = async () => {
    await refetch();
    setLastRefresh(new Date());
  };

  if (error) {
    console.log('Dashboard error:', error);
    const errorStack = typeof error === 'object' && error !== null && 'stack' in error ? (error as any).stack : null;
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Error: {String(error)}</div>
          {errorStack && (
            <pre className="text-xs text-left text-red-700 bg-red-50 p-2 rounded overflow-x-auto max-w-xl mx-auto mb-4">
              {errorStack}
            </pre>
          )}
          <button 
            onClick={refetch}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => setShowDebug(!showDebug)}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded text-sm"
          >
            {showDebug ? 'Hide Debug' : 'Show Debug'}
          </button>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
          >
            Refresh Data
          </button>
          <span className="text-sm text-gray-500 self-center">
            Last refreshed: {lastRefresh.toLocaleTimeString()}
          </span>
        </div>

        {/* Debug Toggle */}
        {showDebug && (
          <div className="mb-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs font-mono overflow-auto">
            <h3 className="font-bold mb-2">Debug Info:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-bold mb-1">Raw API Response:</h4>
                <pre className="whitespace-pre-wrap">
                  {JSON.stringify({
                    duneEmissions: duneEmissions?.[0],
                    duneLastUpdated,
                    beraSupply,
                    bgtSupply,
                    beraPrice
                  }, null, 2)}
                </pre>
              </div>
              <div>
                <h4 className="font-bold mb-1">Displayed Values:</h4>
                <pre className="whitespace-pre-wrap">
                  {JSON.stringify({
                    latestEmissions: duneEmissions?.[0],
                    lastUpdated: duneLastUpdated,
                    beraCirculating: beraSupply?.circulatingSupply,
                    beraTotal: beraSupply?.totalSupply,
                    bgtCirculating: bgtSupply?.circulatingSupply,
                    bgtTotal: bgtSupply?.totalSupply,
                    beraPrice: beraPrice?.usd
                  }, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}

        {supplyWarning && (
          <div className="mb-4 p-2 bg-yellow-100 text-yellow-800 rounded border border-yellow-300 text-sm">
            {supplyWarning}
          </div>
        )}
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Berachain Dashboard</h1>
        {/* Dune Last Updated Indicator */}
        {duneLastUpdatedDisplay && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">{duneLastUpdatedDisplay}</div>
        )}
        {/* Combined Stats Panel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-10">
          <div className="border p-4 rounded-lg shadow-sm bg-white dark:bg-gray-800 flex flex-col col-span-1 transition-all duration-200 hover:shadow-md hover:border-blue-400 focus-within:shadow-md focus-within:border-blue-400">
            <div className="font-mono text-lg mb-2 text-gray-900 dark:text-white font-bold border-b-2 border-blue-200 pb-1">Combined Stats (BERA + BGT)</div>
            <div className="flex justify-between items-center"><span className="text-xs text-gray-500">Circulating</span><span className="text-right font-mono tabular-nums text-lg">{formatNumber(combinedCirculating, { compact: true })}</span></div>
            <div className="flex justify-between items-center"><span className="text-xs text-gray-500">Total</span><span className="text-right font-mono tabular-nums text-lg">{formatNumber(combinedTotal, { compact: true })}</span></div>
            <div className="flex justify-between items-center"><span className="text-xs text-gray-500">Market Cap</span><span className="text-right font-mono tabular-nums text-lg">{combinedMarketCap ? formatCurrency(combinedMarketCap, { compact: true }) : '-'}</span></div>
            <div className="flex justify-between items-center"><span className="text-xs text-gray-500">FDV</span><span className="text-right font-mono tabular-nums text-lg">{combinedFDV ? formatCurrency(combinedFDV, { compact: true }) : '-'}</span></div>
          </div>
          {/* BERA Supply Panel */}
          <div className="border p-4 rounded-lg shadow-sm bg-white dark:bg-gray-800 flex flex-col col-span-1 transition-all duration-200 hover:shadow-md hover:border-blue-400 focus-within:shadow-md focus-within:border-blue-400">
            <div className="font-mono text-lg mb-2 text-gray-900 dark:text-white font-bold border-b-2 border-blue-200 pb-1">BERA Supply</div>
            <div className="flex justify-between items-center"><span className="text-xs text-gray-500">Circulating</span><span className="text-right font-mono tabular-nums text-lg">{formatNumber(beraSupply?.circulatingSupply, { compact: true })}</span></div>
            <div className="flex justify-between items-center"><span className="text-xs text-gray-500">Total</span><span className="text-right font-mono tabular-nums text-lg">{formatNumber(beraSupply?.totalSupply, { compact: true })}</span></div>
            <div className="flex justify-between items-center"><span className="text-xs text-gray-500">Market Cap</span><span className="text-right font-mono tabular-nums text-lg">{beraMarketCap ? formatCurrency(beraMarketCap, { compact: true }) : '-'}</span></div>
            <div className="flex justify-between items-center"><span className="text-xs text-gray-500">FDV</span><span className="text-right font-mono tabular-nums text-lg">{beraFDV ? formatCurrency(beraFDV, { compact: true }) : '-'}</span></div>
          </div>
          {/* BGT Supply Panel */}
          <div className="border p-4 rounded-lg shadow-sm bg-white dark:bg-gray-800 flex flex-col col-span-1 transition-all duration-200 hover:shadow-md hover:border-blue-400 focus-within:shadow-md focus-within:border-blue-400">
            <div className="font-mono text-lg mb-2 text-gray-900 dark:text-white font-bold border-b-2 border-blue-200 pb-1">BGT Supply</div>
            <div className="flex justify-between items-center"><span className="text-xs text-gray-500">Circulating</span><span className="text-right font-mono tabular-nums text-lg">{formatNumber(bgtSupply?.circulatingSupply, { compact: true })}</span></div>
            <div className="flex justify-between items-center"><span className="text-xs text-gray-500">Total</span><span className="text-right font-mono tabular-nums text-lg">{formatNumber(bgtSupply?.totalSupply, { compact: true })}</span></div>
            <div className="flex justify-between items-center"><span className="text-xs text-gray-500">Market Cap</span><span className="text-right font-mono tabular-nums text-lg">{bgtMarketCap ? formatCurrency(bgtMarketCap, { compact: true }) : '-'}</span></div>
            <div className="flex justify-between items-center"><span className="text-xs text-gray-500">FDV</span><span className="text-right font-mono tabular-nums text-lg">{bgtFDV ? formatCurrency(bgtFDV, { compact: true }) : '-'}</span></div>
          </div>
        </div>

        {/* Inflation Panels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mt-12 mb-12">
          {/* BERA Inflation */}
          <div className="border p-4 rounded-lg shadow-sm bg-white dark:bg-gray-800 max-w-sm transition-all duration-200 hover:shadow-md hover:border-blue-400 focus-within:shadow-md focus-within:border-blue-400">
            <div className="font-mono text-xl mb-2 text-gray-900 dark:text-white font-extrabold border-b-2 border-blue-200 pb-1">Inflation - BERA</div>
            <table className="w-full text-base">
              <thead>
                <tr>
                  <th className="text-left font-mono font-normal">Period</th>
                  <th className="text-left text-gray-600 dark:text-gray-400 font-normal">Absolute</th>
                  <th className="text-left text-gray-600 dark:text-gray-400 font-normal">
                    <Tooltip content="Annualized rate as a percentage of circulating supply.">
                      <span className="inline-flex items-center gap-1 cursor-help">
                        Circulating*
                      </span>
                    </Tooltip>
                  </th>
                  <th className="text-left text-gray-600 dark:text-gray-400 font-normal">
                    <Tooltip content="Annualized rate as a percentage of total supply.">
                      <span className="inline-flex items-center gap-1 cursor-help">
                        Total*
                      </span>
                    </Tooltip>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="font-mono">24h</td>
                  <td className="text-left font-mono">{formatNumber(beraFromBgt24h, { decimals: 0 })}</td>
                  <td className="text-left font-mono">{inflation(beraFromBgt24h ?? 0, beraSupply?.circulatingSupply ?? 0, 1)}%</td>
                  <td className="text-left font-mono">{inflation(beraFromBgt24h ?? 0, beraSupply?.totalSupply ?? 0, 1)}%</td>
                </tr>
                <tr>
                  <td className="font-mono">7d</td>
                  <td className="text-left font-mono">{formatNumber(beraFromBgt7d, { decimals: 0 })}</td>
                  <td className="text-left font-mono">{inflation(beraFromBgt7d ?? 0, beraSupply?.circulatingSupply ?? 0, 7)}%</td>
                  <td className="text-left font-mono">{inflation(beraFromBgt7d ?? 0, beraSupply?.totalSupply ?? 0, 7)}%</td>
                </tr>
                <tr>
                  <td className="font-mono">30d</td>
                  <td className="text-left font-mono">{formatNumber(beraFromBgt30d, { decimals: 0 })}</td>
                  <td className="text-left font-mono">{inflation(beraFromBgt30d ?? 0, beraSupply?.circulatingSupply ?? 0, 30)}%</td>
                  <td className="text-left font-mono">{inflation(beraFromBgt30d ?? 0, beraSupply?.totalSupply ?? 0, 30)}%</td>
                </tr>
                {/* All-time row at the bottom */}
                <tr>
                  <td className="font-mono">All-time</td>
                  <td className="text-left font-mono">{formatNumber(sumBeraFromBgt(periods.length), { decimals: 0 })}</td>
                  <td className="text-left font-mono">{inflation(sumBeraFromBgt(periods.length) ?? 0, beraSupply?.circulatingSupply ?? 0, periods.length)}%</td>
                  <td className="text-left font-mono">{inflation(sumBeraFromBgt(periods.length) ?? 0, beraSupply?.totalSupply ?? 0, periods.length)}%</td>
                </tr>
              </tbody>
            </table>
          </div>
          {/* BGT Inflation */}
          <div className="border p-4 rounded-lg shadow-sm bg-white dark:bg-gray-800 max-w-sm transition-all duration-200 hover:shadow-md hover:border-blue-400 focus-within:shadow-md focus-within:border-blue-400">
            <div className="font-mono text-xl mb-2 text-gray-900 dark:text-white font-extrabold border-b-2 border-blue-200 pb-1">Inflation - BGT</div>
            <table className="w-full text-base">
              <thead>
                <tr>
                  <th className="text-left font-mono font-normal">Period</th>
                  <th className="text-left text-gray-600 dark:text-gray-400 font-normal">Absolute</th>
                  <th className="text-left text-gray-600 dark:text-gray-400 font-normal">Annualized</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="font-mono">24h</td>
                  <td className="text-left font-mono">{formatNumber(emissions24h, { decimals: 0 })}</td>
                  <td className="text-left font-mono">{inflation(emissions24h ?? 0, bgtSupply?.circulatingSupply ?? 0, 1)}%</td>
                </tr>
                <tr>
                  <td className="font-mono">7d</td>
                  <td className="text-left font-mono">{formatNumber(emissions7d, { decimals: 0 })}</td>
                  <td className="text-left font-mono">{inflation(emissions7d ?? 0, bgtSupply?.circulatingSupply ?? 0, 7)}%</td>
                </tr>
                <tr>
                  <td className="font-mono">30d</td>
                  <td className="text-left font-mono">{formatNumber(emissions30d, { decimals: 0 })}</td>
                  <td className="text-left font-mono">{inflation(emissions30d ?? 0, bgtSupply?.circulatingSupply ?? 0, 30)}%</td>
                </tr>
                {/* All-time row at the bottom */}
                <tr>
                  <td className="font-mono">All-time</td>
                  <td className="text-left font-mono">{formatNumber(sumEmissions(periods.length), { decimals: 0 })}</td>
                  <td className="text-left font-mono">{inflation(sumEmissions(periods.length) ?? 0, bgtSupply?.circulatingSupply ?? 0, periods.length)}%</td>
                </tr>
              </tbody>
            </table>
          </div>
          {/* Combined Inflation Panel */}
          <div className="border p-4 rounded-lg shadow-sm bg-white dark:bg-gray-800 max-w-sm transition-all duration-200 hover:shadow-md hover:border-blue-400 focus-within:shadow-md focus-within:border-blue-400">
            <div className="font-mono text-xl mb-2 text-gray-900 dark:text-white font-extrabold border-b-2 border-blue-200 pb-1">Inflation - Combined</div>
            <table className="w-full text-base">
              <thead>
                <tr>
                  <th className="text-left font-mono font-normal">Period</th>
                  <th className="text-left text-gray-600 dark:text-gray-400 font-normal">Absolute</th>
                  <th className="text-left text-gray-600 dark:text-gray-400 font-normal">
                    <Tooltip content="Annualized rate as a percentage of circulating supply.">
                      <span className="inline-flex items-center gap-1 cursor-help">
                        Circulating*
                      </span>
                    </Tooltip>
                  </th>
                  <th className="text-left text-gray-600 dark:text-gray-400 font-normal">
                    <Tooltip content="Annualized rate as a percentage of total supply.">
                      <span className="inline-flex items-center gap-1 cursor-help">
                        Total*
                      </span>
                    </Tooltip>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="font-mono">24h</td>
                  <td className="text-left font-mono">{formatNumber((beraFromBgt24h ?? 0) + (emissions24h ?? 0), { decimals: 0 })}</td>
                  <td className="text-left font-mono">{inflation((beraFromBgt24h ?? 0) + (emissions24h ?? 0), (beraSupply?.circulatingSupply ?? 0) + (bgtSupply?.circulatingSupply ?? 0), 1)}%</td>
                  <td className="text-left font-mono">{inflation((beraFromBgt24h ?? 0) + (emissions24h ?? 0), (beraSupply?.totalSupply ?? 0) + (bgtSupply?.totalSupply ?? 0), 1)}%</td>
                </tr>
                <tr>
                  <td className="font-mono">7d</td>
                  <td className="text-left font-mono">{formatNumber((beraFromBgt7d ?? 0) + (emissions7d ?? 0), { decimals: 0 })}</td>
                  <td className="text-left font-mono">{inflation((beraFromBgt7d ?? 0) + (emissions7d ?? 0), (beraSupply?.circulatingSupply ?? 0) + (bgtSupply?.circulatingSupply ?? 0), 7)}%</td>
                  <td className="text-left font-mono">{inflation((beraFromBgt7d ?? 0) + (emissions7d ?? 0), (beraSupply?.totalSupply ?? 0) + (bgtSupply?.totalSupply ?? 0), 7)}%</td>
                </tr>
                <tr>
                  <td className="font-mono">30d</td>
                  <td className="text-left font-mono">{formatNumber((beraFromBgt30d ?? 0) + (emissions30d ?? 0), { decimals: 0 })}</td>
                  <td className="text-left font-mono">{inflation((beraFromBgt30d ?? 0) + (emissions30d ?? 0), (beraSupply?.circulatingSupply ?? 0) + (bgtSupply?.circulatingSupply ?? 0), 30)}%</td>
                  <td className="text-left font-mono">{inflation((beraFromBgt30d ?? 0) + (emissions30d ?? 0), (beraSupply?.totalSupply ?? 0) + (bgtSupply?.totalSupply ?? 0), 30)}%</td>
                </tr>
                {/* All-time row at the bottom */}
                <tr>
                  <td className="font-mono">All-time</td>
                  <td className="text-left font-mono">{formatNumber((sumBeraFromBgt(periods.length) ?? 0) + (sumEmissions(periods.length) ?? 0), { decimals: 0 })}</td>
                  <td className="text-left font-mono">{inflation((sumBeraFromBgt(periods.length) ?? 0) + (sumEmissions(periods.length) ?? 0), (beraSupply?.circulatingSupply ?? 0) + (bgtSupply?.circulatingSupply ?? 0), periods.length)}%</td>
                  <td className="text-left font-mono">{inflation((sumBeraFromBgt(periods.length) ?? 0) + (sumEmissions(periods.length) ?? 0), (beraSupply?.totalSupply ?? 0) + (bgtSupply?.totalSupply ?? 0), periods.length)}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        {/* Add annualized note below inflation panels */}
        <div className="w-full text-center text-xs text-gray-400 mt-[-1.5rem] mb-12">
          * Annualized rate
        </div>

        {/* Chart Tabs and Chart Display */}
        <div className="w-full flex flex-col items-center mt-12 mb-10">
          <div className="flex space-x-2 mb-4">
            <button
              className={`px-4 py-2 rounded-t-lg font-mono text-sm transition-colors duration-150 ${selectedChart === 'bera' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
              onClick={() => setSelectedChart('bera')}
            >
              BERA Circulating Supply
            </button>
            <button
              className={`px-4 py-2 rounded-t-lg font-mono text-sm transition-colors duration-150 ${selectedChart === 'bgt' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
              onClick={() => setSelectedChart('bgt')}
            >
              BGT Circulating Supply
            </button>
            <button
              className={`px-4 py-2 rounded-t-lg font-mono text-sm transition-colors duration-150 ${selectedChart === 'beraTotal' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
              onClick={() => setSelectedChart('beraTotal')}
            >
              BERA Total Supply
            </button>
          </div>
          <div className="w-full max-w-4xl border rounded-b-lg shadow-sm bg-white dark:bg-gray-800 p-4">
            <div className="font-mono text-sm mb-4 text-gray-600 dark:text-gray-300">
              <Tooltip content={METRIC_EXPLANATIONS.chart}>
                {selectedChart === 'bera' && 'BERA Supply Chart'}
                {selectedChart === 'bgt' && 'BGT Supply Chart'}
                {selectedChart === 'beraTotal' && 'BERA Total Supply Chart'}
              </Tooltip>
            </div>
            <div className="h-[300px]">
              {selectedChart === 'bera' && (
                <Line 
                  data={beraChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'top' as const },
                      tooltip: { mode: 'index', intersect: false },
                    },
                    scales: {
                      y: {
                        beginAtZero: false,
                        min: 100_000_000,
                        max: 150_000_000,
                        grid: { color: 'rgba(0, 0, 0, 0.1)' },
                      },
                      x: { grid: { color: 'rgba(0, 0, 0, 0.1)' } },
                    },
                  }}
                />
              )}
              {selectedChart === 'bgt' && (
                <Line 
                  data={bgtChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'top' as const },
                      tooltip: { mode: 'index', intersect: false },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        min: 0,
                        max: 20_000_000,
                        grid: { color: 'rgba(0, 0, 0, 0.1)' },
                      },
                      x: { grid: { color: 'rgba(0, 0, 0, 0.1)' } },
                    },
                  }}
                />
              )}
              {selectedChart === 'beraTotal' && (
                <Line 
                  data={beraTotalChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'top' as const },
                      tooltip: { mode: 'index', intersect: false },
                    },
                    scales: {
                      y: {
                        beginAtZero: false,
                        min: 500_000_000,
                        max: 510_000_000,
                        grid: { color: 'rgba(0, 0, 0, 0.1)' },
                      },
                      x: { grid: { color: 'rgba(0, 0, 0, 0.1)' } },
                    },
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const queryClient = new QueryClient();

export default function Dashboard() {
  return (
    <QueryClientProvider client={queryClient}>
      <DashboardContent />
    </QueryClientProvider>
  );
}
