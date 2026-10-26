import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import Stepper from '../components/Stepper.jsx';
import PiecePreview from '../components/PiecePreview.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import useAsync from '../components/useAsync.js';
import { api, AUDIENCES, CHANNELS } from '../api/api.js';

const STATUS_FILTERS = [
  { id: '', label: 'Todas', dot: '#8A93B5' },
  { id: 'ok', label: 'Liberadas', dot: '#12A150' },
  { id: 'review', label: 'Para revisar', dot: '#E8A317' },
  { id: 'blocked', label: 'Bloqueadas', dot: '#C8102E' },
];

// Para onde o clique em cada peça leva.
const pieceLink = (p) =>
  p.status === 'blocked' ? `/app/pecas/${p.id}` : p.status === 'review' ? `/app/aprovacoes?peca=${p.id}` : null;

export default function Pieces() {
  const { campaignId } = useParams();
  const campaign = useAsync(() => api.getCampaign(campaignId), [campaignId]);
  // Carrega todas as peças uma vez e filtra no front (para mostrar as contagens).
  const pieces = useAsync(() => api.listPieces(campaignId), [campaignId]);
  const [status, setStatus] = useState('');
  const [aud, setAud] = useState('');
  const [fmt, setFmt] = useState('');
  const [toast, setToast] = useState('');
  const [publishing, setPublishing] = useState(false);

  const all = pieces.data || [];
  const base = useMemo(() => all.filter((p) => (!aud || p.audience === aud) && (!fmt || p.format === fmt)), [all, aud, fmt]);
  const visible = base.filter((p) => !status || p.status === status);
  const count = (s) => (s ? base.filter((p) => p.status === s).length : base.length);
  const okCount = all.filter((p) => p.status === 'ok').length;

  const audiences = AUDIENCES.filter((a) => campaign.data?.audiences.includes(a.id));
  const channels = CHANNELS.filter((c) => campaign.data?.channels.includes(c.id));

  const publish = async () => {
    setPublishing(true);
    const r = await api.publishApproved(campaignId);
    setPublishing(false);
    setToast(`${r.published} peças enviadas para publicação.`);
    setTimeout(() => setToast(''), 3500);
  };

  const filterRow = (label, items, value, onChange) => (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
      <span style={{ width: 90, fontSize: 14, fontWeight: 500, color: 'var(--text-2)' }}>{label}</span>
      {items.map((it) => (
        <button key={it.id || 'all'} type="button" aria-pressed={value === it.id}
          className={`chip chip-sm${value === it.id ? ' is-on' : ''}`} onClick={() => onChange(it.id)}>
          {it.dot && <span className="dot" style={{ background: it.dot }} />}
          {it.label}{it.n !== undefined ? ` · ${it.n}` : ''}
        </button>
      ))}
    </div>
  );

  return (
    <div className="container" style={{ maxWidth: 1180, gap: 26 }}>
      <Stepper current={4} campaignId={campaignId} />

      <header className="row-between">
        <div className="stack" style={{ gap: 6 }}>
          <h1 className="page-title">{campaign.data?.name || '…'}</h1>
          <p className="page-sub">{all.length} peças criadas · a Formula já conferiu todas</p>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <button type="button" className="btn btn-outline"><Icon name="download" size={18} strokeWidth={2} /> Baixar</button>
          <button type="button" className="btn btn-primary" onClick={publish} disabled={publishing || !okCount}>
            {publishing ? <span className="spinner" /> : `Publicar liberadas (${okCount})`}
          </button>
        </div>
      </header>

      {toast && <div className="note note-ok" role="status"><Icon name="check" size={18} strokeWidth={2.6} style={{ color: 'var(--ok)' }} />{toast}</div>}

      <section aria-label="Filtros" className="card" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {filterRow('Situação', STATUS_FILTERS.map((s) => ({ ...s, n: count(s.id) })), status, setStatus)}
        {filterRow('Público', [{ id: '', label: 'Todos' }, ...audiences.map((a) => ({ id: a.id, label: a.label }))], aud, setAud)}
        {filterRow('Formato', [{ id: '', label: 'Todos' }, ...channels.map((c) => ({ id: c.id, label: c.label }))], fmt, setFmt)}
      </section>

      <span style={{ fontSize: 15, color: 'var(--muted)' }}>{visible.length} peças</span>

      {pieces.loading && <p className="loading">Carregando peças…</p>}
      {!pieces.loading && visible.length === 0 && <div className="empty">Nenhuma peça com esses filtros.</div>}

      <div className="note" style={{ background: '#f3f5fd', border: '1px solid #dfe5ff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <span>
          💡 <strong>Dica de navegação:</strong> Clique em uma peça Bloqueada (vermelha) para testar a auto-correção da IA ou em Para revisar (amarela) para criar uma nova regra viva no Brand Kernel.
        </span>
        <button
          type="button"
          className="chip chip-sm"
          onClick={() => setStatus(status === 'blocked' ? '' : 'blocked')}
          style={{ background: status === 'blocked' ? 'var(--blq)' : 'var(--blq-bg)', color: status === 'blocked' ? '#fff' : 'var(--blq)', borderColor: '#f0a0ac', fontWeight: 500, flex: 'none' }}
        >
          {status === 'blocked' ? '✓ Vendo peças barradas' : '🧪 Simular filtro de peças barradas'}
        </button>
      </div>

      <div className="grid-auto">
        {visible.map((p) => {
          const link = pieceLink(p);
          const inner = (
            <>
              <div className="thumb-stage"><PiecePreview piece={p} /></div>
              <div className="thumb-meta">
                <span>{CHANNELS.find((c) => c.id === p.format)?.label} · {AUDIENCES.find((a) => a.id === p.audience)?.label}</span>
                <StatusBadge status={p.status} />
              </div>
            </>
          );
          return link ? (
            <Link key={p.id} to={link} className="thumb-card">{inner}</Link>
          ) : (
            <div key={p.id} className="thumb-card">{inner}</div>
          );
        })}
      </div>
    </div>
  );
}
