/* =========================================================
   MOCK DO BACK-END
   Simula o servidor em memória para o front funcionar sozinho.
   Quando o back-end real existir, defina VITE_API_URL no .env
   e este arquivo deixa de ser usado (veja api.js).
   Os formatos de dados aqui são os mesmos descritos no API.md.
   ========================================================= */

const wait = (ms = 450) => new Promise((r) => setTimeout(r, ms));
const clone = (x) => JSON.parse(JSON.stringify(x));
let seq = 100;
const newId = (p) => `${p}_${++seq}`;

/* ---------- Catálogos fixos ---------- */
export const AUDIENCES = [
  { id: 'a25', label: '25–44', fullLabel: 'Adultos 25–44', color: 'linear-gradient(150deg, #3D63FF, #1533D6)' },
  { id: 's60', label: '60+', fullLabel: '60+', color: 'linear-gradient(150deg, #24306E, #0D1238)' },
  { id: 'fam', label: 'Famílias', fullLabel: 'Famílias com crianças', color: 'linear-gradient(150deg, #FF5A6E, #D30A26)' },
  { id: 'j18', label: '18–24', fullLabel: 'Jovens 18–24', color: 'linear-gradient(150deg, #8C6BFF, #4A1FE8)' },
];

export const CHANNELS = [
  { id: 'feed', label: 'Feed', fullLabel: 'Instagram feed', size: '1080×1080' },
  { id: 'sto', label: 'Stories', fullLabel: 'Stories', size: '1080×1920' },
  { id: 'ban', label: 'Banner', fullLabel: 'Banner do site', size: '1200×300' },
  { id: 'wpp', label: 'WhatsApp', fullLabel: 'WhatsApp', size: '1080×1350' },
  { id: 'pdv', label: 'Cartaz', fullLabel: 'Cartaz na loja', size: 'A3' },
  { id: 'tv', label: 'TV', fullLabel: 'TV da loja', size: '1920×1080' },
];

export const SEASONS = [
  { id: 'verao', label: 'Verão', topics: ['Proteção solar', 'Hidratação', 'Picada de inseto'] },
  { id: 'outono', label: 'Outono', topics: ['Rinite', 'Tempo seco', 'Imunidade'] },
  { id: 'inverno', label: 'Inverno', topics: ['Gripe e resfriado', 'Pele ressecada', 'Dor de garganta'] },
  { id: 'primavera', label: 'Primavera', topics: ['Alergias', 'Pólen', 'Olhos irritados'] },
];

export const REGIONS = [
  { id: 'ne', label: 'Nordeste', fullLabel: 'Nordeste' },
  { id: 'sul', label: 'Sul', fullLabel: 'Sul' },
  { id: 'se', label: 'Sudeste', fullLabel: 'Sudeste' },
  { id: 'no_co', label: 'Norte / C.-Oeste', fullLabel: 'Norte e Centro-Oeste' },
];

const PRODUCTS = [
  { id: 'p1', name: 'Paracetamol 750 mg', category: 'isento_prescricao', price: 9.9, cmedMax: 14.5, imageUrl: null },
  { id: 'p2', name: 'Loção hidratante', category: 'dermocosmetico', price: 24.9, cmedMax: 32.0, imageUrl: null },
  { id: 'p3', name: 'Dipirona 1 g', category: 'generico', price: 6.9, cmedMax: 11.2, imageUrl: null },
  { id: 'p4', name: 'Protetor solar FPS 50', category: 'dermocosmetico', price: 39.9, cmedMax: 54.9, imageUrl: null },
  { id: 'p5', name: 'Antialérgico 10 mg', category: 'isento_prescricao', price: 14.9, cmedMax: 21.0, imageUrl: null },
  { id: 'p6', name: 'Amoxicilina 500 mg (Sob Prescrição)', category: 'prescricao', price: 32.9, cmedMax: 42.0, imageUrl: null },
];

const MANDATORY_WARNING = 'SE PERSISTIREM OS SINTOMAS, O MÉDICO DEVERÁ SER CONSULTADO.';

