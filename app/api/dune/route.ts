let lastKnownDuneResult: { emissions: any[]; lastUpdated: string | null } | null = null;

export async function GET(request: Request) {
  const emissionsQueryId = '4740951';
  const apiKey = '9AvqLP9hTGqiPFDykRm04v2vHqXuwtSn';

  // Fallback mode: return last known/cached result
  const url = new URL(request.url);
  if (url.searchParams.get('fallback') === '1') {
    if (lastKnownDuneResult) {
      return new Response(JSON.stringify(lastKnownDuneResult), {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Surrogate-Control': 'no-store',
          'Content-Type': 'application/json'
        }
      });
    } else {
      return new Response(JSON.stringify({ emissions: [], lastUpdated: null }), {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Surrogate-Control': 'no-store',
          'Content-Type': 'application/json'
        }
      });
    }
  }

  // Step 1: Trigger a fresh execution
  const executeRes = await fetch(`https://api.dune.com/api/v1/query/${emissionsQueryId}/execute`, {
    method: 'POST',
    headers: {
      'x-dune-api-key': apiKey,
      'Content-Type': 'application/json',
    },
  });
  if (!executeRes.ok) {
    return new Response(JSON.stringify({ error: 'Failed to trigger Dune execution' }), { status: 500 });
  }
  const executeData = await executeRes.json();
  const executionId = executeData.execution_id;
  if (!executionId) {
    return new Response(JSON.stringify({ error: 'No execution_id returned from Dune' }), { status: 500 });
  }

  // Step 2: Poll for results
  const pollUrl = `https://api.dune.com/api/v1/execution/${executionId}/results`;
  let resultData = null;
  let attempts = 0;
  const maxAttempts = 30; // ~30 seconds
  while (attempts < maxAttempts) {
    const pollRes = await fetch(pollUrl, {
      headers: {
        'x-dune-api-key': apiKey,
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
    });
    if (!pollRes.ok) {
      return new Response(JSON.stringify({ error: 'Failed to poll Dune results' }), { status: 500 });
    }
    const pollData = await pollRes.json();
    if (pollData.state === 'QUERY_STATE_COMPLETED' && pollData.result?.rows?.length) {
      resultData = pollData;
      break;
    }
    if (pollData.state === 'QUERY_STATE_FAILED') {
      return new Response(JSON.stringify({ error: 'Dune query failed', details: pollData }), { status: 500 });
    }
    await new Promise(res => setTimeout(res, 1000));
    attempts++;
  }
  if (!resultData) {
    return new Response(JSON.stringify({ error: 'Timed out waiting for Dune results' }), { status: 504 });
  }

  // Step 3: Return sorted and formatted results
  const sortedRows = [...(resultData.result.rows || [])].sort((a, b) => b.period.localeCompare(a.period));
  const responseData = {
    emissions: sortedRows.map((row) => ({
      period: row.period,
      burnt_amount: row.burnt_amount,
      daily_emission: row.daily_emission,
      minted_amount: row.minted_amount,
      total_burnt: row.total_burnt,
      total_emission: row.total_emission,
      avg_emission_7d: row.avg_emission_7d
    })),
    lastUpdated: resultData.execution_ended_at || null
  };
  // Store for fallback
  lastKnownDuneResult = responseData;
  return new Response(
    JSON.stringify(responseData),
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store',
        'Content-Type': 'application/json'
      }
    }
  );
}
