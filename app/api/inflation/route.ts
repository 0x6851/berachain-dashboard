import { NextRequest, NextResponse } from 'next/server';
import { calculateBeraInflation, calculateBeraBgtInflation, EmissionDataPoint, SupplyData } from '../../../lib/inflation';

const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';
const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY || '';
const CACHE_DURATION = 60 * 60 * 1000; // 60 minutes
const RATE_LIMIT_DELAY = 2000; // 2 seconds between requests (30 per minute)
const MAX_RETRIES = 3;

// In-memory cache with chain-specific timestamps
const cache: {
  data: any;
  timestamps: { [key: string]: number };
} = {
  data: {},
  timestamps: {}
};

// List of chains to track with correct CoinGecko IDs
const CHAINS = [
  'bitcoin',
  'ethereum',
  'solana',
  'sui',
  'avalanche-2',
  'binancecoin',
  'sei-network',
  'near',
  'aptos',
  'berachain-bera',
  'berachain-bgt'
];

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to fetch with retry and exponential backoff
async function fetchWithRetry(url: string, retries = MAX_RETRIES): Promise<Response> {
  let lastError;
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`[fetchWithRetry] Attempt ${i+1} for URL:`, url);
      console.log(`[fetchWithRetry] Using headers:`, { 'x-cg-demo-api-key': COINGECKO_API_KEY });
      const response = await fetch(url, {
        headers: {
          'x-cg-demo-api-key': COINGECKO_API_KEY
        }
      });
      console.log(`[fetchWithRetry] Response status:`, response.status, response.statusText);
      if (!response.ok) {
        const errorText = await response.text();
        console.log(`[fetchWithRetry] Response body:`, errorText);
      }
      if (response.ok) {
        return response;
      }
      
      // If we hit rate limit, wait longer
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : Math.pow(2, i) * 1000;
        console.log(`Rate limited, waiting ${waitTime}ms before retry`);
        await delay(waitTime);
        continue;
      }
      
      throw new Error(`HTTP error! status: ${response.status}`);
    } catch (error) {
      lastError = error;
      if (i < retries - 1) {
        const waitTime = Math.pow(2, i) * 1000;
        console.log(`Request failed, waiting ${waitTime}ms before retry`);
        await delay(waitTime);
      }
    }
  }
  throw lastError || new Error('Max retries reached');
}

