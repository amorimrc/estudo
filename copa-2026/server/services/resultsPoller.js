const { getDb } = require('../db/schema');
const { getFixtureResult } = require('./footballApi');
const { processMatchPoints } = require('./scoring');

async function pollResults() {
  const db = getDb();
  const now = new Date();
  const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);

  // Jogos que podem estar ao vivo ou recém-encerrados
  const candidates = db.prepare(`
    SELECT * FROM matches
    WHERE status != 'finished'
      AND external_match_id IS NOT NULL
      AND match_date <= ?
      AND match_date >= ?
  `).all(now.toISOString(), threeHoursAgo.toISOString());

  if (candidates.length === 0) return;

  console.log(`[poller] Verificando ${candidates.length} jogo(s)...`);

  for (const match of candidates) {
    try {
      const result = await getFixtureResult(match.external_match_id);
      if (!result) continue;

      if (result.status === match.status &&
          result.home_score === match.home_score &&
          result.away_score === match.away_score) continue;

      db.prepare(`
        UPDATE matches SET status = ?, home_score = ?, away_score = ? WHERE id = ?
      `).run(result.status, result.home_score, result.away_score, match.id);

      console.log(`[poller] Jogo ${match.id} atualizado: ${result.status} ${result.home_score}-${result.away_score}`);

      if (result.status === 'finished' && match.status !== 'finished') {
        processMatchPoints(match.id);
        console.log(`[poller] Pontos calculados para jogo ${match.id}`);
      }
    } catch (err) {
      console.error(`[poller] Erro no jogo ${match.id}:`, err.message);
    }
  }
}

function startPoller(intervalMs = 5 * 60 * 1000) {
  pollResults();
  setInterval(pollResults, intervalMs);
  console.log(`[poller] Iniciado (intervalo: ${intervalMs / 1000}s)`);
}

module.exports = { startPoller, pollResults };
