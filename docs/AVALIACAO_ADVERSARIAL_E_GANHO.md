```markdown
# 🛡️ Conjunto Adversarial de Testes e Estimativa de Ganho Operacional

> **Objetivo deste documento:** Comprovar a eficácia do Duplo Gate de Conformidade frente a casos propositalmente irregulares (Conjunto Adversarial) e detalhar a memória de cálculo do ganho de escala e produtividade.

---

## 1. Conjunto Adversarial Rotulado (Validação dos Gates)

Para que a governança da **Formula** possa ser testada de forma prática e auditável pelos avaliadores, implementamos cenários adversariais diretamente acionáveis na interface (através dos botões **`🧪 Simular...`** em cada etapa do protótipo).

Abaixo estão os casos de teste adversariais e o comportamento determinístico/RAG do sistema:

| ID | Etapa do Funil | Caso Adversarial Simulado | Regra / Fonte Violada | Resultado Esperado | Comportamento na Formula |
| :---: | :--- | :--- | :--- | :---: | :--- |
| **ADV-01** | **1. Briefing** (`NewCampaign.jsx`) | Tentativa de criar campanha incluindo **Amoxicilina 500 mg** (`category: "prescricao"`). | **Lei 9.294/1996 (Art. 7º, § 1º)** — Proibição de anúncio de remédio sob prescrição. | 🔴 **Bloqueio Pré-IA (Gate 1)** | Barra a criação da campanha imediatamente na tela de Briefing e poupa chamadas de IA. |
| **ADV-02** | **1. Briefing** (`NewCampaign.jsx`) | Inserção de preço promocional de **R$ 58,00** (acima do teto `cmedMax` dos itens). | **Tabela CMED (Anvisa)** — Preço acima do PMC permitido pelo governo. | 🔴 **Bloqueio Pré-IA + Auto-Ajuste** | Exibe alerta regulatório em tempo real e oferece botão de 1 clique: *"Ajustar para o teto regulamentar"*. |
| **ADV-03** | **2. Ideias** (`Ideas.jsx`) | Conceito contendo promessa milagrosa de cura definitiva. | **Lei 9.294/1996 (Art. 7º)** & **RDC 96/2008** — Vedação de promessa de cura. | 🔴 **Bloqueio de Conceito (Gate 2)** | Impede o avanço do conceito irregular para o Estúdio antes do desdobramento das peças. |
| **ADV-04** | **3. Estúdio** (`Studio.jsx`) | Edição manual do título/subtítulo com *"Alívio imediato"* ou *"Cura vedada"*. | **Bulário Anvisa** & **Brand Kernel (`voice.avoid`)** — Extrapolação da bula. | 🟡/🔴 **Trava em Tempo Real** | Desabilita o botão de aprovar peça-mãe e oferece botão *"Corrigir texto"* na lateral direita. |
| **ADV-05** | **4. Criações** (`Pieces.jsx` / `BlockedPiece.jsx`) | Peça `c1-s60-sto-2`: *"Acaba com a gripe em 24h"* (Paracetamol 750 mg) e sem tarja legal. | **Lei 9.294/1996** (extrapola a bula) + **Anvisa** (ausência de aviso obrigatório). | 🔴 **Bloqueada (`blocked`)** | Retém a peça na galeria e apresenta a *"Sugestão da Formula"* com correção e inclusão de tarja em 1 clique. |
| **ADV-06** | **4. Criações** (`Pieces.jsx` / `BlockedPiece.jsx`) | Peça `c1-fam-ban-1`: *"O remédio que toda criança adora."* | **Código do CONAR (Anexo I)** — Proibição de apelo infantil para medicamentos. | 🔴 **Bloqueada (`blocked`)** | Retém a peça por associar medicamento a criança e sugere reescrita focada no cuidado da família. |
| **ADV-07** | **5. Aprovações** (`Approvals.jsx`) | Peça `c1-a25-sto-2`: *"Bora cuidar do frio?"* (Dipirona 1 g) ou tom alarmista para 60+. | **Manual da Marca (`marca.json`)** — Desvio de tom de voz / uso de gíria. | 🟡 **Revisão Humana (`review`)** | Envia para decisão humana e sugere transformar a reprovação em nova regra viva em `/app/regras`. |

---

## 2. Expansão Combinatória e Memória de Cálculo de Escala

Na **Formula**, o volume de peças é calculado dinamicamente pela equação combinatória do varejo:

$$\text{Total de Peças} = \text{Produtos} \times \text{Públicos} \times \text{Canais} \times \text{Regiões} \times 2\text{ Versões}$$

### Exemplo Prático (Campanha Sazonal Completa):
- **3 Produtos** (ex: *Paracetamol 750 mg*, *Loção Hidratante*, *Dipirona 1 g*)
- **3 Públicos** (*Adultos 25–44*, *60+*, *Famílias*)
- **5 Canais** (*Instagram Feed*, *Stories*, *Banner do Site*, *WhatsApp*, *Cartaz PDV*)
- **2 Regiões** (*Nordeste*, *Sul*)
- **2 Versões de Copy** (*Título Principal* e *Título Alternativo*)
- **Resultado:** $3 \times 3 \times 5 \times 2 \times 2 = \mathbf{180\text{ peças compiladas}}$ a partir de **1 única decisão criativa**.

---

## 3. Comparativo de Esforço: Fluxo Tradicional vs. Fluxo Proposto

*Nota de transparência: Os números de portfólio exibidos no Dashboard do protótipo (`108 peças no portfólio`, `84 liberadas`, `2 riscos bloqueados` e `4 aguardando revisão`) são dados simulados (`mock.js`) construídos para demonstrar o funcionamento operacional do funil.*

| Etapa / Métrica | Fluxo Tradicional (Manual) | Fluxo Proposto (Formula) | Ganho Estimado |
| :--- | :--- | :--- | :--- |
| **Triagem de Produtos Proibidos e Teto CMED** | Verificação manual em planilhas e listas regulatórias | **Instantâneo no Briefing (Gate 1)** | **Até -85% em consumo de tokens** (barra erros antes de chamar a LLM) |
| **Desdobramento de 30 a 180 Variações** | Redimensionamento e diagramação peça a peça (25h a 90h) | **Compilação determinística por template (~4 min)** | **Redução > 90% no tempo operacional de produção** |
| **Tempo de Atenção Humana por Peça Aprovada** | **~18 minutos/peça** (conferindo preço, embalagem, bula e tarja uma a uma) | **~24 segundos (0,4 min) por peça aprovada** (humano aprova as Verdes em lote e foca só nas Amarelas) | **Redução de ~97% no esforço de revisão humana** |
| **Integridade da Embalagem e Preço** | Risco de erro humano de digitação ou distorção por IA de imagem | **100% preservado (Técnica do Sanduíche)** | **Zero alucinação visual sobre o rótulo do medicamento** |