const { getDb } = require('./schema');

// Users
function findOrCreateUser({ google_id, name, avatar_url }) {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM users WHERE google_id = ?').get(google_id);
  if (existing) return existing;
  const result = db.prepare(
    'INSERT INTO users (google_id, name, avatar_url) VALUES (?, ?, ?)'
  ).run(google_id, name, avatar_url);
  return db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
}

function getUserById(id) {
  return getDb().prepare('SELECT * FROM users WHERE id = ?').get(id);
}

function getTotalPoints(userId) {
  const row = getDb()
    .prepare('SELECT COALESCE(SUM(points_earned), 0) as total FROM predictions WHERE user_id = ?')
    .get(userId);
  return row.total;
}

// Favorite teams
function getFavoriteTeam(userId) {
  return getDb().prepare('SELECT team_code FROM favorite_teams WHERE user_id = ?').get(userId);
}

function setFavoriteTeam(userId, teamCode) {
  const db = getDb();
  db.prepare(`
    INSERT INTO favorite_teams (user_id, team_code) VALUES (?, ?)
    ON CONFLICT(user_id) DO UPDATE SET team_code = excluded.team_code
  `).run(userId, teamCode);
}

// Matches
function getAllMatches() {
  return getDb().prepare('SELECT * FROM matches ORDER BY match_date ASC').all();
}

function getMatchById(id) {
  return getDb().prepare('SELECT * FROM matches WHERE id = ?').get(id);
}

function getMatchesByTeam(teamCode) {
  return getDb()
    .prepare('SELECT * FROM matches WHERE home_team = ? OR away_team = ? ORDER BY match_date ASC')
    .all(teamCode, teamCode);
}

function upsertMatch({ id, phase, group_name, home_team, away_team, match_date, home_score, away_score, status }) {
  const db = getDb();
  if (id) {
    db.prepare(`
      UPDATE matches SET phase=?, group_name=?, home_team=?, away_team=?, match_date=?,
      home_score=?, away_score=?, status=? WHERE id=?
    `).run(phase, group_name, home_team, away_team, match_date, home_score, away_score, status, id);
  } else {
    db.prepare(`
      INSERT INTO matches (phase, group_name, home_team, away_team, match_date, home_score, away_score, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(phase, group_name, home_team, away_team, match_date, home_score, away_score, status);
  }
}

function getFinishedMatchesWithoutPoints() {
  return getDb().prepare(`
    SELECT m.* FROM matches m
    INNER JOIN predictions p ON p.match_id = m.id
    WHERE m.status = 'finished' AND p.points_earned = 0
  `).all();
}

// Predictions
function getPredictionsByUser(userId) {
  return getDb().prepare(`
    SELECT p.*, m.home_team, m.away_team, m.match_date, m.phase,
           m.home_score as match_home_score, m.away_score as match_away_score, m.status
    FROM predictions p
    INNER JOIN matches m ON m.id = p.match_id
    WHERE p.user_id = ?
    ORDER BY m.match_date ASC
  `).all(userId);
}

function upsertPrediction(userId, matchId, homeScore, awayScore) {
  getDb().prepare(`
    INSERT INTO predictions (user_id, match_id, home_score, away_score)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(user_id, match_id) DO UPDATE SET home_score = excluded.home_score, away_score = excluded.away_score
  `).run(userId, matchId, homeScore, awayScore);
}

function getPredictionsByMatch(matchId) {
  return getDb().prepare('SELECT * FROM predictions WHERE match_id = ?').all(matchId);
}

function updatePointsEarned(predictionId, points) {
  getDb().prepare('UPDATE predictions SET points_earned = ? WHERE id = ?').run(points, predictionId);
}

module.exports = {
  findOrCreateUser,
  getUserById,
  getTotalPoints,
  getFavoriteTeam,
  setFavoriteTeam,
  getAllMatches,
  getMatchById,
  getMatchesByTeam,
  upsertMatch,
  getFinishedMatchesWithoutPoints,
  getPredictionsByUser,
  upsertPrediction,
  getPredictionsByMatch,
  updatePointsEarned,
};
