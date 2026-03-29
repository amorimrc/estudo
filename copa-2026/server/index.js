require('dotenv').config();
const express = require('express');
const passport = require('passport');
const path = require('path');

// Inicializa banco ao subir
require('./db/schema');

const app = express();
app.use(express.json());
app.use(passport.initialize());

// Rotas
app.use('/auth', require('./routes/auth'));
app.use('/api/matches', require('./routes/matches'));
app.use('/api/predictions', require('./routes/predictions'));
app.use('/api', require('./routes/users'));

// Serve estáticos
app.use(express.static(path.join(__dirname, '../front')));

// SPA fallback
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '../front/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  if (process.env.API_FOOTBALL_KEY) {
    require('./services/resultsPoller').startPoller();
  }
});
