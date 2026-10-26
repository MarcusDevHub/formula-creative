# Formula — contrato da API (front ↔ back-end)

Este documento diz **o que o front-end chama e o que espera receber**.
O back-end pode ser feito na tecnologia que o grupo quiser, desde que respeite estas rotas e formatos.

- Tudo em JSON. Datas em `AAAA-MM-DD`. Preços em número (`9.9`, não `"R$ 9,90"`).
- Rotas protegidas recebem o cabeçalho `Authorization: Bearer <token>`.
- Em caso de erro, responder com status 4xx/5xx e `{ "message": "texto para mostrar na tela" }`.
- No front, todas as chamadas estão em `src/api/api.js`. O mock em `src/api/mock.js` mostra exatamente o formato esperado, com dados de exemplo.

---

## Modelos de dados

### Campaign
```json
{
  "id": "c1",
  "name": "Inverno sem pressa",
  "message": "O que o marketing quer comunicar",
  "season": "inverno",
  "productIds": ["p1", "p2"],
  "audiences": ["a25", "s60", "fam"],
  "channels": ["feed", "sto", "ban", "wpp", "pdv"],
  "period": "01/06 – 31/07",
  "promoPrice": 9.9,
  "status": "em_revisao",
  "chosenIdea": { "id": "i1", "title": "…", "altTitle": "…", "support": "…" },
  "createdAt": "2026-10-15",
  "totals": { "all": 30, "ok": 24, "review": 4, "blocked": 2 }
}
```
- `season`: `verao` | `outono` | `inverno` | `primavera`
- `audiences`: `a25` (25–44) | `s60` (60+) | `fam` (famílias) | `j18` (18–24)
- `channels`: `feed` | `sto` (stories) | `ban` (banner do site) | `wpp` (WhatsApp) | `pdv` (cartaz na loja) | `tv` (TV da loja)
- `status`: `rascunho` → `ideias` → `estudio` → `em_revisao` → `publicada`
- `totals` é calculado pelo back-end a partir das peças.

### Product
```json
{ "id": "p1", "name": "Paracetamol 750 mg", "category": "isento_prescricao", "price": 9.9, "imageUrl": "https://…" }
```
`category`: `isento_prescricao` | `dermocosmetico` | `generico` | `prescricao`.
A categoria define quais regras valem (ex.: `prescricao` não pode ser anunciado).

### Idea
```json
{ "id": "i1", "title": "O inverno pede cuidado, não pressa.", "altTitle": "Cuidado de inverno, perto de você.", "support": "Frase de apoio", "color": "linear-gradient(…)" }
```
`color` é opcional (só visual).

### ImageVersion (resultado do Gemini)
```json
{ "id": "v_1", "imageUrl": "https://…/imagem.png", "background": "linear-gradient(…)" }
```
`imageUrl` é a imagem gerada. `background` é opcional (usado quando ainda não há imagem).

### Piece
```json
{
  "id": "c1-s60-sto-2",
  "campaignId": "c1",
  "campaignName": "Inverno sem pressa",
  "audience": "s60",
  "format": "sto",
  "version": 2,
  "title": "Acaba com a gripe em 24h.",
  "subtitle": "Frase de apoio",
  "productName": "Paracetamol 750 mg",
  "price": 9.9,
  "imageUrl": null,
  "color": "linear-gradient(…)",
  "warning": "SE PERSISTIREM OS SINTOMAS, O MÉDICO DEVERÁ SER CONSULTADO.",
  "status": "blocked",
  "checks": [{ "id": "k1", "label": "Embalagem igual à foto oficial", "ok": true }],
  "issues": [{ "title": "Promete mais do que a bula permite", "detail": "…", "source": "Lei 9.294/96" }],
  "suggestion": { "title": "Alívio da febre para atravessar o inverno.", "addsWarning": true },
  "reviewReason": null,
  "suggestedRule": null
}
```
- `status`: `ok` (liberada) | `review` (precisa de humano) | `blocked` (bloqueada) | `rejected` (reprovada por humano)
- `warning`: `null` quando o aviso obrigatório está faltando.
- `issues` + `suggestion`: preenchidos quando `blocked`.
- `reviewReason` + `suggestedRule` (`{ text, category }`): preenchidos quando `review`.

