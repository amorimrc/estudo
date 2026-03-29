async function pageJogos() {
  const matches = await API.get('/api/matches');

  const phases = ['group', 'round16', 'quarter', 'semi', 'final'];
  const phaseLabels = { group: 'Fase de Grupos', round16: 'Oitavas', quarter: 'Quartas', semi: 'Semifinal', final: 'Final' };
  const groups = [...new Set(matches.filter(m => m.phase === 'group').map(m => m.group_name))].sort();

  return `
    <h1 class="section-title" style="margin-bottom:1.5rem">Calendário</h1>

    <div class="filters" id="phaseFilters">
      <button class="filter-btn active" data-phase="all">Todos</button>
      ${phases.filter(p => matches.some(m => m.phase === p)).map(p =>
        `<button class="filter-btn" data-phase="${p}">${phaseLabels[p]}</button>`
      ).join('')}
      ${groups.map(g => `<button class="filter-btn" data-group="${g}">Grupo ${g}</button>`).join('')}
    </div>

    <div class="matches-grid" id="matchesList">
      ${matches.map(matchCard).join('')}
    </div>
  `;
}

function bindJogosFilters() {
  document.getElementById('phaseFilters')?.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;

    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const phase = btn.dataset.phase;
    const group = btn.dataset.group;

    document.querySelectorAll('#matchesList .match-card').forEach(card => {
      const show = phase === 'all'
        || (phase && card.dataset.phase === phase)
        || (group && card.dataset.group === group);
      card.style.display = show ? '' : 'none';
    });
  });
}
