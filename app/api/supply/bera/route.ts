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
    if (!isFinite(circulatingSupply) || circulatingSupply <= 0) {
      console.error('Invalid or missing circulatingSupply:', beraData.circulatingSupply);
      return new Response(JSON.stringify({ error: 'Invalid or missing circulatingSupply', details: beraData }), { status: 500 });
    }

    // Fetch Dune data to get BGT burns
    const duneRes = await fetch('https://api.dune.com/api/v1/query/4740951/results', {
      headers: {
        'x-dune-api-key': '9AvqLP9hTGqiPFDykRm04v2vHqXuwtSn',
      },
    });
    if (!duneRes.ok) {
      const text = await duneRes.text();
      console.error('Dune API error:', duneRes.status, text);
      return new Response(JSON.stringify({ error: 'Dune API error', status: duneRes.status, details: text }), { status: 500 });
    }
    const duneData = await duneRes.json();
    console.log('Dune data:', duneData);

    // Calculate total BERA from BGT burns
    const beraFromBurns = duneData.result?.rows?.reduce((sum: number, row: any) => {
      return sum + (row.bera_from_bgt || 0);
    }, 0) || 0;

    // Total supply is initial 500M plus any BERA from burns
    const totalSupply = 500000000 + beraFromBurns;
    if (!isFinite(totalSupply) || totalSupply < 500000000) {
      console.error('Invalid totalSupply calculation:', totalSupply);
      return new Response(JSON.stringify({ error: 'Invalid totalSupply calculation', details: { beraFromBurns, totalSupply } }), { status: 500 });
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
