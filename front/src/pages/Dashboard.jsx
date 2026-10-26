import { Link } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import PiecePreview from '../components/PiecePreview.jsx';
import useAsync from '../components/useAsync.js';
import { api, AUDIENCES, CHANNELS, isMock } from '../api/api.js';
import '../styles/dashboard.css';

// Para onde cada campanha leva, de acordo com a etapa em que ela está.
const campaignLink = (c) => {
  switch (c.status) {
    case 'rascunho': return '/app/campanhas/nova';
    case 'ideias': return `/app/campanhas/${c.id}/ideias`;
    case 'estudio': return `/app/campanhas/${c.id}/estudio`;
    default: return `/app/criacoes/${c.id}`;
  }
};

const STATUS_LABEL = { rascunho: 'Rascunho', ideias: 'Escolhendo ideia', estudio: 'No estúdio', publicada: 'Publicada' };
const CAMPAIGN_COLORS = [
  'linear-gradient(135deg, #3D63FF, #1533D6)',
  'linear-gradient(135deg, #FF5A6E, #D30A26)',
  'linear-gradient(135deg, #8C6BFF, #4A1FE8)',
];

export default function Dashboard() {
  const approvals = useAsync(() => api.listApprovals(), []);
  const campaigns = useAsync(() => api.listCampaigns(), []);

  const label = (list, id) => list.find((x) => x.id === id)?.label || id;
  const totals = campaigns.data?.reduce((sum, campaign) => ({
    all: sum.all + (campaign.totals?.all || 0),
    ok: sum.ok + (campaign.totals?.ok || 0),
    blocked: sum.blocked + (campaign.totals?.blocked || 0),
  }), { all: 0, ok: 0, blocked: 0 });
  const metrics = [
    {
      label: 'Escala de produção',
      value: totals ? totals.all.toLocaleString('pt-BR') : '—',
      title: 'peças no portfólio',
      detail: 'Volume total produzido ou publicado nas campanhas.',
      icon: 'grid',
      tone: 'blue',
    },
    {
      label: 'Prontas para avançar',
      value: totals ? totals.ok.toLocaleString('pt-BR') : '—',
      title: 'peças liberadas nos checks',
      detail: 'Passaram pelas verificações automáticas e seguem no fluxo.',
      icon: 'checkCircle',
      tone: 'green',
    },
    {
      label: 'Governança',
      value: totals ? totals.blocked.toLocaleString('pt-BR') : '—',
      title: 'riscos bloqueados',
      detail: 'Peças sinalizadas antes de avançar para publicação.',
      icon: 'shield',
      tone: 'red',
    },
    {
      label: 'Próxima ação',
      value: approvals.data ? approvals.data.length.toLocaleString('pt-BR') : '—',
      title: 'aguardando revisão',
      detail: 'Aprovações humanas que ainda precisam de uma decisão.',
      icon: 'clock',
      tone: 'violet',
    },
  ];

  return (
    <div className="container dashboard-container" style={{ gap: 40, maxWidth: 1120 }}>
      <header className="row-between" style={{ alignItems: 'center' }}>
        <h1 className="page-title" style={{ fontSize: 40 }}>
          Olá! O que vamos <span className="gradient-text">criar hoje?</span>
        </h1>
        <Link to="/app/campanhas/nova" className="btn btn-primary btn-lg"><Icon name="plus" strokeWidth={2.2} /> Nova campanha</Link>
      </header>

      <section className="dashboard-metrics" aria-labelledby="metrics-title">
        <div className="dashboard-metrics-heading">
          <div>
            <h2 id="metrics-title" className="section-title">Valor da operação</h2>
            <p>Escala criativa, governança e velocidade no mesmo fluxo.</p>
          </div>
          {isMock && <span className="dashboard-demo-label">Cenário de demonstração</span>}
        </div>
        <div className="dashboard-metrics-grid">
          {metrics.map((metric) => (
            <article key={metric.label} className={`dashboard-metric-card metric-${metric.tone}`}>
              <div className="dashboard-metric-top">
                <span>{metric.label}</span>
                <span className="dashboard-metric-icon"><Icon name={metric.icon} size={19} /></span>
              </div>
              <strong className="dashboard-metric-value">{metric.value}</strong>
              <span className="dashboard-metric-title">{metric.title}</span>
              <p>{metric.detail}</p>
            </article>
          ))}
        </div>
        {isMock && <p className="dashboard-metrics-note">Indicadores calculados a partir dos dados mockados da demonstração; não representam resultados ou ROI medidos.</p>}
      </section>

      <section className="stack" style={{ gap: 16 }} aria-labelledby="t-aprov">
        <div className="row-between" style={{ alignItems: 'baseline' }}>
          <h2 id="t-aprov" className="section-title">Esperando sua aprovação</h2>
          <Link to="/app/aprovacoes" style={{ fontSize: 15, fontWeight: 500, textDecoration: 'none' }}>Ver todas</Link>
        </div>
        {approvals.loading && <p className="loading">Carregando…</p>}
        {approvals.error && <p className="form-error">{approvals.error}</p>}
        {approvals.data && approvals.data.length === 0 && <div className="empty">Nada esperando por você agora.</div>}
        {approvals.data && approvals.data.length > 0 && (
          <div className="grid-auto" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
            {approvals.data.slice(0, 4).map((p) => (
              <Link key={p.id} to={`/app/aprovacoes?peca=${p.id}`} className="thumb-card" style={{ padding: 12 }}>
                <PiecePreview piece={p} width="100%" height={170} titleSize={17} />
                <span className="thumb-meta">
                  <span>{label(CHANNELS, p.format)} · {label(AUDIENCES, p.audience)}</span>
                  <span style={{ color: 'var(--blue)', fontWeight: 500 }}>Revisar</span>
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="stack" style={{ gap: 16 }} aria-labelledby="t-camp">
        <h2 id="t-camp" className="section-title">Suas campanhas</h2>
        {campaigns.loading && <p className="loading">Carregando…</p>}
        {campaigns.error && <p className="form-error">{campaigns.error}</p>}
        <div className="stack" style={{ gap: 12 }}>
          {campaigns.data?.map((c, i) => (
            <Link key={c.id} to={campaignLink(c)} className="card" style={{ textDecoration: 'none', color: 'inherit', padding: '16px 20px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 18 }}>
              <span aria-hidden="true" style={{ width: 56, height: 56, borderRadius: 14, background: CAMPAIGN_COLORS[i % CAMPAIGN_COLORS.length], flex: 'none' }} />
              <span style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontWeight: 500, fontSize: 17 }}>{c.name}</span>
                <span style={{ fontSize: 14, color: 'var(--muted)' }}>
                  {c.totals.all ? `${c.totals.all} peças` : 'Sem peças ainda'}{c.period ? ` · ${c.period}` : ''}
                </span>
              </span>
              <span style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {c.status === 'em_revisao' ? (
                  <>
                    <span className="badge badge-ok">{c.totals.ok} liberadas</span>
                    <span className="badge badge-rev">{c.totals.review} para revisar</span>
                    <span className="badge badge-blq-soft">{c.totals.blocked} bloqueadas</span>
                  </>
                ) : (
                  <span className="badge badge-muted">{STATUS_LABEL[c.status] || c.status}</span>
                )}
              </span>
              <Icon name="chevronRight" style={{ color: '#8A93B5' }} />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