### Rule
```json
{ "id": "r1", "text": "Não prometer mais do que a bula diz", "source": "Lei 9.294/96", "category": "lei", "isNew": false }
```
`category`: `lei` | `marca` | `preco` | `consumidor`.

### Brand
```json
{
  "colors": [{ "name": "Azul", "hex": "#1F45FF" }],
  "fonts": [{ "name": "Sora", "use": "títulos" }],
  "voice": { "use": ["acolhedor"], "avoid": ["cura", "acaba com"] }
}
```

---

## Rotas

| Tela | Método e rota | Envia | Recebe |
|---|---|---|---|
| Login | `POST /auth/login` | `{ email, password }` | `{ token, user: { id, name, email } }` |
| Login (SSO) | `GET /auth/sso` | — | Redireciona para o login da empresa e volta com o token |
| Briefing | `GET /catalog/products?q=texto` | — | `Product[]` |
| Início | `GET /campaigns` | — | `Campaign[]` (com `totals`) |
| Várias | `GET /campaigns/:id` | — | `Campaign` |
| Briefing | `POST /campaigns` | `{ name, message, season, productIds, audiences, channels, period, promoPrice }` | `Campaign` (status `ideias`) |
| Ideia | `POST /campaigns/:id/ideas` | — | `Idea[]` (3 ideias geradas pela IA) |
| Ideia | `POST /campaigns/:id/ideas/:ideaId/choose` | — | `Campaign` (status `estudio`) |
| Estúdio | `POST /campaigns/:id/studio/images` | `{ prompt, productId, format }` | `ImageVersion[]` (**chama o Gemini**) |
| Estúdio | `POST /campaigns/:id/studio/check` | `{ title, subtitle, versionId }` | `{ checks: Check[], issues: [{ title, detail, fix: { field, value } \| null }] }` |
| Estúdio | `POST /campaigns/:id/studio/approve` | `{ versionId, title, subtitle }` | `Campaign` (status `em_revisao`) — **gera todas as peças** (públicos × formatos × 2 versões) e roda a conferência em cada uma |
| Criações | `GET /campaigns/:id/pieces?status=&audience=&format=` | — | `Piece[]` (filtros opcionais) |
| Criações | `POST /campaigns/:id/publish` | — | `{ published: número }` |
| Peça bloqueada | `GET /pieces/:id` | — | `Piece` |
| Peça bloqueada | `POST /pieces/:id/apply-fix` | — | `Piece` (corrigida e conferida de novo) |
| Aprovações | `GET /approvals` | — | `Piece[]` com `status = review` |
| Aprovações | `POST /pieces/:id/approve` | — | `Piece` (status `ok`) |
| Aprovações | `POST /pieces/:id/reject` | `{ reason, createRule: boolean }` | `{ piece: Piece, rule: Rule \| null }` — se `createRule`, cria a regra nova |
| Regras | `GET /rules` | — | `Rule[]` |
| Regras | `POST /rules` | `{ text, source, category }` | `Rule` |
| Regras | `GET /brand` | — | `Brand` |

---

## Onde entra cada IA (sugestão para o back-end)

- **Ideias** (`POST /campaigns/:id/ideas`): modelo de texto (Gemini) recebe o briefing + tom de voz da marca e devolve 3 ideias.
- **Imagens** (`POST /campaigns/:id/studio/images`): Gemini (geração de imagem) recebe o `prompt` + foto oficial do produto. Pedir **imagem sem texto**: título, preço e aviso são colocados por cima no front/template.
- **Conferência** (`/studio/check` e ao gerar as peças): parte por regras fixas (aviso obrigatório, palavras proibidas, preço ≤ teto CMED, categoria do produto) e parte por IA (a promessa bate com a bula?). Cada problema deve citar a regra (`source`).
- **Peças** (`/studio/approve`): a partir da peça principal aprovada, o back-end monta os outros formatos por template, sem chamar a IA de novo para cada um.