/* ---------- Estado em memória ---------- */
const db = {
  campaigns: [],
  pieces: [],
  rules: [
    { id: 'r1', text: 'Não prometer mais do que a bula diz', source: 'Lei 9.294/96', category: 'lei', isNew: false },
    { id: 'r2', text: 'Anúncio de remédio leva o aviso “Se persistirem os sintomas…”', source: 'Anvisa', category: 'lei', isNew: false },
    { id: 'r3', text: 'Remédio que precisa de receita não é anunciado', source: 'Lei 9.294/96', category: 'lei', isNew: false },
    { id: 'r4', text: 'Preço não passa do teto do governo', source: 'Tabela CMED', category: 'preco', isNew: false },
    { id: 'r5', text: 'Oferta mostra preço, condição e validade', source: 'Código de Defesa do Consumidor', category: 'consumidor', isNew: false },
    { id: 'r6', text: 'Texto sempre legível sobre o fundo', source: 'Manual da marca', category: 'marca', isNew: false },
    { id: 'r7', text: 'Criança nunca aparece junto de remédio', source: 'CONAR', category: 'lei', isNew: false },
  ],
  brand: {
    colors: [
      { name: 'Azul', hex: '#1F45FF' },
      { name: 'Vermelho oferta', hex: '#E3132C' },
      { name: 'Azul-marinho', hex: '#0D1238' },
      { name: 'Fundo', hex: '#FAFAFC' },
    ],
    fonts: [
      { name: 'Sora', use: 'títulos' },
      { name: 'Lexend', use: 'textos' },
    ],
    voice: {
      use: ['acolhedor', 'próximo', 'claro', 'calmo'],
      avoid: ['cura', 'acaba com', '100% seguro', 'sem efeitos colaterais', 'bora'],
    },
  },
  studio: {}, // campaignId -> { versions, chosenVersionId, title, subtitle }
};

const product = (id) => PRODUCTS.find((p) => p.id === id) || PRODUCTS[0];
const audience = (id) => AUDIENCES.find((a) => a.id === id);
const channel = (id) => CHANNELS.find((c) => c.id === id);

function okChecks() {
  return [
    { id: 'k1', label: 'Embalagem igual à foto oficial', ok: true },
    { id: 'k2', label: 'Cores e logo da marca', ok: true },
    { id: 'k3', label: 'Preço dentro do teto', ok: true },
    { id: 'k4', label: 'Aviso obrigatório presente', ok: true },
    { id: 'k5', label: 'Promessa de acordo com a bula', ok: true },
  ];
}

function makePiece(campaign, aud, ch, v, title, extra = {}) {
  const prod = extra.productId ? product(extra.productId) : product(campaign.productIds[(v + CHANNELS.indexOf(channel(ch))) % campaign.productIds.length]);
  return {
    id: extra.id || `${campaign.id}-${aud}-${ch}-${v}`,
    campaignId: campaign.id,
    campaignName: campaign.name,
    audience: aud,
    format: ch,
    version: v,
    title,
    subtitle: campaign.chosenIdea ? campaign.chosenIdea.support : '',
    productName: prod.name,
    price: campaign.promoPrice || prod.price,
    imageUrl: null,
    color: audience(aud).color,
    warning: MANDATORY_WARNING,
    status: 'ok', // ok | review | blocked
    checks: okChecks(),
    reviewReason: null,
    issues: [],
    suggestion: null,
    suggestedRule: null,
    ...extra,
  };
}

function generatePieces(campaign) {
  const out = [];
  const prodIds = campaign.productIds && campaign.productIds.length ? campaign.productIds : ['p1'];
  prodIds.forEach((pId, pIdx) => {
    campaign.audiences.forEach((aud) =>
      campaign.channels.forEach((ch) =>
        [1, 2].forEach((v) => {
          const title = v === 1 ? campaign.chosenIdea?.title || campaign.name : campaign.chosenIdea?.altTitle || campaign.name;
          out.push(makePiece(campaign, aud, ch, v, title, {
            id: pIdx === 0 ? `${campaign.id}-${aud}-${ch}-${v}` : `${campaign.id}-${aud}-${ch}-${v}-${pId}`,
            productId: pId,
          }));
        }),
      ),
    );
  });
  return out;
}

