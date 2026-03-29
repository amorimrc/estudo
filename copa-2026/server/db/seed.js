const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const { getDb } = require('./schema');
const matches = require('../../data/matches.json');

const db = getDb();

const existing = db.prepare('SELECT COUNT(*) as count FROM matches').get();
if (existing.count > 0) {
  console.log('Banco já populado. Nada a fazer.');
  process.exit(0);
}

const insert = db.prepare(`
  INSERT INTO matches (phase, group_name, home_team, away_team, match_date, status)
  VALUES (@phase, @group_name, @home_team, @away_team, @match_date, 'scheduled')
`);

const insertMany = db.transaction((rows) => {
  for (const row of rows) insert.run(row);
});

insertMany(matches);
console.log(`${matches.length} jogos inseridos com sucesso.`);
