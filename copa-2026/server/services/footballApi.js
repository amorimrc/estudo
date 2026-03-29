const https = require('https');

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const cache = new Map();

function fetchJson(url, headers) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
  });
}

async function getFixtureResult(externalMatchId) {
  const apiKey = process.env.API_FOOTBALL_KEY;
  if (!apiKey || !externalMatchId) return null;

  const cacheKey = `fixture_${externalMatchId}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data;

  try {
    const data = await fetchJson(
      `https://v3.football.api-sports.io/fixtures?id=${externalMatchId}`,
      { 'x-apisports-key': apiKey }
    );
    const fixture = data?.response?.[0];
    if (!fixture) return null;

    const result = {
      home_score: fixture.goals.home,
      away_score: fixture.goals.away,
      status: fixture.fixture.status.short === 'FT' ? 'finished'
            : fixture.fixture.status.short === '1H' || fixture.fixture.status.short === '2H' ? 'live'
            : 'scheduled',
    };
    cache.set(cacheKey, { data: result, ts: Date.now() });
    return result;
  } catch {
    return cached?.data ?? null;
  }
}

module.exports = { getFixtureResult };
