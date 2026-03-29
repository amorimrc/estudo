const express = require('express');
const { getAllMatches, getMatchById, upsertMatch } = require('../db/queries');
const { processMatchPoints } = require('../services/scoring');

const router = express.Router();

router.get('/', (_req, res) => {
  res.json(getAllMatches());
});

router.get('/:id', (req, res) => {
  const match = getMatchById(Number(req.params.id));
  if (!match) return res.status(404).json({ error: 'Jogo não encontrado' });
  res.json(match);
});

// Endpoint admin para atualizar resultado de um jogo
router.put('/:id/result', (req, res) => {
  const adminKey = req.headers['x-admin-key'];
  if (!adminKey || adminKey !== process.env.ADMIN_KEY) {
    return res.status(403).json({ error: 'Acesso negado' });
  }

  const match = getMatchById(Number(req.params.id));
  if (!match) return res.status(404).json({ error: 'Jogo não encontrado' });

  const { home_score, away_score, status, external_match_id, home_team, away_team } = req.body;

  upsertMatch({
    ...match,
    home_score:         home_score        ?? match.home_score,
    away_score:         away_score        ?? match.away_score,
    status:             status            ?? match.status,
    external_match_id:  external_match_id ?? match.external_match_id,
    home_team:          home_team         ?? match.home_team,
    away_team:          away_team         ?? match.away_team,
  });

  if (status === 'finished' && match.status !== 'finished') {
    processMatchPoints(match.id);
  }

  res.json({ ok: true });
});

module.exports = router;
