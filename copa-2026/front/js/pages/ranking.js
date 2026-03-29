async function pageRanking() {
  if (!Auth.isLoggedIn()) {
    return `
      <div class="login-prompt">
        <h2>Faça login para ver seu ranking</h2>
        <p>Entre com sua conta Google para acompanhar seus pontos.</p>
        <a href="/auth/google" class="btn-google">Entrar com Google</a>
      </div>
    `;
  }

  const data = await API.get('/api/me/ranking');
  const { total_points, history } = data;

  const acertos = history.filter(h => h.points_earned > 0).length;
  const exatos  = history.filter(h => h.points_earned === 3).length;

  return `
    <h1 class="section-title" style="margin-bottom:1.5rem">Meu Ranking</h1>

    <div class="ranking-summary">
      <div class="ranking-summary__pts">${total_points}</div>
      <div>pontos acumulados</div>
      <div style="margin-top:.75rem;font-size:.9rem;opacity:.85">
        ${acertos} acertos de ${history.length} jogos finalizados
        ${exatos > 0 ? `· ${exatos} placares exatos 🎯` : ''}
      </div>
    </div>

    ${history.length === 0
      ? '<p style="text-align:center;color:#888;padding:2rem">Nenhum jogo finalizado ainda.</p>'
      : `
        <table class="ranking-table">
          <thead>
            <tr>
              <th>Jogo</th>
              <th>Resultado</th>
              <th>Seu palpite</th>
              <th>Pontos</th>
            </tr>
          </thead>
          <tbody>
            ${history.map(h => `
              <tr>
                <td>${flagEmoji(h.home_team)} ${h.home_team} x ${h.away_team} ${flagEmoji(h.away_team)}</td>
                <td>${h.result}</td>
                <td>${h.predicted}</td>
                <td><span class="pts-badge pts-${h.points_earned}">${h.points_earned}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `
    }
  `;
}
