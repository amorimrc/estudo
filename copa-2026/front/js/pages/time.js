async function pageTime({ code }) {
  if (!code) return '<p>Time não encontrado.</p>';

  const matches = await API.get('/api/matches');
  const teamMatches = matches.filter(m => m.home_team === code || m.away_team === code);

  if (teamMatches.length === 0) {
    return `<p style="text-align:center;padding:2rem;color:#888">Nenhum jogo encontrado para ${code}.</p>`;
  }

  const wins    = teamMatches.filter(m => m.status === 'finished' && didWin(m, code)).length;
  const draws   = teamMatches.filter(m => m.status === 'finished' && isDraw(m)).length;
  const losses  = teamMatches.filter(m => m.status === 'finished' && didLose(m, code)).length;
  const played  = wins + draws + losses;

  return `
    <div class="team-header">
      <span class="team-flag">${flagEmoji(code)}</span>
      <div>
        <h1 style="font-size:1.5rem">${teamName(code)}</h1>
        ${played > 0
          ? `<p style="color:#888;font-size:.9rem">${played}J · ${wins}V · ${draws}E · ${losses}D</p>`
          : '<p style="color:#888;font-size:.9rem">Ainda não jogou</p>'
        }
      </div>
      <a href="/jogos" data-link style="margin-left:auto;color:var(--blue);font-size:.9rem">← Todos os jogos</a>
    </div>

    <h2 class="section-title" style="margin-bottom:1rem">Jogos</h2>
    <div class="matches-grid">
      ${teamMatches.map(matchCard).join('')}
    </div>
  `;
}

function didWin(match, code) {
  if (match.home_team === code) return match.home_score > match.away_score;
  return match.away_score > match.home_score;
}

function isDraw(match) {
  return match.home_score === match.away_score;
}

function didLose(match, code) {
  return !didWin(match, code) && !isDraw(match);
}
