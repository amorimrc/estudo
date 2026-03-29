async function pageHome() {
  const [matches, user] = await Promise.all([
    API.get('/api/matches'),
    Auth.isLoggedIn() ? API.get('/api/me') : Promise.resolve(null),
  ]);

  const now = new Date();
  const upcoming = matches
    .filter(m => m.status === 'scheduled' && new Date(m.match_date) > now)
    .slice(0, 5);

  const favoriteSection = user ? `
    <section style="margin-bottom:2rem">
      <h2 class="section-title">Seu time favorito</h2>
      ${user.favorite_team
        ? `<div class="card" style="display:flex;align-items:center;gap:1rem">
             <span style="font-size:2.5rem">${flagEmoji(user.favorite_team)}</span>
             <div>
               <strong>${teamName(user.favorite_team)}</strong>
               <p style="color:#888;font-size:.85rem">Pontos acumulados: <strong>${user.total_points}</strong></p>
             </div>
             <a href="/time/${user.favorite_team}" data-link style="margin-left:auto;color:var(--blue)">Ver jogos →</a>
           </div>`
        : `<div class="card" style="text-align:center;padding:1.5rem">
             <p style="margin-bottom:1rem;color:#888">Você ainda não escolheu um time favorito.</p>
             <button onclick="openTeamPicker()" style="background:var(--green);color:#fff;padding:.5rem 1.25rem;border-radius:20px;font-weight:600">Escolher time</button>
           </div>`
      }
    </section>
  ` : '';

  return `
    <div class="hero">
      <h1>🏆 Copa do Mundo 2026</h1>
      <p>EUA • México • Canadá &nbsp;|&nbsp; 11 de junho – 19 de julho</p>
    </div>

    ${favoriteSection}

    <section>
      <h2 class="section-title">Próximos jogos</h2>
      <div class="matches-grid">
        ${upcoming.map(matchCard).join('') || '<p style="color:#888">Nenhum jogo próximo.</p>'}
      </div>
      <div style="text-align:center;margin-top:1.25rem">
        <a href="/jogos" data-link style="color:var(--blue);font-weight:600">Ver calendário completo →</a>
      </div>
    </section>

    <div id="teamPickerModal" style="display:none"></div>
  `;
}

function openTeamPicker() {
  const teams = [
    'BRA','ARG','FRA','ENG','GER','ESP','POR','NED',
    'ITA','URU','COL','USA','MEX','CAN','BEL','CRO',
    'DEN','SUI','SEN','MAR','NGA','CIV','EGY','CAM',
    'ANG','QAT','SAU','KOR','JAP','AUS','CHI','ECU',
    'PAN','SVK','SRB','AUT','NZL','ALG',
  ];
  const modal = document.getElementById('teamPickerModal');
  modal.style.display = 'block';
  modal.innerHTML = `
    <div style="position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:200;display:flex;align-items:center;justify-content:center">
      <div style="background:#fff;border-radius:12px;padding:2rem;max-width:480px;width:90%;max-height:80vh;overflow-y:auto">
        <h3 style="margin-bottom:1rem">Escolha seu time</h3>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:.5rem">
          ${teams.map(t => `
            <button onclick="pickTeam('${t}')" style="padding:.5rem;border-radius:8px;border:2px solid #e0e0e0;background:#fff;display:flex;flex-direction:column;align-items:center;gap:.25rem;font-size:.8rem;cursor:pointer">
              <span style="font-size:1.5rem">${flagEmoji(t)}</span>
              ${t}
            </button>
          `).join('')}
        </div>
        <button onclick="document.getElementById('teamPickerModal').style.display='none'" style="margin-top:1rem;width:100%;padding:.5rem;background:#f0f0f0;border-radius:8px">Cancelar</button>
      </div>
    </div>
  `;
}

async function pickTeam(code) {
  await API.put('/api/me/favorite-team', { team_code: code });
  Router.navigate('/');
}