/* ---------- Dados de exemplo: campanha "Inverno sem pressa" ---------- */
(function seed() {
  const c1 = {
    id: 'c1',
    name: 'Inverno sem pressa',
    message: 'Cuidado no inverno: alívio para gripe e resfriado e pele hidratada no frio, perto de casa.',
    season: 'inverno',
    productIds: ['p1', 'p2', 'p3'],
    audiences: ['a25', 's60', 'fam'],
    channels: ['feed', 'sto', 'ban', 'wpp', 'pdv'],
    period: '01/06 – 31/07',
    promoPrice: null,
    status: 'em_revisao', // rascunho | ideias | estudio | em_revisao | publicada
    chosenIdea: {
      id: 'i1',
      title: 'O inverno pede cuidado, não pressa.',
      altTitle: 'Cuidado de inverno, perto de você.',
      support: 'Alívio da febre e das dores leves para você seguir o dia.',
    },
    createdAt: '2026-10-15',
  };
  db.campaigns.push(c1);
  const pieces = generatePieces(c1);

  const set = (key, patch) => {
    const p = pieces.find((x) => x.id === `c1-${key}`);
    Object.assign(p, patch);
  };
  set('s60-sto-2', {
    status: 'blocked',
    title: 'Acaba com a gripe em 24h.',
    productName: 'Paracetamol 750 mg',
    price: 9.9,
    warning: null,
    checks: okChecks().map((k) =>
      k.id === 'k4' ? { ...k, ok: false } : k.id === 'k5' ? { ...k, ok: false } : k,
    ),
    issues: [
      { title: 'Promete mais do que a bula permite', detail: 'A bula fala em aliviar febre e dor, não em acabar com a gripe.', source: 'Lei 9.294/96' },
      { title: 'Falta o aviso obrigatório', detail: 'Anúncio de remédio precisa do aviso “Se persistirem os sintomas…”.', source: 'Anvisa' },
    ],
    suggestion: { title: 'Alívio da febre para atravessar o inverno.', addsWarning: true },
  });
  set('fam-ban-1', {
    status: 'blocked',
    title: 'O remédio que toda criança adora.',
    issues: [
      { title: 'Remédio associado a criança', detail: 'Peças de remédio não podem usar apelo infantil.', source: 'CONAR' },
    ],
    suggestion: { title: 'Cuidado para a família toda no inverno.', addsWarning: false },
    checks: okChecks().map((k) => (k.id === 'k5' ? { ...k, ok: false } : k)),
  });
  set('a25-sto-2', {
    status: 'review',
    title: 'Bora cuidar do frio?',
    productName: 'Dipirona 1 g',
    price: 6.9,
    reviewReason: 'A gíria “bora” pode estar fora do tom da marca.',
    suggestedRule: { text: 'Sem gíria em anúncio de remédio.', category: 'marca' },
  });
  set('s60-feed-1', {
    status: 'review',
    title: 'Gripe não espera. Você também não precisa.',
    productName: 'Paracetamol 750 mg',
    price: 9.9,
    reviewReason: 'O tom pode soar alarmista para o público 60+.',
    suggestedRule: { text: 'Evitar tom de urgência em peças para 60+.', category: 'marca' },
  });
  set('s60-wpp-2', {
    status: 'review',
    title: 'Febre? A gente cuida perto de você.',
    productName: 'Paracetamol 750 mg',
    price: 9.9,
    reviewReason: 'A imagem de termômetro com febre alta pode assustar.',
    suggestedRule: { text: 'Não usar termômetro com febre alta em peças para 60+.', category: 'marca' },
  });
  set('fam-pdv-1', {
    status: 'review',
    title: 'Inverno em família, cuidado de sobra.',
    productName: 'Loção hidratante',
    price: 24.9,
    reviewReason: 'Aparece uma criança perto de um remédio.',
    suggestedRule: { text: 'Criança nunca aparece junto de remédio.', category: 'lei' },
  });
  db.pieces.push(...pieces);

  db.campaigns.push({
    id: 'c2', name: 'Volta às aulas', message: '', season: 'verao', productIds: ['p4'],
    audiences: ['fam'], channels: ['feed', 'sto'], period: '', promoPrice: null,
    status: 'rascunho', chosenIdea: null, createdAt: '2026-10-14',
  });
  db.campaigns.push({
    id: 'c3', name: 'Dia das Mães', message: '', season: 'outono', productIds: ['p2'],
    audiences: ['a25'], channels: ['feed', 'sto', 'wpp'], period: '01/05 – 12/05', promoPrice: null,
    status: 'publicada', chosenIdea: null, createdAt: '2026-04-20', publishedCount: 18,
  });
})();

function summarize(c) {
  const ps = db.pieces.filter((p) => p.campaignId === c.id);
  return {
    ...c,
    totals: {
      all: ps.length || c.publishedCount || 0,
      ok: ps.filter((p) => p.status === 'ok').length,
      review: ps.filter((p) => p.status === 'review').length,
      blocked: ps.filter((p) => p.status === 'blocked').length,
    },
  };
}

