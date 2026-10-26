/* =========================================================
   CAMADA DE API — o único lugar do front que fala com o back-end.

   - Sem VITE_API_URL no .env  → usa o mock em memória (mock.js).
   - Com VITE_API_URL definido  → chama o back-end de verdade.

   Cada função abaixo corresponde a uma rota descrita no API.md.
   Se o back-end mudar uma rota, só este arquivo precisa mudar.
   ========================================================= */

import { mock } from './mock.js';

export { AUDIENCES, CHANNELS, SEASONS, REGIONS } from './mock.js';

const BASE_URL = import.meta.env.VITE_API_URL;
export const isMock = !BASE_URL;

const TOKEN_KEY = 'formula_token';
export const auth = {
  get token() {
    try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
  },
  set(token) {
    try { localStorage.setItem(TOKEN_KEY, token); } catch { /* sem storage */ }
  },
  clear() {
    try { localStorage.removeItem(TOKEN_KEY); } catch { /* sem storage */ }
  },
};

async function http(method, path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(auth.token ? { Authorization: `Bearer ${auth.token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    let message = `Erro ${res.status}`;
    try { message = (await res.json()).message || message; } catch { /* corpo vazio */ }
    throw new Error(message);
  }
  return res.status === 204 ? null : res.json();
}

const qs = (obj) => {
  const p = new URLSearchParams(Object.entries(obj).filter(([, v]) => v));
  const s = p.toString();
  return s ? `?${s}` : '';
};

export const api = {
  /* Login */
  login: (email, password) =>
    isMock ? mock.login(email, password) : http('POST', '/auth/login', { email, password }),

  /* Catálogo de produtos */
  listProducts: (q) => (isMock ? mock.listProducts(q) : http('GET', `/catalog/products${qs({ q })}`)),

  /* Campanhas */
  listCampaigns: () => (isMock ? mock.listCampaigns() : http('GET', '/campaigns')),
  getCampaign: (id) => (isMock ? mock.getCampaign(id) : http('GET', `/campaigns/${id}`)),
  createCampaign: (data) => (isMock ? mock.createCampaign(data) : http('POST', '/campaigns', data)),

  /* Ideias (IA de texto) */
  generateIdeas: (campaignId) =>
    isMock ? mock.generateIdeas(campaignId) : http('POST', `/campaigns/${campaignId}/ideas`),
  chooseIdea: (campaignId, idea) =>
    isMock ? mock.chooseIdea(campaignId, idea) : http('POST', `/campaigns/${campaignId}/ideas/${idea.id}/choose`),

  /* Estúdio (IA de imagem — Gemini) */
  generateImages: (campaignId, payload) =>
    isMock ? mock.generateImages(campaignId, payload) : http('POST', `/campaigns/${campaignId}/studio/images`, payload),
  checkDraft: (campaignId, payload) =>
    isMock ? mock.checkDraft(campaignId, payload) : http('POST', `/campaigns/${campaignId}/studio/check`, payload),
  approveMaster: (campaignId, payload) =>
    isMock ? mock.approveMaster(campaignId, payload) : http('POST', `/campaigns/${campaignId}/studio/approve`, payload),

  /* Peças */
  listPieces: (campaignId, filters = {}) =>
    isMock ? mock.listPieces(campaignId, filters) : http('GET', `/campaigns/${campaignId}/pieces${qs(filters)}`),
  getPiece: (id) => (isMock ? mock.getPiece(id) : http('GET', `/pieces/${id}`)),
  applyFix: (id) => (isMock ? mock.applyFix(id) : http('POST', `/pieces/${id}/apply-fix`)),
  publishApproved: (campaignId) =>
    isMock ? mock.publishApproved(campaignId) : http('POST', `/campaigns/${campaignId}/publish`),

  /* Aprovações */
  listApprovals: () => (isMock ? mock.listApprovals() : http('GET', '/approvals')),
  approvePiece: (id) => (isMock ? mock.approvePiece(id) : http('POST', `/pieces/${id}/approve`)),
  rejectPiece: (id, payload) =>
    isMock ? mock.rejectPiece(id, payload) : http('POST', `/pieces/${id}/reject`, payload),

  /* Regras da marca */
  listRules: () => (isMock ? mock.listRules() : http('GET', '/rules')),
  createRule: (data) => (isMock ? mock.createRule(data) : http('POST', '/rules', data)),
  getBrand: () => (isMock ? mock.getBrand() : http('GET', '/brand')),
};
