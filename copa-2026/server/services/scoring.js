function calcPoints(predicted, actual) {
  if (predicted.home === actual.home && predicted.away === actual.away) return 3;

  const predictedDiff = predicted.home - predicted.away;
  const actualDiff = actual.home - actual.away;
  const predictedWinner = Math.sign(predictedDiff);
  const actualWinner = Math.sign(actualDiff);

  if (predictedWinner === actualWinner && predictedDiff === actualDiff) return 2;
  if (predictedWinner === actualWinner) return 1;
  return 0;
}

function processMatchPoints(matchId) {
  const { getMatchById, getPredictionsByMatch, updatePointsEarned } = require('../db/queries');
  const match = getMatchById(matchId);
  if (!match || match.status !== 'finished') return;

  const predictions = getPredictionsByMatch(matchId);
  for (const p of predictions) {
    const points = calcPoints(
      { home: p.home_score, away: p.away_score },
      { home: match.home_score, away: match.away_score }
    );
    updatePointsEarned(p.id, points);
  }
}

module.exports = { calcPoints, processMatchPoints };
