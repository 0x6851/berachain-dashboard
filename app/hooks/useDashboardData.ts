import { useQuery } from '@tanstack/react-query';
import { TokenSupply, TokenPrice, DuneDataPoint } from '../types';
import { useEffect } from 'react';

async function fetchBeraSupply(): Promise<TokenSupply> {
  const response = await fetch('/api/supply/bera');
  if (!response.ok) throw new Error('Failed to fetch BERA supply');
  return response.json();
}

async function fetchBgtSupply(): Promise<TokenSupply> {
  const response = await fetch('/api/supply/bgt');
  if (!response.ok) throw new Error('Failed to fetch BGT supply');
  return response.json();
}

async function fetchBeraPrice(): Promise<TokenPrice> {
  const response = await fetch('/api/price');
  if (!response.ok) throw new Error('Failed to fetch BERA price');
  return response.json();
}

const fetchDuneEmissions = async (): Promise<{ emissions: DuneDataPoint[]; lastUpdated?: string }> => {
  try {
    const response = await fetch('/api/dune');
    const data = await response.json();
    
    if (!data.emissions) {
      console.error('No emissions data in response:', data);
      return { emissions: [] };
    }
    
    return {
      emissions: data.emissions.map((row: any) => ({
        period: row.period,
        burnt_amount: row.burnt_amount,
        daily_emission: row.daily_emission,
        minted_amount: row.minted_amount,
        total_burnt: row.total_burnt,
        total_emission: row.total_emission,
        avg_emission_7d: row.avg_emission_7d
      })),
      lastUpdated: data.lastUpdated
    };
  } catch (error) {
    console.error('Error fetching Dune emissions:', error);
    return { emissions: [] };
  }
};

export function useDashboardData() {
  const beraSupplyQuery = useQuery({
    queryKey: ['beraSupply'],
    queryFn: fetchBeraSupply,
    staleTime: 0,
    gcTime: 0,
  });

  const bgtSupplyQuery = useQuery({
    queryKey: ['bgtSupply'],
    queryFn: fetchBgtSupply,
    staleTime: 0,
    gcTime: 0,
  });

  const beraPriceQuery = useQuery({
    queryKey: ['beraPrice'],
    queryFn: fetchBeraPrice,
    staleTime: 0,
    gcTime: 0,
  });

  const duneEmissionsQuery = useQuery({
    queryKey: ['duneEmissions'],
    queryFn: fetchDuneEmissions,
    staleTime: 0,
    gcTime: 0,
    refetchInterval: 60000, // Refetch every minute
  });

  const supplyDataQuery = useQuery({
    queryKey: ['supply'],
    queryFn: async () => {
      const response = await fetch('/api/coingecko');
      if (!response.ok) {
        throw new Error('Failed to fetch supply data');
      }
      return response.json();
    },
    staleTime: 0,
    gcTime: 0,
  });

  // Log data changes for debugging
  useEffect(() => {
    if (duneEmissionsQuery.data?.emissions) {
      console.log('Dune data updated:', {
        latest: duneEmissionsQuery.data.emissions[0],
        lastUpdated: duneEmissionsQuery.data.lastUpdated,
        timestamp: new Date().toISOString()
      });
    }
  }, [duneEmissionsQuery.data]);

  const refetchAll = async () => {
    await Promise.all([
      beraSupplyQuery.refetch(),
      bgtSupplyQuery.refetch(),
      beraPriceQuery.refetch(),
      duneEmissionsQuery.refetch(),
      supplyDataQuery.refetch(),
    ]);
  };

  return {
    beraSupply: beraSupplyQuery.data,
    bgtSupply: bgtSupplyQuery.data,
    beraPrice: beraPriceQuery.data,
    duneEmissions: duneEmissionsQuery.data?.emissions || [],
    duneLastUpdated: duneEmissionsQuery.data?.lastUpdated,
    supplyData: supplyDataQuery.data,
    isLoading: beraSupplyQuery.isLoading || bgtSupplyQuery.isLoading || beraPriceQuery.isLoading || duneEmissionsQuery.isLoading || supplyDataQuery.isLoading,
    error: beraSupplyQuery.error || bgtSupplyQuery.error || beraPriceQuery.error || duneEmissionsQuery.error || supplyDataQuery.error,
    refetch: refetchAll,
  };
} 