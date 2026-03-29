const express = require('express');
const { getAllMatches, getMatchById } = require('../db/queries');

const router = express.Router();

router.get('/', (_req, res) => {
  res.json(getAllMatches());
});

router.get('/:id', (req, res) => {
  const match = getMatchById(Number(req.params.id));
  if (!match) return res.status(404).json({ error: 'Jogo não encontrado' });
  res.json(match);
});

module.exports = router;
