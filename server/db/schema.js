const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'copa2026.db');

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initSchema();
  }
  return db;
}

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      google_id  TEXT UNIQUE NOT NULL,
      name       TEXT NOT NULL,
      avatar_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS matches (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      phase       TEXT NOT NULL,
      group_name  TEXT,
      home_team   TEXT NOT NULL,
      away_team   TEXT NOT NULL,
      match_date  DATETIME NOT NULL,
      home_score  INTEGER,
      away_score  INTEGER,
      status      TEXT DEFAULT 'scheduled'
    );

    CREATE TABLE IF NOT EXISTS predictions (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id      INTEGER NOT NULL REFERENCES users(id),
      match_id     INTEGER NOT NULL REFERENCES matches(id),
      home_score   INTEGER NOT NULL,
      away_score   INTEGER NOT NULL,
      points_earned INTEGER DEFAULT 0,
      created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, match_id)
    );

    CREATE TABLE IF NOT EXISTS favorite_teams (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id   INTEGER NOT NULL REFERENCES users(id),
      team_code TEXT NOT NULL,
      UNIQUE(user_id)
    );
  `);
}

module.exports = { getDb };
