let cache: { data: any; timestamp: number; source: string; stale: boolean } = { data: null, timestamp: 0, source: '', stale: false };
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function GET() {
  // Check cache first
  if (cache.data && Date.now() - cache.timestamp < CACHE_DURATION) {
    console.log('Returning cached price data from', cache.source, cache.stale ? '(stale)' : '(fresh)');
    return new Response(JSON.stringify({ ...cache.data, source: cache.source, stale: cache.stale }), { status: 200 });
  }

  // Try CoinGecko first
  try {
    const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=berachain-bera&vs_currencies=usd,btc&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true');
    if (!res.ok) throw new Error('CoinGecko API error: ' + res.status);
    const data = await res.json();
    const price = data['berachain-bera'];
    // Compose TokenPrice object
    const transformedData = {
      usd: price.usd,
      usd_24h_change: price.usd_24h_change ?? 0,
      usd_24h_vol: price.usd_24h_vol ?? 0,
      usd_market_cap: price.usd_market_cap ?? 0
    };
    cache = { data: transformedData, timestamp: Date.now(), source: 'CoinGecko', stale: false };
    return new Response(JSON.stringify({ ...transformedData, source: 'CoinGecko', stale: false }), { status: 200 });
  } catch (err) {
    console.error('Error fetching CoinGecko price:', err);
  }

  // Fallback: Try CoinPaprika
  try {
    const res = await fetch('https://api.coinpaprika.com/v1/tickers/bera-bera');
    if (!res.ok) throw new Error('CoinPaprika API error: ' + res.status);
    const data = await res.json();
    // Compose TokenPrice object (CoinPaprika fields may differ)
    const transformedData = {
      usd: data.quotes?.USD?.price ?? 0,
      usd_24h_change: data.quotes?.USD?.percent_change_24h ?? 0,
      usd_24h_vol: data.quotes?.USD?.volume_24h ?? 0,
      usd_market_cap: data.quotes?.USD?.market_cap ?? 0
    };
    cache = { data: transformedData, timestamp: Date.now(), source: 'CoinPaprika', stale: false };
    return new Response(JSON.stringify({ ...transformedData, source: 'CoinPaprika', stale: false }), { status: 200 });
  } catch (err) {
    console.error('Error fetching CoinPaprika price:', err);
  }

  // If all fail, return stale cache if available
  if (cache.data) {
    console.warn('Returning stale cached price data from', cache.source);
    return new Response(JSON.stringify({ ...cache.data, source: cache.source, stale: true }), { status: 200 });
  }

  // If no data at all, return error
  return new Response(JSON.stringify({ error: 'Failed to fetch price from all sources' }), { status: 500 });
}
