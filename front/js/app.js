// ── Utilitários ─────────────────────────────────────────
const FLAGS = {
  BRA:'🇧🇷', ARG:'🇦🇷', FRA:'🇫🇷', ENG:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', GER:'🇩🇪', ESP:'🇪🇸', POR:'🇵🇹',
  NED:'🇳🇱', ITA:'🇮🇹', URU:'🇺🇾', COL:'🇨🇴', USA:'🇺🇸', MEX:'🇲🇽', CAN:'🇨🇦',
  BEL:'🇧🇪', CRO:'🇭🇷', DEN:'🇩🇰', SUI:'🇨🇭', SEN:'🇸🇳', MAR:'🇲🇦', NGA:'🇳🇬',
  CIV:'🇨🇮', EGY:'🇪🇬', CAM:'🇨🇲', ANG:'🇦🇴', QAT:'🇶🇦', SAU:'🇸🇦', KOR:'🇰🇷',
  JAP:'🇯🇵', AUS:'🇦🇺', CHI:'🇨🇱', ECU:'🇪🇨', PAN:'🇵🇦', SVK:'🇸🇰', SRB:'🇷🇸',
  AUT:'🇦🇹', NZL:'🇳🇿', ALG:'🇩🇿',
};

const TEAM_NAMES = {
  BRA:'Brasil', ARG:'Argentina', FRA:'França', ENG:'Inglaterra', GER:'Alemanha',
  ESP:'Espanha', POR:'Portugal', NED:'Holanda', ITA:'Itália', URU:'Uruguai',
  COL:'Colômbia', USA:'EUA', MEX:'México', CAN:'Canadá', BEL:'Bélgica',
  CRO:'Croácia', DEN:'Dinamarca', SUI:'Suíça', SEN:'Senegal', MAR:'Marrocos',
  NGA:'Nigéria', CIV:'Costa do Marfim', EGY:'Egito', CAM:'Camarões', ANG:'Angola',
  QAT:'Catar', SAU:'Arábia Saudita', KOR:'Coreia do Sul', JAP:'Japão', AUS:'Austrália',
  CHI:'Chile', ECU:'Equador', PAN:'Panamá', SVK:'Eslováquia', SRB:'Sérvia',
  AUT:'Áustria', NZL:'Nova Zelândia', ALG:'Argélia',
};

function flagEmoji(code) { return FLAGS[code] ?? '🏳️'; }
function teamName(code)  { return TEAM_NAMES[code] ?? code; }

function formatDate(iso) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  });
}

const PHASE_LABELS = { group:'Grupo', round16:'Oitavas', quarter:'Quartas', semi:'Semi', final:'Final' };
const STATUS_LABELS = { scheduled:'', live:'AO VIVO', finished:'Encerrado' };

function matchCard(m) {
  const score = m.status !== 'scheduled'
    ? `<div class="match-card__score">${m.home_score ?? '-'} x ${m.away_score ?? '-'}</div>`
    : `<div class="match-card__date">${formatDate(m.match_date)}</div>`;

  const badge = m.status === 'live'
    ? '<span class="badge badge--live">AO VIVO</span>'
    : m.status === 'finished'
    ? '<span class="badge badge--finished">Encerrado</span>'
    : m.group_name
    ? `<span class="badge badge--group">Grupo ${m.group_name}</span>`
    : `<span class="badge badge--${m.phase}">${PHASE_LABELS[m.phase] ?? m.phase}</span>`;

  return `
    <div class="match-card" data-phase="${m.phase}" data-group="${m.group_name ?? ''}">
      <div class="match-card__team">${flagEmoji(m.home_team)} ${m.home_team}</div>
      <div class="match-card__center">${score}${badge}</div>
      <div class="match-card__team match-card__team--away">${m.away_team} ${flagEmoji(m.away_team)}</div>
    </div>
  `;
}

// ── Bind de eventos pós-render ───────────────────────────
function bindEvents() {
  if (location.pathname === '/jogos') bindJogosFilters();
}

// ── Inicialização ────────────────────────────────────────
Router.add('/', pageHome);
Router.add('/jogos', pageJogos);
Router.add('/palpites', pagePalpites);
Router.add('/ranking', pageRanking);
Router.add('/time/:code', pageTime);

Router.init();
renderNavUser();
Router.navigate(location.pathname, false);
