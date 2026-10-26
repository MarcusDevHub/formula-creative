import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import { formatPrice } from '../components/PiecePreview.jsx';
import { api, AUDIENCES, CHANNELS } from '../api/api.js';

const label = (list, id) => list.find((x) => x.id === id)?.fullLabel || id;

export default function Approvals() {
  const [params, setParams] = useSearchParams();
  const [items, setItems] = useState(null); // fila carregada uma vez; o status de cada item muda localmente
  const [mode, setMode] = useState('review'); // review | rejecting
  const [reason, setReason] = useState('');
  const [createRule, setCreateRule] = useState(true);
  const [busy, setBusy] = useState(false);
  const [lastRule, setLastRule] = useState(null);

  useEffect(() => {
    api.listApprovals().then((list) => setItems(list.map((p) => ({ ...p, decision: null }))));
  }, []);

  const selectedId = params.get('peca') || items?.[0]?.id;
  const cur = items?.find((p) => p.id === selectedId) || items?.[0];

  useEffect(() => {
    setMode('review');
    setReason('');
    setCreateRule(true);
    setLastRule(null);
  }, [selectedId]);

  if (!items) return <p className="loading">Carregando…</p>;

  const pending = items.filter((p) => !p.decision).length;
  const select = (id) => setParams({ peca: id });
  const mark = (id, decision) => {
    setItems((list) => list.map((p) => (p.id === id ? { ...p, decision } : p)));
    window.dispatchEvent(new Event('formula:approvals-changed'));
  };

  const approve = async () => {
    setBusy(true);
    await api.approvePiece(cur.id);
    mark(cur.id, 'approved');
    setBusy(false);
  };

  const reject = async () => {
    setBusy(true);
    const r = await api.rejectPiece(cur.id, { reason, createRule });
    mark(cur.id, 'rejected');
    setLastRule(r.rule);
    setMode('review');
    setBusy(false);
  };

  return (
    <div className="container" style={{ gap: 24 }}>
      <div className="row-between" style={{ alignItems: 'flex-start', flexWrap: 'wrap', gap: 14 }}>
        <div className="stack" style={{ gap: 6 }}>
          <h1 className="page-title">Aprovações</h1>
          <p className="page-sub">{pending ? `${pending} peças esperando você` : 'Tudo revisado por aqui.'}</p>
        </div>
        <button
          type="button"
          className="chip chip-sm"
          onClick={() => {
            const slangPiece = items.find((x) => x.id.includes('a25-sto-2') || x.title?.includes('Bora') || x.reviewReason);
            if (slangPiece) select(slangPiece.id);
          }}
          style={{ background: 'var(--blq-bg)', color: 'var(--blq)', borderColor: '#f0a0ac', fontWeight: 500 }}
        >
          🧪 Simular desvio de tom da marca (Gíria fora do tom)
        </button>
      </div>

      {items.length === 0 ? (
        <div className="empty">Nenhuma peça esperando aprovação.</div>
      ) : (
        <div className="row">
          <ul aria-label="Fila" style={{ flex: '1 1 260px', minWidth: 0, listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {items.map((p) => {
              const on = p.id === cur.id;
              const st = p.decision === 'approved' ? ['Aprovada', 'var(--ok)'] : p.decision === 'rejected' ? ['Reprovada', 'var(--blq)'] : ['Esperando', '#8A5300'];
              return (
                <li key={p.id}>
                  <button type="button" onClick={() => select(p.id)} aria-current={on || undefined}
                    style={{ width: '100%', textAlign: 'left', border: `2px solid ${on ? 'var(--blue)' : 'var(--line)'}`, background: '#fff', borderRadius: 18, padding: 10, display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text)' }}>
                    <span aria-hidden="true" style={{ width: 56, height: 56, borderRadius: 12, flex: 'none', background: p.imageUrl ? `center / cover url(${p.imageUrl})` : p.color }} />
                    <span style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
                      <span style={{ fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</span>
                      <span style={{ fontSize: 13, color: st[1] }}>{st[0]}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="card" style={{ flex: '2.6 1 520px', minWidth: 0, borderRadius: 26, padding: 28, display: 'flex', flexWrap: 'wrap', gap: 32 }}>
            <div role="img" aria-label="Prévia da peça" style={{ flex: 'none', width: 300, maxWidth: '100%', height: 375, borderRadius: 20, overflow: 'hidden', boxShadow: '0 16px 36px rgba(13,18,56,.18)', display: 'flex', flexDirection: 'column', background: cur.imageUrl ? `center / cover url(${cur.imageUrl})` : cur.color }}>
              <div style={{ flex: 1, padding: 26, display: 'flex', alignItems: 'flex-end' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, lineHeight: 1.08, letterSpacing: '-0.02em', color: '#fff' }}>{cur.title}</span>
              </div>
              <div style={{ background: '#fff', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{cur.productName}</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#fff', background: 'var(--red)', borderRadius: 8, padding: '4px 8px', whiteSpace: 'nowrap' }}>{formatPrice(cur.price)}</span>
              </div>
            </div>

            <div style={{ flex: '1 1 280px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 22 }}>
              <span style={{ fontSize: 14, color: 'var(--muted)' }}>{label(CHANNELS, cur.format)} · {label(AUDIENCES, cur.audience)} · {cur.campaignName}</span>
              <div className="note note-warn" style={{ padding: 16 }}>
                <Icon name="alert" size={22} strokeWidth={2} style={{ color: '#8A5300', flex: 'none' }} />
                <span className="stack" style={{ gap: 4 }}>
                  <span style={{ fontWeight: 500, fontSize: 16 }}>Precisa do seu olhar</span>
                  <span style={{ fontSize: 15, color: 'var(--text-2)' }}>{cur.reviewReason}</span>
                </span>
              </div>

              {!cur.decision && mode === 'review' && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 'auto' }}>
                  <button type="button" className="btn btn-green btn-lg" style={{ flex: '1 1 140px' }} onClick={approve} disabled={busy}>
                    <Icon name="check" size={20} strokeWidth={2.6} /> Aprovar
                  </button>
                  <button type="button" className="btn btn-danger-outline btn-lg" style={{ flex: '1 1 140px' }} onClick={() => { setMode('rejecting'); setReason(cur.suggestedRule?.text || ''); }} disabled={busy}>
                    <Icon name="x" size={20} strokeWidth={2.6} /> Reprovar
                  </button>
                </div>
              )}

              {!cur.decision && mode === 'rejecting' && (
                <div className="stack" style={{ gap: 14 }}>
                  <label className="field">O que está errado?
                    <textarea className="textarea" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} style={{ fontSize: 15 }} />
                  </label>
                  <label className="note" style={{ color: 'var(--text)', fontSize: 15, background: 'var(--blue-soft)' }}>
                    <input type="checkbox" checked={createRule} onChange={(e) => setCreateRule(e.target.checked)} style={{ width: 20, height: 20, accentColor: '#1F45FF', flex: 'none', margin: 0 }} />
                    Não deixar isso acontecer de novo (salva como regra da marca)
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    <button type="button" className="btn btn-outline" onClick={() => setMode('review')}>Cancelar</button>
                    <button type="button" className="btn btn-danger" onClick={reject} disabled={busy || !reason.trim()}>Confirmar reprovação</button>
                  </div>
                </div>
              )}

              {cur.decision === 'approved' && (
                <div className="note note-ok" style={{ padding: 18, fontSize: 16, color: 'var(--ok)', fontWeight: 500 }}>
                  <Icon name="check" size={20} strokeWidth={2.6} /> Aprovada e pronta para publicar.
                </div>
              )}
              {cur.decision === 'rejected' && (
                <div className="stack" style={{ gap: 10, background: 'var(--blue-soft)', borderRadius: 16, padding: 18 }}>
                  <span style={{ fontWeight: 500, fontSize: 16, color: 'var(--blue)' }}>Reprovada.{lastRule ? ' Regra nova salva.' : ''}</span>
                  {lastRule && <span style={{ fontSize: 15, color: 'var(--text-2)' }}>“{lastRule.text}”</span>}
                  <Link to="/app/regras" style={{ fontSize: 15, fontWeight: 500, textDecoration: 'none' }}>Ver regras da marca</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
