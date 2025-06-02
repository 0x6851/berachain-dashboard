import { useQuery } from '@tanstack/react-query';
import { TokenSupply, TokenPrice, DuneDataPoint } from '../types';
import { useEffect } from 'react';

async function fetchBeraSupply(): Promise<TokenSupply> {
  const response = await fetch(`/api/supply/bera?t=${Date.now()}`);
  if (!response.ok) throw new Error('Failed to fetch BERA supply');
  return response.json();
}

async function fetchBgtSupply(): Promise<TokenSupply> {
  const response = await fetch(`/api/supply/bgt?t=${Date.now()}`);
  if (!response.ok) throw new Error('Failed to fetch BGT supply');
  return response.json();
}

async function fetchBeraPrice(): Promise<TokenPrice> {
  const response = await fetch(`/api/price?t=${Date.now()}`);
  if (!response.ok) throw new Error('Failed to fetch BERA price');
  return response.json();
}

async function fetchDuneEmissions() {
  try {
    // Try Dune first
    const duneResponse = await fetch('/api/dune');
    if (duneResponse.ok) {
      const duneData = await duneResponse.json();
      // If successful, update backup
      try {
        await fetch('/api/backup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            emissions: duneData.emissions,
            source: 'dune'
          })
        });
      } catch (error) {
        console.error('Error updating backup:', error);
      }
      return duneData;
    }
    throw new Error('Dune API error');
  } catch (error) {
    console.warn('Falling back to backup data:', error);
    // Fall back to backup data
    const backupResponse = await fetch('/api/backup');
    if (!backupResponse.ok) {
      throw new Error('Failed to fetch backup data');
    }
    const backupData = await backupResponse.json();
    if (backupData.error) {
      throw new Error(backupData.error.error);
    }
    return backupData.data;
  }
}

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
    if (beraSupplyQuery.data || beraSupplyQuery.error) {
      console.log('[Diagnostics] beraSupplyQuery:', beraSupplyQuery);
    }
    if (bgtSupplyQuery.data || bgtSupplyQuery.error) {
      console.log('[Diagnostics] bgtSupplyQuery:', bgtSupplyQuery);
    }
    if (beraPriceQuery.data || beraPriceQuery.error) {
      console.log('[Diagnostics] beraPriceQuery:', beraPriceQuery);
    }
    if (duneEmissionsQuery.data || duneEmissionsQuery.error) {
      console.log('[Diagnostics] duneEmissionsQuery:', duneEmissionsQuery);
    }
    if (supplyDataQuery.data || supplyDataQuery.error) {
      console.log('[Diagnostics] supplyDataQuery:', supplyDataQuery);
    }
  }, [beraSupplyQuery.data, beraSupplyQuery.error, bgtSupplyQuery.data, bgtSupplyQuery.error, beraPriceQuery.data, beraPriceQuery.error, duneEmissionsQuery.data, duneEmissionsQuery.error, supplyDataQuery.data, supplyDataQuery.error]);

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
    duneEmissionsError: duneEmissionsQuery.data?.error || duneEmissionsQuery.error,
    supplyData: supplyDataQuery.data,
    isLoading: beraSupplyQuery.isLoading || bgtSupplyQuery.isLoading || beraPriceQuery.isLoading || duneEmissionsQuery.isLoading || supplyDataQuery.isLoading,
    error: beraSupplyQuery.error || bgtSupplyQuery.error || beraPriceQuery.error || duneEmissionsQuery.error || supplyDataQuery.error,
    refetch: refetchAll,
  };
} 