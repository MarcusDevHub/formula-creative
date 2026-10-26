import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './components/AppLayout.jsx';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import NewCampaign from './pages/NewCampaign.jsx';
import Ideas from './pages/Ideas.jsx';
import Studio from './pages/Studio.jsx';
import CreationsIndex from './pages/CreationsIndex.jsx';
import Pieces from './pages/Pieces.jsx';
import BlockedPiece from './pages/BlockedPiece.jsx';
import Approvals from './pages/Approvals.jsx';
import BrandRules from './pages/BrandRules.jsx';

/*
  Mapa de rotas
  /                                   Página inicial (pública)
  /login                              Login dos colaboradores
  /app                                Início (painel)
  /app/campanhas/nova                 1. Briefing
  /app/campanhas/:campaignId/ideias   2. Escolher a ideia
  /app/campanhas/:campaignId/estudio  3. Estúdio (imagem com Gemini) — tela cheia, sem menu
  /app/criacoes/:campaignId           4. Criações (com filtros)
  /app/pecas/:pieceId                 Detalhe de peça bloqueada
  /app/aprovacoes                     5. Aprovações
  /app/regras                         Regras da marca
*/
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/app/campanhas/:campaignId/estudio" element={<Studio />} />
      <Route path="/app" element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="campanhas/nova" element={<NewCampaign />} />
        <Route path="campanhas/:campaignId/ideias" element={<Ideas />} />
        <Route path="criacoes" element={<CreationsIndex />} />
        <Route path="criacoes/:campaignId" element={<Pieces />} />
        <Route path="pecas/:pieceId" element={<BlockedPiece />} />
        <Route path="aprovacoes" element={<Approvals />} />
        <Route path="regras" element={<BrandRules />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
