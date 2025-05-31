export async function GET() {
  try {
    // Fetch BERA supply data
    const beraRes = await fetch('https://supply-api.berachain.com/api/stats/bera');
    if (!beraRes.ok) {
      const text = await beraRes.text();
      console.error('BERA supply API error:', beraRes.status, text);
      return new Response(JSON.stringify({ error: 'BERA supply API error', status: beraRes.status, details: text }), { status: 500 });
    }
    const beraData = await beraRes.json();
    console.log('BERA supply data:', beraData);

    // Defensive: check for valid circulatingSupply
    let circulatingSupply = Number(beraData.circulatingSupply);
    let totalSupply = Number(beraData.totalSupply);
    if (!isFinite(circulatingSupply) || circulatingSupply <= 0) {
      console.error('Invalid or missing circulatingSupply:', beraData.circulatingSupply);
      return new Response(JSON.stringify({ error: 'Invalid or missing circulatingSupply', details: beraData }), { status: 500 });
    }
    if (!isFinite(totalSupply) || totalSupply <= 0) {
      console.warn('Invalid or missing totalSupply from API, falling back to 500M');
      totalSupply = 500000000;
    }

    // Transform the response to match our TokenSupply type
    const transformedData = {
      circulatingSupply,
      totalSupply
    };

    console.log('Transformed BERA supply data:', transformedData);
    return new Response(JSON.stringify(transformedData), { status: 200 });
  } catch (err) {
    console.error('Error fetching BERA supply:', err);
    return new Response(JSON.stringify({ error: 'Failed to fetch BERA supply', details: String(err) }), { status: 500 });
  }
}
