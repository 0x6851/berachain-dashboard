export async function GET() {
  try {
    const res = await fetch('https://supply-api.berachain.com/api/stats/bgt');
    if (!res.ok) {
      const text = await res.text();
      console.error('BGT supply API error:', res.status, text);
      return new Response(JSON.stringify({ error: 'BGT supply API error', status: res.status, details: text }), { status: 500 });
    }
    
    const data = await res.json();
    console.log('BGT supply data:', data);
    
    let circulatingSupply = Number(data.circulatingSupply);
    let totalSupply = Number(data.totalSupply);
    if (!isFinite(circulatingSupply) || circulatingSupply <= 0) {
      console.error('Invalid or missing circulatingSupply:', data.circulatingSupply);
      return new Response(JSON.stringify({ error: 'Invalid or missing circulatingSupply', details: data }), { status: 500 });
    }
    if (!isFinite(totalSupply) || totalSupply <= 0) {
      console.error('Invalid or missing totalSupply:', data.totalSupply);
      return new Response(JSON.stringify({ error: 'Invalid or missing totalSupply', details: data }), { status: 500 });
    }
    
    // Transform the response to match our TokenSupply type
    const transformedData = {
      circulatingSupply,
      totalSupply
    };
    
    console.log('Transformed BGT supply data:', transformedData);
    return new Response(JSON.stringify(transformedData), { status: 200 });
  } catch (err) {
    console.error('Error fetching BGT supply:', err);
    return new Response(JSON.stringify({ error: 'Failed to fetch BGT supply', details: String(err) }), { status: 500 });
  }
}
