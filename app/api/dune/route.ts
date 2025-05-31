export async function GET() {
  const emissionsQueryId = '4740951';
  const apiKey = '9AvqLP9hTGqiPFDykRm04v2vHqXuwtSn';

  // Fetch emissions data
  const emissionsRes = await fetch(`https://api.dune.com/api/v1/query/${emissionsQueryId}/results`, {
    headers: {
      'x-dune-api-key': apiKey,
    },
  });

  if (!emissionsRes.ok) {
    return new Response(JSON.stringify({ error: 'Failed to fetch Dune data' }), { status: 500 });
  }

  const emissionsData = await emissionsRes.json();

  // Log the responses for debugging
  console.log('Emissions Data:', emissionsData);
  if (emissionsData.result && Array.isArray(emissionsData.result.rows) && emissionsData.result.rows.length > 0) {
    console.log('First Emissions Row:', emissionsData.result.rows[0]);
  }

  // Return the data in the expected format
  return new Response(
    JSON.stringify({
      emissions: emissionsData.result.rows.map((row: any) => ({
        period: row.period,
        burnt_amount: row.burnt_amount,
        daily_emission: row.daily_emission,
        minted_amount: row.minted_amount,
        total_burnt: row.total_burnt,
        total_emission: row.total_emission,
        avg_emission_7d: row.avg_emission_7d
      })),
      lastUpdated: emissionsData.execution_ended_at || null
    }),
    { status: 200 }
  );
}
