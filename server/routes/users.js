const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { getUserById, getTotalPoints, getFavoriteTeam, setFavoriteTeam, getPredictionsByUser } = require('../db/queries');

const router = express.Router();

router.get('/me', requireAuth, (req, res) => {
  const user = getUserById(req.user.id);
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

  const favorite = getFavoriteTeam(req.user.id);
  const total_points = getTotalPoints(req.user.id);

  res.json({
    id: user.id,
    name: user.name,
    avatar_url: user.avatar_url,
    total_points,
    favorite_team: favorite?.team_code ?? null,
  });
});

router.put('/me/favorite-team', requireAuth, (req, res) => {
  const { team_code } = req.body;
  if (!team_code) return res.status(400).json({ error: 'team_code é obrigatório' });
  setFavoriteTeam(req.user.id, team_code.toUpperCase());
  res.json({ ok: true });
});

router.get('/me/ranking', requireAuth, (req, res) => {
  const predictions = getPredictionsByUser(req.user.id);
  const history = predictions
    .filter(p => p.status === 'finished')
    .map(p => ({
      match_id: p.match_id,
      home_team: p.home_team,
      away_team: p.away_team,
      match_date: p.match_date,
      predicted: `${p.home_score}x${p.away_score}`,
      result: `${p.match_home_score}x${p.match_away_score}`,
      points_earned: p.points_earned,
    }));

  const total = history.reduce((sum, h) => sum + h.points_earned, 0);
  res.json({ total_points: total, history });
});

module.exports = router;