/* ---------- Funções que imitam as rotas do back-end ---------- */
export const mock = {
  async login(email, password) {
    await wait();
    if (!email || !password) throw new Error('Preencha e-mail e senha.');
    return { token: 'mock-token', user: { id: 'u1', name: email.split('@')[0], email } };
  },

  async listProducts(q = '') {
    await wait(200);
    const s = q.toLowerCase();
    return clone(PRODUCTS.filter((p) => p.name.toLowerCase().includes(s)));
  },

  async listCampaigns() {
    await wait();
    return clone(db.campaigns.map(summarize));
  },

  async getCampaign(id) {
    await wait(200);
    const c = db.campaigns.find((x) => x.id === id);
    if (!c) throw new Error('Campanha não encontrada.');
    return clone(summarize(c));
  },

  async createCampaign(data) {
    await wait();

    // 1ª Checagem do Fiscal (Etapa 2 do Fluxograma: Lei 9.294/96 + Tabela CMED)
    const selectedProducts = (data.productIds || []).map((id) => PRODUCTS.find((p) => p.id === id)).filter(Boolean);
    if (selectedProducts.some((p) => p.category === 'prescricao')) {
      throw new Error('BLOQUEIO DO FISCAL (1ª Checagem — Lei 9.294/96): Medicamentos sob prescrição médica (Tarja Vermelha/Preta) não podem ser anunciados ao público. O pedido foi barrado antes de gastar IA.');
    }
    if (data.promoPrice != null && selectedProducts.some((p) => p.cmedMax != null && data.promoPrice > p.cmedMax)) {
      throw new Error('BLOQUEIO DO FISCAL (Tabela CMED): O preço promocional informado ultrapassa o Preço Máximo ao Consumidor (PMC) permitido pela Anvisa/CMED.');
    }

    const c = {
      id: newId('c'),
      name: data.name || 'Nova campanha',
      message: data.message || '',
      season: data.season,
      regions: data.regions || ['ne', 'sul'],
      productIds: data.productIds.length ? data.productIds : ['p1'],
      audiences: data.audiences,
      channels: data.channels,
      period: data.period || '',
      promoPrice: data.promoPrice || null,
      status: 'ideias',
      chosenIdea: null,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    db.campaigns.unshift(c);
    return clone(summarize(c));
  },

  async generateIdeas(campaignId) {
    await wait(900);
    const c = db.campaigns.find((x) => x.id === campaignId);
    const season = SEASONS.find((s) => s.id === c?.season)?.label.toLowerCase() || 'estação';
    return [
      { id: 'i1', title: `O ${season} pede cuidado, não pressa.`, altTitle: `Cuidado de ${season}, perto de você.`, support: 'Alívio imediato dos sintomas para você seguir o dia.', color: 'linear-gradient(150deg, #3D63FF 0%, #1533D6 100%)' },
      { id: 'i2', title: 'Frio lá fora, cuidado aqui dentro.', altTitle: 'Tudo o que a estação pede, num só lugar.', support: 'O que a estação pede, reunido num só lugar.', color: 'linear-gradient(150deg, #FF5A6E 0%, #D30A26 100%)' },
      { id: 'i3', title: `Seu kit de ${season} numa ida à farmácia.`, altTitle: 'Cuidado sem desvio no caminho.', support: 'Pele, febre e dor de cabeça cuidadas sem desvio.', color: 'linear-gradient(150deg, #8C6BFF 0%, #4A1FE8 100%)' },
    ];
  },

  async chooseIdea(campaignId, idea) {
    await wait(300);
    const text = `${idea.title} ${idea.support}`.toLowerCase();
    if (text.includes('cura') || text.includes('100%') || text.includes('acaba com')) {
      throw new Error('BLOQUEIO DO FISCAL (Gate 2 — Lei 9.294/96 & CONAR): Promessa de cura definitiva ou garantia absoluta é vedada para medicamentos. O avanço para o estúdio foi bloqueado.');
    }
    const c = db.campaigns.find((x) => x.id === campaignId);
    c.chosenIdea = { id: idea.id, title: idea.title, altTitle: idea.altTitle, support: idea.support };
    c.status = 'estudio';
    return clone(summarize(c));
  },

  async generateImages(campaignId, { prompt }) {
    await wait(1200);
    const versions = [
      { id: newId('v'), imageUrl: null, background: 'linear-gradient(160deg, #E9B98A 0%, #A8653A 55%, #4A2A16 100%)' },
      { id: newId('v'), imageUrl: null, background: 'linear-gradient(160deg, #9DB4E8 0%, #4E6FC4 55%, #1E2F6E 100%)' },
      { id: newId('v'), imageUrl: null, background: 'linear-gradient(160deg, #D9A6A0 0%, #8C4B57 55%, #3B1E2A 100%)' },
    ];
    db.studio[campaignId] = { ...(db.studio[campaignId] || {}), versions, prompt };
    return clone(versions);
  },

  async checkDraft(campaignId, { title, subtitle }) {
    await wait(400);
    const text = `${title} ${subtitle}`.toLowerCase();
    const checks = [
      { id: 'k1', label: 'Embalagem igual à foto oficial', ok: true },
      { id: 'k2', label: 'Cores e logo da marca', ok: true },
      { id: 'k4', label: 'Aviso obrigatório presente', ok: true },
    ];
    const issues = [];
    if (text.includes('imediato')) {
      issues.push({
        title: '“Alívio imediato” promete demais.',
        detail: 'A bula fala em alívio temporário.',
        fix: { field: 'subtitle', value: subtitle.replace(/imediato/i, 'temporário') },
      });
    }
    db.brand.voice.avoid.forEach((w) => {
      if (text.includes(w)) issues.push({ title: `A palavra “${w}” não é usada pela marca.`, detail: 'Está na lista de palavras que não usamos.', fix: null });
    });
    return { checks, issues };
  },

  async approveMaster(campaignId, { versionId, title, subtitle }) {
    await wait(900);
    const c = db.campaigns.find((x) => x.id === campaignId);
    if (!c.chosenIdea) c.chosenIdea = { id: 'i1', title, altTitle: title, support: subtitle };
    c.chosenIdea.title = title;
    c.chosenIdea.support = subtitle;
    c.status = 'em_revisao';
    if (!db.pieces.some((p) => p.campaignId === c.id)) {
      const v = db.studio[campaignId]?.versions?.find((x) => x.id === versionId);
      const ps = generatePieces(c).map((p) => ({ ...p, imageUrl: v?.imageUrl || null }));
      db.pieces.push(...ps);
    }
    return clone(summarize(c));
  },

  async listPieces(campaignId, filters = {}) {
    await wait(300);
    return clone(
      db.pieces.filter(
        (p) =>
          p.campaignId === campaignId &&
          (!filters.status || p.status === filters.status) &&
          (!filters.audience || p.audience === filters.audience) &&
          (!filters.format || p.format === filters.format),
      ),
    );
  },

  async getPiece(id) {
    await wait(250);
    const p = db.pieces.find((x) => x.id === id);
    if (!p) throw new Error('Peça não encontrada.');
    return clone(p);
  },

  async applyFix(id) {
    await wait(700);
    const p = db.pieces.find((x) => x.id === id);
    if (p.suggestion) {
      p.title = p.suggestion.title;
      if (p.suggestion.addsWarning) p.warning = MANDATORY_WARNING;
    }
    p.status = 'ok';
    p.issues = [];
    p.checks = okChecks();
    return clone(p);
  },

  async listApprovals() {
    await wait(300);
    return clone(db.pieces.filter((p) => p.status === 'review'));
  },

  async approvePiece(id) {
    await wait(400);
    const p = db.pieces.find((x) => x.id === id);
    p.status = 'ok';
    p.reviewReason = null;
    return clone(p);
  },

  async rejectPiece(id, { reason, createRule }) {
    await wait(500);
    const p = db.pieces.find((x) => x.id === id);
    p.status = 'rejected';
    p.rejectionReason = reason;
    let rule = null;
    if (createRule) {
      rule = {
        id: newId('r'),
        text: p.suggestedRule?.text || reason,
        source: 'Criada ao reprovar uma peça',
        category: p.suggestedRule?.category || 'marca',
        isNew: true,
      };
      db.rules.unshift(rule);
    }
    return clone({ piece: p, rule });
  },

  async publishApproved(campaignId) {
    await wait(700);
    const c = db.campaigns.find((x) => x.id === campaignId);
    const n = db.pieces.filter((p) => p.campaignId === campaignId && p.status === 'ok').length;
    if (c && !db.pieces.some((p) => p.campaignId === campaignId && p.status === 'review')) c.status = 'publicada';
    return { published: n };
  },

  async listRules() {
    await wait(250);
    return clone(db.rules);
  },

  async createRule(data) {
    await wait(300);
    const r = { id: newId('r'), isNew: true, ...data };
    db.rules.unshift(r);
    return clone(r);
  },

  async getBrand() {
    await wait(200);
    return clone(db.brand);
  },
};