// Helper function to fetch BERA data
async function fetchBeraData() {
  try {
    // Fetch BERA supply data
    const beraRes = await fetch('https://supply-api.berachain.com/api/stats/bera');
    if (!beraRes.ok) {
      throw new Error(`BERA supply API error: ${beraRes.status}`);
    }
    const beraData = await beraRes.json();

    // Fetch BGT emissions data from Dune (use absolute URL for server-side fetch)
    const duneRes = await fetch('http://localhost:3000/api/dune');
    if (!duneRes.ok) {
      throw new Error(`Dune API error: ${duneRes.status}`);
    }
    const duneData = await duneRes.json();
    const emissions: EmissionDataPoint[] = duneData.emissions || [];

    // Calculate inflation stats for 1, 7, 30, all-time
    const beraSupply: SupplyData = {
      circulatingSupply: beraData.circulatingSupply,
      totalSupply: beraData.totalSupply,
    };
    const stats = [1, 7, 30, emissions.length].map(days =>
      calculateBeraInflation(emissions, beraSupply, days)
    );

    return {
      symbol: 'BERA',
      current: beraSupply,
      inflationStats: stats,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error fetching BERA data:', error);
    return {
      symbol: 'BERA',
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

// Helper function to fetch BERA+BGT data
async function fetchBeraBgtData() {
  try {
    // Fetch BERA and BGT supply data
    const [beraRes, bgtRes] = await Promise.all([
      fetch('https://supply-api.berachain.com/api/stats/bera'),
      fetch('https://supply-api.berachain.com/api/stats/bgt')
    ]);

    if (!beraRes.ok || !bgtRes.ok) {
      throw new Error(`Supply API error: BERA=${beraRes.status}, BGT=${bgtRes.status}`);
    }

    const [beraData, bgtData] = await Promise.all([
      beraRes.json(),
      bgtRes.json()
    ]);

    // Fetch BGT emissions data from Dune (use absolute URL for server-side fetch)
    const duneRes = await fetch('http://localhost:3000/api/dune');
    if (!duneRes.ok) {
      throw new Error(`Dune API error: ${duneRes.status}`);
    }
    const duneData = await duneRes.json();
    const emissions: EmissionDataPoint[] = duneData.emissions || [];

    const beraSupply: SupplyData = {
      circulatingSupply: beraData.circulatingSupply,
      totalSupply: beraData.totalSupply,
    };
    const bgtSupply: SupplyData = {
      circulatingSupply: bgtData.circulatingSupply,
      totalSupply: bgtData.totalSupply,
    };
    const stats = [1, 7, 30, emissions.length].map(days =>
      calculateBeraBgtInflation(emissions, beraSupply, bgtSupply, days)
    );

    return {
      symbol: 'BERA+BGT',
      current: {
        circulatingSupply: beraData.circulatingSupply + bgtData.circulatingSupply,
        totalSupply: beraData.totalSupply + bgtData.totalSupply,
      },
      inflationStats: stats,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error fetching BERA+BGT data:', error);
    return {
      symbol: 'BERA+BGT',
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

// Helper function to fetch chain data
async function fetchChainData(chainId: string) {
  try {
    // Check if we have valid cached data for this chain
    if (cache.data[chainId] && Date.now() - cache.timestamps[chainId] < CACHE_DURATION) {
      console.log(`Returning cached data for ${chainId}`);
      return cache.data[chainId];
    }

    // Special handling for BERA and BERA+BGT
    if (chainId === 'bera') {
      const data = await fetchBeraData();
      cache.data[chainId] = data;
      cache.timestamps[chainId] = Date.now();
      return data;
    }

    if (chainId === 'bera-bgt') {
      const data = await fetchBeraBgtData();
      cache.data[chainId] = data;
      cache.timestamps[chainId] = Date.now();
      return data;
    }

    // Add delay between requests to avoid rate limits
    await delay(RATE_LIMIT_DELAY);

    // Fetch current data for other chains
    const currentUrl = `${COINGECKO_BASE_URL}/coins/${chainId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false`;
    let currentResponse;
    try {
      currentResponse = await fetchWithRetry(currentUrl);
    } catch (error) {
      // If rate limited or fetch fails, return cached data as stale
      if (cache.data[chainId]) {
        return {
          ...cache.data[chainId],
          stale: true,
          warning: 'Data may be out of date due to rate limiting or fetch error.'
        };
      }
      return {
        symbol: chainId.toUpperCase(),
        error: error instanceof Error ? error.message : String(error),
        stale: false
      };
    }
    const currentData = await currentResponse.json();

    // Add delay between requests
    await delay(RATE_LIMIT_DELAY);

    // Fetch historical data (365 days)
    const historicalUrl = `${COINGECKO_BASE_URL}/coins/${chainId}/market_chart?vs_currency=usd&days=365&interval=daily`;
    let historicalResponse;
    try {
      historicalResponse = await fetchWithRetry(historicalUrl);
    } catch (error) {
      // If rate limited or fetch fails, return cached data as stale
      if (cache.data[chainId]) {
        return {
          ...cache.data[chainId],
          stale: true,
          warning: 'Data may be out of date due to rate limiting or fetch error.'
        };
      }
      return {
        symbol: chainId.toUpperCase(),
        error: error instanceof Error ? error.message : String(error),
        stale: false
      };
    }
    const historicalData = await historicalResponse.json();

    // Process the data
    const marketData = currentData.market_data;
    const prices = historicalData.prices || [];
    const marketCaps = historicalData.market_caps || [];

    // Calculate supply history
    const supplyHistory = prices.map((price: [number, number], index: number) => {
      const [timestamp, priceValue] = price;
      const [_, marketCap] = marketCaps[index] || [];
      const supply = marketCap / priceValue;
      return {
        date: new Date(timestamp).toISOString().split('T')[0],
        supply
      };
    });

    const chainData = {
      symbol: chainId.toUpperCase(),
      current: {
        price: marketData.current_price.usd,
        marketCap: marketData.market_cap.usd,
        circulatingSupply: marketData.circulating_supply,
        totalSupply: marketData.total_supply,
        maxSupply: marketData.max_supply
      },
      supplyHistory,
      lastUpdated: new Date().toISOString(),
      stale: false
    };

    // Cache the result
    cache.data[chainId] = chainData;
    cache.timestamps[chainId] = Date.now();

    return chainData;
  } catch (error) {
    console.error(`Error fetching data for ${chainId}:`, error);
    // If we have cached data, return it as stale
    if (cache.data[chainId]) {
      return {
        ...cache.data[chainId],
        stale: true,
        warning: 'Data may be out of date due to rate limiting or fetch error.'
      };
    }
    return {
      symbol: chainId.toUpperCase(),
      error: error instanceof Error ? error.message : String(error),
      stale: false
    };
  }
}

console.log('COINGECKO_API_KEY loaded:', COINGECKO_API_KEY ? `${COINGECKO_API_KEY.slice(0, 4)}...${COINGECKO_API_KEY.slice(-4)}` : 'NOT SET');

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const exclude = searchParams.get('exclude')?.split(',') || [];
    // Filter out excluded chains
    const chainsToFetch = CHAINS.filter(chain => !exclude.includes(chain));
    const chainDataPromises = chainsToFetch.map(chainId => fetchChainData(chainId));
    const chains = await Promise.all(chainDataPromises);
    // If any chain is stale, add a top-level warning
    const anyStale = chains.some(chain => chain.stale);
    const warning = anyStale ? 'Some data may be out of date due to rate limiting or fetch error.' : undefined;
    return NextResponse.json({ chains, warning });
  } catch (error) {
    console.error('Error fetching inflation data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inflation data' },
      { status: 500 }
    );
  }
}