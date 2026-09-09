# Ponte academy → scoreboard (fotos dos jogadores)

Este projecto (**newpadel.pt**) controla as TVs / totems. A **Padel Academy** é dona do torneio e das fotos.

Documentação canónica na academy:

`../PADEL ACADEMY/padel-academy/docs/SCOREBOARD_BRIDGE.md`  
(ou no GitHub do padel-academy: `docs/SCOREBOARD_BRIDGE.md`)

## Estado actual neste repo

| Peça | Estado |
|------|--------|
| BD scoreboard `games.tournament_match_id` | Já usada (`totem.js` faz select do campo) |
| Fotos reais da academy | **Sim** — `totem.js` pede `avatarUrl` via proxy local |
| Proxy server-side para a API academy | **Sim** — `GET /api/scoreboard/match-context` (secret só no Laravel) |
| Fallback | `DEMO_PHOTOS` → ui-avatars se não houver matchId / API falhar |

## Contrato

1. Cada `games` no scoreboard pode ter `tournament_match_id` = UUID de `tournament_matches` na academy.
2. Se existir, pedir contexto à academy:

```http
GET {ACADEMY_BASE_URL}/api/scoreboard/match-context?matchId={tournament_match_id}
Authorization: Bearer {SCOREBOARD_BRIDGE_SECRET}
```

3. Resposta inclui `players[0..3]` com `name` + `avatarUrl` (ordem = `player1`…`player4`),
   mais `categoryName` / `groupLabel` (ou `groupCode`) para o rodapé do totem.
4. Se não houver `tournament_match_id` ou a API falhar → manter nomes do scoreboard e fallback de foto actual; categoria/grupo ficam vazios (não inventar M2/Grupo A).

Fonte das fotos na academy: `players.avatar_url` (bucket `tournament-hub`). **Não** há colunas de avatar na BD scoreboard.

## Env sugerido (newpadel.pt)

```env
ACADEMY_BASE_URL=https://padel-core-app.vercel.app
SCOREBOARD_BRIDGE_SECRET=...mesmo valor que na academy...
```

O secret **só** no servidor Laravel (proxy). O JS do totem deve chamar uma rota local (ex. `/api/scoreboard/match-context`), nunca a academy com o Bearer no cliente.

## Onde tocar no código

- Totem / fotos: `public/js/scoreboard/totem.js` → `photoFor()` / `DEMO_PHOTOS`
- Select do jogo: já inclui `tournament_match_id`
- Video LED: `routes/web.php` → `/scoreboard/videoled`

## Verificação (academy)

```bash
# no repo padel-academy
npx tsx scripts/_verify-scoreboard-bridge-avatars.ts --day=2026-09-10
```

Confirma jogos linkados e `avatarUrl` a sair da API.
