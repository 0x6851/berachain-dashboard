export async function GET() {
  try {
    const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=berachain-bera&vs_currencies=usd,btc');
    if (!res.ok) {
      const text = await res.text();
      console.error('CoinGecko API error:', res.status, text);
      return new Response(JSON.stringify({ error: 'CoinGecko API error', status: res.status, details: text }), { status: 500 });
    }
    
    const data = await res.json();
    const price = data['berachain-bera'];
    
    // Transform the response to match our TokenPrice type
    const transformedData = {
      usd: price.usd,
      btc: price.btc
    };
    
    return new Response(JSON.stringify(transformedData), { status: 200 });
  } catch (err) {
    console.error('Error fetching CoinGecko price:', err);
    return new Response(JSON.stringify({ error: 'Failed to fetch price', details: String(err) }), { status: 500 });
  }
}
