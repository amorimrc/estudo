const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { getMatchById, getPredictionsByUser, upsertPrediction } = require('../db/queries');

const router = express.Router();

router.get('/', requireAuth, (req, res) => {
  res.json(getPredictionsByUser(req.user.id));
});

router.post('/', requireAuth, (req, res) => {
  const { match_id, home_score, away_score } = req.body;

  if (match_id == null || home_score == null || away_score == null) {
    return res.status(400).json({ error: 'match_id, home_score e away_score são obrigatórios' });
  }

  const match = getMatchById(Number(match_id));
  if (!match) return res.status(404).json({ error: 'Jogo não encontrado' });

  if (new Date() >= new Date(match.match_date)) {
    return res.status(403).json({ error: 'Prazo para palpite encerrado' });
  }

  upsertPrediction(req.user.id, match.id, Number(home_score), Number(away_score));
  res.json({ ok: true });
});

module.exports = router;
