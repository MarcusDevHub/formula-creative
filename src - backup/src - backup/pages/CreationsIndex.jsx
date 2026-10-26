import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { api } from '../api/api.js';

// "Criações" no menu: abre a campanha mais recente que já tem peças.
export default function CreationsIndex() {
  const [target, setTarget] = useState(undefined);

  useEffect(() => {
    api.listCampaigns().then((list) => {
      const c = list.find((x) => x.status === 'em_revisao') || list.find((x) => x.totals.all > 0 && x.status !== 'publicada');
      setTarget(c ? c.id : null);
    });
  }, []);

  if (target === undefined) return <p className="loading">Carregando…</p>;
  if (target) return <Navigate to={`/app/criacoes/${target}`} replace />;
  return (
    <div className="container">
      <h1 className="page-title">Criações</h1>
      <div className="empty">
        Nenhuma campanha com peças ainda. <Link to="/app/campanhas/nova">Criar uma campanha</Link>
      </div>
    </div>
  );
}
