# 🧬 Critério de Construção do Brand Kernel e Governança Regulatória

> **Objetivo deste documento:** Registrar a metodologia técnica e auditável utilizada para construir o manual de marca sintético (`marca.json`) e a base de regras sanitárias e publicitárias (`regras.json`), eliminando regras ocultas em prompts.

---

## 1. Por que um Brand Kernel em JSON (e não regras soltas em Prompt)?
No varejo farmacêutico, o ambiente regulatório está em constante atualização. A **RDC 96/2008 da Anvisa** segue formalmente no ordenamento, mas teve dispositivos questionados pelo **STJ em 2024** frente aos limites estritos da **Lei Federal 9.294/1996**, além de passar por processo de revisão regulatória na própria agência em 2026.

Para evitar que uma mudança de norma exija reescrever o código-fonte ou reestruturar prompts do sistema:
- **O artefato que cria é o mesmo que julga:** Tanto a geração de conceitos criativos quanto a auditoria do Fiscal (Compliance Gate) consultam os mesmos arquivos JSON versionados.
- **Rastreabilidade completa:** Cada regra possui identificador único (`id`), texto da diretriz (`text`), fonte normativa (`source`), categoria (`lei`, `preco`, `consumidor`, `marca`) e status de vigência.

---

## 2. Metodologia de Extração do Manual de Marca Sintético (`marca.json`)

Sem acesso a documentos internos ou proprietários, construímos o `marca.json` de forma programática e auditável a partir de canais públicos do setor farmacêutico:

### 2.1 Paleta Cromática e Contraste (WCAG AA)
Extraímos os tokens visuais predominantes de campanhas de varejo farmacêutico, separando cores institucionais de cores de ação promocional:
- **Azul Institucional (`#1F45FF`):** Transmite confiança, saúde e acolhimento.
- **Vermelho Oferta (`#E3132C`):** Reservado para selos de preço (`price-tag`) e chamadas de varejo.
- **Azul-Marinho Profundo (`#0D1238`):** Aplicado em textos de apoio e no fundo da tarja de advertência sanitária, garantindo contraste superior a `4.5:1` (padrão WCAG AA) para leitura clara do aviso obrigatório da Anvisa.
- **Superfície Neutra (`#FAFAFC` e `#FFFFFF`):** Garante área de respiro limpa ao redor da embalagem oficial do produto.

### 2.2 Substituição Tipográfica de Licença Aberta (Google Fonts)
Para evitar o uso de fontes proprietárias com restrição de licença em protótipos e motores de renderização web, selecionamos duas famílias abertas do Google Fonts com métricas equivalentes:
- **Títulos e Preços (`Sora`, pesos 600 a 800):** Geométrica de alto impacto visual para leitura rápida em feeds móveis, stories e cartazes de PDV.
- **Corpo, Subtítulos e Advertências Legais (`Lexend`, pesos 300 a 600):** Desenvolvida especificamente para fluidez de leitura e legibilidade em tamanhos reduzidos (como rodapés regulatórios).

### 2.3 Matriz de Tom de Voz e Léxico Vetado
A partir da análise de peças públicas nos diretórios *Google Ads Transparency Center* e *Biblioteca de Anúncios da Meta*, estruturamos dois vetores léxicos no `marca.json`:
- **`voice.use` (Atributos recomendados):** `["acolhedor", "próximo", "claro", "calmo"]` — orientando a IA a comunicar cuidado e conveniência sem alarmismo.
- **`voice.avoid` (Termos bloqueados de imediato):** `["cura", "acaba com", "imediato", "milagroso", "100% seguro", "sem efeitos colaterais", "garantido", "bora"]` — impedindo promessas terapêuticas absolutas ou gírias fora do padrão institucional.

---

## 3. Catálogo de Regras de Conformidade (`regras.json`)

Abaixo está a estrutura normativa carregada pelo sistema e exibida na tela **Regras da Marca** (`/app/regras`):

| ID | Regra Operacional Conferida pela Formula | Fonte Legal / Normativa | Categoria | Aplicação no Fluxo |
| :---: | :--- | :--- | :---: | :--- |
| **`r1`** | Não prometer mais do que a bula oficial informa (vedação de promessa de cura ou alívio imediato não comprovado). | **Lei 9.294/1996 (Art. 7º)** & Bulário Anvisa | `lei` | Gate 2 (Ideias, Estúdio e Galeria) |
| **`r2`** | Todo anúncio de medicamento isento de prescrição (MIP) deve exibir o aviso: *"SE PERSISTIREM OS SINTOMAS, O MÉDICO DEVERÁ SER CONSULTADO."* | **Lei 9.294/1996** & **RDC 96/2008 (Anvisa)** | `lei` | Template Fixo + Gate 2 (Galeria) |
| **`r3`** | Medicamentos sujeitos a prescrição médica (Tarja Vermelha ou Preta, ex: antibióticos) não podem ser anunciados ao público geral. | **Lei 9.294/1996 (Art. 7º, § 1º)** | `lei` | **Gate 1 (Pré-IA no Briefing)** |
| **`r4`** | O preço promocional anunciado nunca pode ultrapassar o Preço Máximo ao Consumidor (PMC) vigente. | **Tabela CMED (Anvisa)** | `preco` | **Gate 1 (Tempo Real no Briefing)** |
| **`r5`** | Peças promocionais devem apresentar preço, condição e período de validade de forma clara e ostensiva. | **Código de Defesa do Consumidor (CDC, Arts. 31 e 37)** | `consumidor` | Briefing e Template de Montagem |
| **`r6`** | O texto e a advertência devem manter legibilidade e contraste sobre a imagem de fundo, sem alterar a foto oficial da embalagem. | **Manual da Marca** & **RDC 96/2008** | `marca` | Técnica do Sanduíche (`PiecePreview`) |
| **`r7`** | Crianças nunca devem aparecer associadas ao consumo de medicamentos ou em apelo infantil direto. | **Código do CONAR (Anexo I)** | `lei` | Gate 2 (Auditoria de Peças) |

---

## 4. Ciclo de Aprendizado Contínuo (Human-in-the-Loop)
Quando uma peça recebe classificação **Amarela (`review`)** e é reprovada por um revisor humano na tela de **Aprovações** (`/app/aprovacoes`), o revisor pode marcar a opção de converter aquela justificativa em uma nova diretriz (ex: *"Evitar tom de urgência em peças para 60+"* ou *"Sem gíria em anúncio de remédio"*).

O sistema registra a nova entrada em `regras.json` com a flag `isNew: true`, tornando o aprendizado transparente, auditável e imediatamente ativo para as próximas campanhas.