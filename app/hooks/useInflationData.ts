import { useQuery } from '@tanstack/react-query';

interface SupplyHistoryPoint {
  date: string;
  supply: number;
}

interface ChainCurrentData {
  price: number;
  marketCap: number;
  circulatingSupply: number;
  totalSupply: number;
  maxSupply: number | null;
}

interface ChainData {
  symbol: string;
  current: ChainCurrentData;
  supplyHistory: SupplyHistoryPoint[];
  lastUpdated: string;
  error?: string;
}

interface InflationData {
  chains: ChainData[];
}

async function fetchInflationData(): Promise<InflationData> {
  const response = await fetch('/api/inflation');
  if (!response.ok) {
    throw new Error('Failed to fetch inflation data');
  }
  return response.json();
}

export function useInflationData() {
  return useQuery({
    queryKey: ['inflation'],
    queryFn: fetchInflationData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  });
}

// Helper function to calculate inflation rate
export function calculateInflationRate(
  currentSupply: number,
  historicalSupply: number,
  days: number
): number {
  if (!historicalSupply || historicalSupply <= 0) return 0;
  const rate = ((currentSupply - historicalSupply) / historicalSupply) * 100;
  // Annualize the rate if needed
  return days === 1 ? rate * 365 : rate;
}

// Helper function to get supply at a specific date
export function getSupplyAtDate(
  supplyHistory: SupplyHistoryPoint[],
  date: string
): number | null {
  const point = supplyHistory.find(p => p.date === date);
  return point ? point.supply : null;
}

// Helper function to calculate metrics for a specific time period
export function calculatePeriodMetrics(
  chain: ChainData,
  days: number
): {
  inflationRate: number;
  supplyChange: number;
  supplyChangePercent: number;
} {
  const now = new Date();
  const pastDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const pastDateStr = pastDate.toISOString().split('T')[0];

  const currentSupply = chain.current.circulatingSupply;
  const pastSupply = getSupplyAtDate(chain.supplyHistory, pastDateStr);

  if (!pastSupply) {
    return {
      inflationRate: 0,
      supplyChange: 0,
      supplyChangePercent: 0
    };
  }

  const supplyChange = currentSupply - pastSupply;
  const supplyChangePercent = (supplyChange / pastSupply) * 100;
  const inflationRate = calculateInflationRate(currentSupply, pastSupply, days);

  return {
    inflationRate,
    supplyChange,
    supplyChangePercent
  };
} 