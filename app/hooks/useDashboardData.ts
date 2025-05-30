import { useQuery } from '@tanstack/react-query';
import { TokenSupply, TokenPrice, DuneDataPoint } from '../types';

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

const fetchDuneEmissions = async (): Promise<DuneDataPoint[]> => {
  try {
    const response = await fetch('/api/dune');
    const data = await response.json();
    
    if (!data.emissions) {
      console.error('No emissions data in response:', data);
      return [];
    }
    
    return data.emissions.map((row: any) => ({
      period: row.period,
      burnt_amount: row.burnt_amount,
      daily_emission: row.daily_emission,
      minted_amount: row.minted_amount,
      total_burnt: row.total_burnt,
      total_emission: row.total_emission,
      avg_emission_7d: row.avg_emission_7d
    }));
  } catch (error) {
    console.error('Error fetching Dune emissions:', error);
    return [];
  }
};

export function useDashboardData() {
  const { data: beraSupply, isLoading: isLoadingBeraSupply, error: beraSupplyError } = useQuery({
    queryKey: ['beraSupply'],
    queryFn: fetchBeraSupply,
  });

  const { data: bgtSupply, isLoading: isLoadingBgtSupply, error: bgtSupplyError } = useQuery({
    queryKey: ['bgtSupply'],
    queryFn: fetchBgtSupply,
  });

  const { data: beraPrice, isLoading: isLoadingBeraPrice, error: beraPriceError } = useQuery({
    queryKey: ['beraPrice'],
    queryFn: fetchBeraPrice,
  });

  const { data: duneEmissions, isLoading: isLoadingDuneEmissions, error: duneEmissionsError } = useQuery({
    queryKey: ['duneEmissions'],
    queryFn: fetchDuneEmissions,
  });

  const { data: supplyData, isLoading: isSupplyLoading, error: supplyError } = useQuery({
    queryKey: ['supply'],
    queryFn: async () => {
      const response = await fetch('/api/coingecko');
      if (!response.ok) {
        throw new Error('Failed to fetch supply data');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const isLoading = isLoadingBeraSupply || isLoadingBgtSupply || isLoadingBeraPrice || isLoadingDuneEmissions || isSupplyLoading;
  const error = beraSupplyError || bgtSupplyError || beraPriceError || duneEmissionsError || supplyError;

  return {
    beraSupply,
    bgtSupply,
    beraPrice,
    duneEmissions,
    supplyData,
    isLoading,
    error,
    refetch: () => {
      // Implement refetch logic if needed
    },
  };
} 