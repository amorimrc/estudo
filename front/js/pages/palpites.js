async function pagePalpites() {
  if (!Auth.isLoggedIn()) {
    return `
      <div class="login-prompt">
        <h2>Faça login para palpitar</h2>
        <p>Entre com sua conta Google para registrar seus palpites e acumular pontos.</p>
        <a href="/auth/google" class="btn-google">
          <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"/><path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/></svg>
          Entrar com Google
        </a>
      </div>
    `;
  }

  const [matches, predictions] = await Promise.all([
    API.get('/api/matches'),
    API.get('/api/predictions'),
  ]);

  const predMap = {};
  predictions.forEach(p => { predMap[p.match_id] = p; });

  const now = new Date();
  const scheduledMatches = matches.filter(m => m.status === 'scheduled' || new Date(m.match_date) > now);
  const finishedMatches = matches.filter(m => m.status === 'finished' && predMap[m.id]);

  return `
    <h1 class="section-title" style="margin-bottom:1.5rem">Palpites</h1>

    ${scheduledMatches.length === 0 && finishedMatches.length === 0
      ? '<p style="color:#888;text-align:center;padding:2rem">Nenhum jogo disponível para palpitar.</p>'
      : ''
    }

    ${scheduledMatches.length > 0 ? `
      <h2 style="font-size:1rem;color:#555;margin-bottom:.75rem">Próximos jogos</h2>
      ${scheduledMatches.map(m => predictionCard(m, predMap[m.id], now)).join('')}
    ` : ''}

    ${finishedMatches.length > 0 ? `
      <h2 style="font-size:1rem;color:#555;margin:1.5rem 0 .75rem">Jogos encerrados</h2>
      ${finishedMatches.map(m => predictionResultCard(m, predMap[m.id])).join('')}
    ` : ''}
  `;
}

function predictionCard(match, existing, now) {
  const locked = new Date(match.match_date) <= now;
  const homeVal = existing ? existing.home_score : '';
  const awayVal = existing ? existing.away_score : '';
  const dateStr = formatDate(match.match_date);

  return `
    <div class="prediction-card" data-match-id="${match.id}">
      <div class="prediction-card__input-group">
        <span class="match-card__team">${flagEmoji(match.home_team)} ${match.home_team}</span>
        <input type="number" min="0" max="20" class="score-input" id="h_${match.id}"
          value="${homeVal}" placeholder="0" ${locked ? 'disabled' : ''} />
      </div>
      <div class="match-card__center">
        <span style="font-weight:700;color:#999">x</span>
        <div class="match-card__date">${dateStr}</div>
        ${locked ? '<span class="badge badge--finished">Encerrado</span>' : ''}
      </div>
      <div class="prediction-card__input-group prediction-card__input-group--right">
        <input type="number" min="0" max="20" class="score-input" id="a_${match.id}"
          value="${awayVal}" placeholder="0" ${locked ? 'disabled' : ''} />
        <span class="match-card__team">${match.away_team} ${flagEmoji(match.away_team)}</span>
      </div>
      ${!locked ? `<button class="save-btn" onclick="savePrediction(${match.id})">Salvar palpite</button>` : ''}
    </div>
  `;
}

function predictionResultCard(match, pred) {
  const pts = pred?.points_earned ?? 0;
  return `
    <div class="prediction-card" style="opacity:.8">
      <div class="match-card__team">${flagEmoji(match.home_team)} ${match.home_team}</div>
      <div class="match-card__center">
        <div class="match-card__score">${match.home_score} x ${match.away_score}</div>
        <div class="match-card__date">Palpite: ${pred?.home_score ?? '-'} x ${pred?.away_score ?? '-'}</div>
        <span class="pts-badge pts-${pts}">${pts} pt${pts !== 1 ? 's' : ''}</span>
      </div>
      <div class="match-card__team" style="justify-content:flex-end">${match.away_team} ${flagEmoji(match.away_team)}</div>
    </div>
  `;
}

async function savePrediction(matchId) {
  const home = document.getElementById(`h_${matchId}`)?.value;
  const away = document.getElementById(`a_${matchId}`)?.value;

  if (home === '' || away === '') {
    alert('Preencha os dois placares antes de salvar.');
    return;
  }

  const res = await API.post('/api/predictions', {
    match_id: matchId,
    home_score: Number(home),
    away_score: Number(away),
  });

  if (res?.ok) {
    const btn = document.querySelector(`[data-match-id="${matchId}"] .save-btn`);
    if (btn) { btn.textContent = '✓ Salvo!'; btn.disabled = true; }
  } else {
    alert(res?.error || 'Erro ao salvar palpite.');
  }
}
