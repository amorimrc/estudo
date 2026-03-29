# Design: Site Interativo da Copa do Mundo 2026

**Data:** 2026-03-26
**Status:** Aprovado

---

## Visão Geral

Site interativo da Copa do Mundo 2026 construído com HTML, CSS e JavaScript puro no front-end, e Node.js + Express no back-end. O usuário faz login com Google, escolhe um time favorito, faz palpites de placar para cada jogo e acumula pontos conforme acerta os resultados.

---

## Arquitetura

```
┌─────────────────┐       ┌──────────────────────┐
│  Front-end      │ HTTP  │  Back-end            │
│  HTML/CSS/JS    │◄─────►│  Node.js + Express   │
│  (estático)     │       │  SQLite              │
└─────────────────┘       └──────────┬───────────┘
                                     │ HTTP
                          ┌──────────▼───────────┐
                          │  API-Football         │
                          │  (plano gratuito)     │
                          └──────────────────────┘
```

- **Front-end:** arquivos estáticos servidos pelo Express (ou Netlify/Vercel)
- **Back-end:** Node.js + Express expondo REST API
- **Banco de dados:** SQLite (sem servidor separado)
- **Autenticação:** OAuth 2.0 com Google via Passport.js, sessão via JWT
- **Dados dos jogos:** calendário em JSON estático no back-end; resultados buscados da API-Football (plano gratuito, ~100 req/dia) e cacheados por 5 minutos

---

## Modelo de Dados

```sql
users
  id            INTEGER PRIMARY KEY
  google_id     TEXT UNIQUE NOT NULL
  name          TEXT NOT NULL
  avatar_url    TEXT
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP

matches
  id            INTEGER PRIMARY KEY
  phase         TEXT NOT NULL        -- group | round16 | quarter | semi | final
  group_name    TEXT                 -- A, B, C... (nulo em fases eliminatórias)
  home_team     TEXT NOT NULL
  away_team     TEXT NOT NULL
  match_date    DATETIME NOT NULL
  home_score    INTEGER              -- nulo até o jogo terminar
  away_score    INTEGER              -- nulo até o jogo terminar
  status        TEXT DEFAULT 'scheduled' -- scheduled | live | finished

predictions
  id            INTEGER PRIMARY KEY
  user_id       INTEGER NOT NULL REFERENCES users(id)
  match_id      INTEGER NOT NULL REFERENCES matches(id)
  home_score    INTEGER NOT NULL
  away_score    INTEGER NOT NULL
  points_earned INTEGER DEFAULT 0
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
  UNIQUE(user_id, match_id)

favorite_teams
  id            INTEGER PRIMARY KEY
  user_id       INTEGER NOT NULL REFERENCES users(id)
  team_code     TEXT NOT NULL        -- código ISO do país (ex: BRA, ARG)
  UNIQUE(user_id)
```

---

## Sistema de Pontuação

| Resultado | Pontos |
|-----------|--------|
| Placar exato | 3 |
| Vencedor correto + diferença de gols correta | 2 |
| Apenas vencedor correto (inclui empate com placar diferente) | 1 |
| Errou | 0 |

- Palpites só podem ser feitos antes do horário de início da partida
- Após o jogo terminar (`status = finished`), o back-end calcula e persiste `points_earned` para cada palpite relacionado

---

## Páginas

| Rota | Página | Conteúdo |
|------|--------|----------|
| `/` | Home | Banner Copa 2026, próximos jogos, time favorito do usuário |
| `/jogos` | Calendário | Lista de jogos por fase, filtro por grupo/fase |
| `/palpites` | Palpites | Jogos com inputs de placar, bloqueados após início |
| `/ranking` | Ranking | Pontuação total do usuário, histórico de acertos por jogo |
| `/time/:code` | Time | Jogos do time favorito, resultados, caminho no torneio |

**Navegação:** barra fixa no topo com logo, links das páginas e avatar Google. Login/logout no canto direito. Em mobile, a navbar vira menu hamburguer.

**Roteamento:** History API no lado do cliente (sem recarregar página).

---

## API REST

### Autenticação
```
GET  /auth/google           → redireciona para login Google
GET  /auth/google/callback  → callback OAuth, retorna JWT
POST /auth/logout           → encerra sessão
```

### Jogos
```
GET  /api/matches           → lista todos os jogos (com cache de 5min)
GET  /api/matches/:id       → detalhes de um jogo
```

### Palpites
```
GET  /api/predictions       → palpites do usuário autenticado
POST /api/predictions       → criar ou atualizar palpite (403 se jogo já iniciou)
```

### Usuário
```
GET  /api/me                → perfil + pontuação total
PUT  /api/me/favorite-team  → salvar time favorito
```

### Ranking
```
GET  /api/ranking           → histórico de pontos por jogo do usuário autenticado
```

Rotas protegidas exigem `Authorization: Bearer <token>` no header.

---

## Tratamento de Erros

| Cenário | Comportamento |
|---------|---------------|
| API externa indisponível | Usa cache existente; exibe aviso "resultados temporariamente indisponíveis" |
| JWT expirado | Redireciona automaticamente para login |
| Palpite após início do jogo | Input desabilitado no front; back retorna `403 Forbidden` |
| Falha de rede | Mensagem amigável com botão "Tentar novamente" |

---

## Responsividade

- **Mobile-first** com CSS Grid e Flexbox
- Navbar vira menu hamburguer em telas `< 768px`
- Tabela de jogos vira cards empilhados no mobile
- Inputs de palpite dimensionados para toque (mínimo 44px de altura)
- **Sem frameworks CSS** — HTML/CSS/JS puro conforme requisito do PRD
- Variáveis CSS para tema: verde (#009C3B), amarelo (#FFDF00), azul (#002776) — cores do Brasil/Copa

---

## Fora de Escopo (MVP)

- Bolão entre amigos (ranking múltiplos usuários)
- Notificações push
- Streaming ao vivo
- Histórico de edições de palpite
