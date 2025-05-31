import { NextResponse } from 'next/server';

const COINGECKO_ID = 'berachain-bera';
const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const cache: { data: any; timestamp: number } = { data: null, timestamp: 0 };

export async function GET() {
  try {
    // Check cache
    if (cache.data && Date.now() - cache.timestamp < CACHE_DURATION) {
      console.log('Returning cached CoinGecko data');
      return NextResponse.json({ ...cache.data, stale: false });
    }

    // Fetch historical market chart data (limit to 365 days)
    const url = `${COINGECKO_BASE_URL}/coins/${COINGECKO_ID}/market_chart?vs_currency=usd&days=365`;
    console.log('Fetching CoinGecko data from', url);
    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('CoinGecko API error:', response.status, response.statusText, errorText);
      throw new Error(`CoinGecko API error: ${response.status} ${response.statusText} - ${errorText}`);
    }
    const data = await response.json();

    // CoinGecko's market_chart endpoint returns:
    // prices: [ [timestamp, price], ... ]
    // market_caps: [ [timestamp, market_cap], ... ]
    // total_volumes: [ [timestamp, volume], ... ]
    // It does NOT return supply directly, but we can estimate supply as market_cap / price if both are present.
    const prices = data.prices || [];
    const marketCaps = data.market_caps || [];
    const supplyHistory: { date: string; supply: number }[] = [];
    for (let i = 0; i < prices.length; i++) {
      const [timestamp, price] = prices[i];
      const [_, marketCap] = marketCaps[i] || [];
      if (price && marketCap) {
        const supply = marketCap / price;
        const date = new Date(timestamp).toISOString().split('T')[0];
        supplyHistory.push({ date, supply });
      }
    }

    // Cache the result
    cache.data = { supplyHistory };
    cache.timestamp = Date.now();

    // Log for debugging
    console.log('CoinGecko supplyHistory sample:', supplyHistory.slice(-3));

    return NextResponse.json({ supplyHistory, stale: false });
  } catch (error) {
    console.error('Error fetching CoinGecko data:', error);
    // If we have cached data, return it as stale
    if (cache.data) {
      return NextResponse.json({ ...cache.data, stale: true, warning: 'Data may be out of date due to rate limiting or fetch error.' });
    }
    return NextResponse.json(
      { error: 'Failed to fetch CoinGecko data', details: error instanceof Error ? error.message : String(error), stale: false },
      { status: 500 }
    );
  }
} 