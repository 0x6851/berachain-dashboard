export interface TokenSupply {
  circulatingSupply: number;
  totalSupply: number;
}

export interface TokenPrice {
  usd: number;
  usd_24h_change: number;
  usd_24h_vol: number;
  usd_market_cap: number;
}

export interface DuneDataPoint {
  period: string;
  avg_emission_7d: number;
  burnt_amount: number;
  daily_emission: number;
  minted_amount: number;
  total_burnt: number;
  total_emission: number;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    fill: boolean;
  }[];
} 