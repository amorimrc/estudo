# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Site interativo da Copa do Mundo 2026. Permite login com Google, escolha de time favorito, palpites de placar com sistema de pontuação e ranking pessoal.

Design spec completo: [`docs/superpowers/specs/2026-03-26-copa-mundo-2026-design.md`](docs/superpowers/specs/2026-03-26-copa-mundo-2026-design.md)

## Stack

- **Front-end:** HTML, CSS e JavaScript puro (sem frameworks)
- **Back-end:** Node.js + Express
- **Banco de dados:** SQLite
- **Auth:** OAuth 2.0 com Google via Passport.js + JWT
- **Dados dos jogos:** JSON estático para calendário + API-Football (plano gratuito) para resultados, cacheados por 5 minutos

## Arquitetura

```
front/          → arquivos estáticos (HTML/CSS/JS)
server/
  routes/       → Express routes (auth, matches, predictions, users)
  db/           → SQLite schema e queries
  services/     → cache da API externa, cálculo de pontos
data/
  matches.json  → calendário completo da Copa 2026 (fonte estática)
```

O front-end usa a History API para roteamento client-side (sem recarregar página). O back-end serve os estáticos e expõe a REST API no mesmo processo Express.

## Comandos

```bash
npm install          # instalar dependências
npm run dev          # servidor com hot-reload (nodemon)
npm start            # produção
```

## Decisões de design

- **SQLite** — sem servidor de banco separado; banco fica em `server/db/copa2026.db`
- **JWT** — autenticação stateless; token enviado no header `Authorization: Bearer <token>`
- **Cache in-memory** — resultados da API-Football cacheados em memória no processo Express; reiniciar o servidor limpa o cache
- **Palpites bloqueados** — front desabilita inputs e back retorna `403` para palpites após o horário de início do jogo (`match_date`)
- **Pontuação calculada no back** — ao receber resultado final (`status = finished`), o servidor percorre todos os palpites daquele jogo e persiste `points_earned`

## Regras de pontuação

| Resultado | Pontos |
|-----------|--------|
| Placar exato | 3 |
| Vencedor + diferença de gols corretos | 2 |
| Apenas vencedor correto (inclui empate com placar diferente) | 1 |
| Errou | 0 |
