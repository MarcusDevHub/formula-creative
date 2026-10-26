# Formula — front-end

App da equipe de marketing para criar campanhas com IA e aprovar peças com segurança.
Feito com **React + Vite** e **React Router**.

## Como rodar

```bash
npm install
npm run dev
```

Abra o endereço que aparecer no terminal (normalmente http://localhost:5173).

Sem back-end, o app funciona com **dados de exemplo** (modo mock). Qualquer e-mail e senha entram no login.

## Ligar no back-end

1. Copie `.env.example` para `.env`.
2. Preencha `VITE_API_URL` com o endereço da API (ex.: `http://localhost:3000/api`).
3. Rode `npm run dev` de novo.

As rotas que o back-end precisa ter estão no **[API.md](./API.md)**.

## Estrutura

```
src/
  api/
    api.js        ← único lugar que fala com o back-end
    mock.js       ← back-end falso em memória (dados de exemplo)
  components/     ← menu lateral, barra de etapas, prévia de peça, ícones…
  pages/          ← uma tela por arquivo
  styles/         ← cores, fontes e estilos compartilhados
  assets/         ← logo e ilustrações da página inicial
```

## Telas e rotas

| Rota | Tela |
|---|---|
| `/` | Página inicial |
| `/login` | Login dos colaboradores |
| `/app` | Início |
| `/app/campanhas/nova` | 1. Briefing |
| `/app/campanhas/:id/ideias` | 2. Escolher a ideia |
| `/app/campanhas/:id/estudio` | 3. Estúdio (imagem com Gemini) |
| `/app/criacoes/:id` | 4. Criações, com filtros |
| `/app/pecas/:id` | Peça bloqueada |
| `/app/aprovacoes` | 5. Aprovações |
| `/app/regras` | Regras da marca |

## Imagens

Enquanto não houver imagens do Gemini, as peças usam a cor do público como fundo.
Quando o back-end devolver `imageUrl` (na peça ou na versão gerada), a imagem aparece sozinha.

## Publicar (build)

```bash
npm run build
```

Os arquivos finais ficam em `dist/`. Se publicar em um servidor estático, configure para que todas as rotas apontem para `index.html`.
