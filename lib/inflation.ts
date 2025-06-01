// Shared inflation calculation logic for BERA and BERA+BGT
// This module will be imported by both the dashboard and the API

export interface EmissionDataPoint {
  period: string; // e.g. '2025-05-30'
  daily_emission: number;
  burnt_amount: number;
}

export interface SupplyData {
  circulatingSupply: number;
  totalSupply: number;
}

export interface InflationStats {
  period: string;
  absolute: number;
  inflationCirculating: number;
  inflationTotal: number;
}

// Helper to calculate annualized inflation
function annualizedInflation(emission: number, supply: number, days: number): number | null {
  if (!supply || supply === 0) return null;
  return ((emission * (365 / days)) / supply) * 100;
}

// Helper to get the last N complete days from emissions
function getLastNCompleteDays(emissions: EmissionDataPoint[], days: number): EmissionDataPoint[] {
  if (!emissions || emissions.length === 0) return [];
  const today = new Date().toISOString().split('T')[0];
  let startIdx = 0;
  // If the most recent entry is for today, skip it
  if (emissions[0].period === today) {
    startIdx = 1;
  }
  return emissions.slice(startIdx, startIdx + days);
}

// Calculate BERA inflation for a given period
export function calculateBeraInflation(
  emissions: EmissionDataPoint[],
  beraSupply: SupplyData,
  days: number
): InflationStats | null {
  if (!emissions || emissions.length === 0) return null;
  // Defensive: check beraSupply
  if (!beraSupply || typeof beraSupply.circulatingSupply !== 'number' || typeof beraSupply.totalSupply !== 'number') {
    return null;
  }
  // Use the last N complete days
  const recent = getLastNCompleteDays(emissions, days);
  if (recent.length === 0) return null;
  const absolute = recent.reduce((sum, e) => sum + Math.abs(e.burnt_amount || 0), 0);
  const inflationCirculating = annualizedInflation(absolute, beraSupply.circulatingSupply, days);
  const inflationTotal = annualizedInflation(absolute, beraSupply.totalSupply, days);
  return {
    period: `${days}d`,
    absolute,
    inflationCirculating: inflationCirculating ?? 0,
    inflationTotal: inflationTotal ?? 0,
  };
}

// Calculate BERA+BGT inflation for a given period
export function calculateBeraBgtInflation(
  emissions: EmissionDataPoint[],
  beraSupply: SupplyData,
  bgtSupply: SupplyData,
  days: number
): InflationStats | null {
  if (!emissions || emissions.length === 0) return null;
  // Defensive: check beraSupply and bgtSupply
  if (!beraSupply || typeof beraSupply.circulatingSupply !== 'number' || typeof beraSupply.totalSupply !== 'number') {
    return null;
  }
  if (!bgtSupply || typeof bgtSupply.circulatingSupply !== 'number' || typeof bgtSupply.totalSupply !== 'number') {
    return null;
  }
  // Use the last N complete days
  const recent = getLastNCompleteDays(emissions, days);
  if (recent.length === 0) return null;
  const beraFromBgt = recent.reduce((sum, e) => sum + Math.abs(e.burnt_amount || 0), 0);
  const bgtEmissions = recent.reduce((sum, e) => sum + (e.daily_emission || 0), 0);
  const absolute = beraFromBgt + bgtEmissions;
  const circulating = beraSupply.circulatingSupply + bgtSupply.circulatingSupply;
  const total = beraSupply.totalSupply + bgtSupply.totalSupply;
  const inflationCirculating = annualizedInflation(absolute, circulating, days);
  const inflationTotal = annualizedInflation(absolute, total, days);
  return {
    period: `${days}d`,
    absolute,
    inflationCirculating: inflationCirculating ?? 0,
    inflationTotal: inflationTotal ?? 0,
  };
} 