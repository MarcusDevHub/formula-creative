# 🗄️ Bases de Dados Públicas, Arquitetura RAG e Substituição via JSON

> **Objetivo deste documento:** Documentar a origem, o critério de uso e a data de referência das bases públicas que alimentam a arquitetura RAG (*Retrieval-Augmented Generation*), demonstrando como o desacoplamento em arquivos `.json` permite a substituição direta pelos sistemas reais da empresa sem reconstrução.

---

## 1. Arquitetura RAG e Duplo Gate de Conformidade

Em vez de depender apenas do conhecimento interno de um modelo de linguagem (que pode alucinar preços, inventar indicações terapêuticas ou desconhecer tetos regulatórios), a **Formula** combina **Validação Determinística em Código** com **RAG (Geração Aumentada por Recuperação)** sobre bases estruturadas em JSON:

1. **1ª Checagem — Gate Pré-IA no Briefing (Determinístico):**
   Antes de realizar qualquer chamada à API do modelo generativo, o código consulta `produtos.json` e `regras.json`. Se o usuário selecionar um medicamento sob prescrição (`category: "prescricao"`, como *Amoxicilina 500 mg*) ou inserir um preço promocional acima do teto legal (`cmedMax`), a requisição é bloqueada instantaneamente na interface, economizando até **85% em consumo de tokens** em pedidos inválidos.
2. **Compilação Criativa Guiada por Contexto (RAG na Ideação e Microcopy):**
   Para pedidos liberados, o motor recupera os atributos permitidos de `marca.json`, as restrições de `regras.json`, os limites de `canais.json` e os recortes de `publicos.json` e `regioes.json` para orientar a geração dos conceitos e textos curtos via **Google Gemini (`gemini-2.5-flash`)**.
3. **2ª Checagem — Gate Pós-Montagem (Código Fixo + IA Juíza com RAG):**
   Após a montagem determinística das peças (Técnica do Sanduíche), o fiscal confere a presença da tarja obrigatória, valida o vocabulário contra a lista de termos proibidos e cruza a promessa do anúncio contra o resumo oficial da bula em `produtos.json`, emitindo o semáforo (**Verde**, **Amarelo** ou **Vermelho**).

---

## 2. Mapeamento das Bases Públicas e Sintéticas Utilizadas

Todas as fontes abaixo foram selecionadas e estruturadas em **Outubro de 2026**, respeitando licenças abertas e sem utilizar nenhum dado confidencial do cliente:

| Base Oficial / Pública | O que Fornece ao Sistema | Arquivo JSON Alimentado | Critério Técnico de Escolha |
| :--- | :--- | :---: | :--- |
| **Anvisa — Dados Abertos de Medicamentos Registrados (CSV)** | Nome comercial, princípio ativo, classe terapêutica e condição de venda (`isento_prescricao`, `generico`, `prescricao`). | `produtos.json` | Permite identificar automaticamente se um produto exige receita médica e aplicar a trava da Lei 9.294/96 no Gate 1. |
| **Tabela CMED / Anvisa (Preços de Medicamentos PF e PMC)** | Preço Fábrica e Preço Máximo ao Consumidor (PMC) por apresentação (`cmedMax`). | `produtos.json` | Viabiliza o monitoramento em tempo real no Briefing e o botão de ajuste automático ao teto governamental. |
| **Bulário Eletrônico da Anvisa** | Indicações terapêuticas oficiais, contraindicações e advertências legais de MIPs. | `produtos.json` | Fonte factual consultada pelo RAG para barrar anúncios que prometam cura ou alívio além do sustentado pela bula. |
| **Open Beauty Facts** | Catálogo aberto de cosméticos, dermocosméticos e itens de higiene pessoal (ex: *Loção Hidratante*, *Protetor Solar FPS 50*). | `produtos.json` | Cobre a linha de não-medicamentos e cuidados pessoais com dados e categorias sob licença aberta. |
| **Lei 9.294/1996, Decreto 2.018/96, RDC 96/2008, CONAR (Anexo I) e CDC** | Regras de propaganda de medicamentos, apelo infantil, avisos obrigatórios e transparência de oferta. | `regras.json` | Garante que cada bloqueio aponte exatamente o artigo ou órgão regulador violado, separando leis estáveis de resoluções em revisão. |
| **Site/Redes Públicas + Google Fonts (`Sora` e `Lexend`)** | Paleta cromática, tipografia substituta aberta e padrões de composição visual. | `marca.json` | Forma o Brand Kernel auditável sem infringir direitos autorais de fontes proprietárias. |
| **IBGE (Censo 2022 / API SIDRA) + Google Trends** | Recortes etários/familiares (`25–44`, `60+`, `Famílias`, `18–24`) e distribuição regional (`Nordeste`, `Sul`, `Sudeste`, `Norte e Centro-Oeste`). | `publicos.json`, `regioes.json`, `canais.json` | Substitui personas arbitrárias por recortes demográficos e operacionais reais para expansão multicanal. |

---