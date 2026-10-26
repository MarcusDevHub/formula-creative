import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import { formatPrice } from '../components/PiecePreview.jsx';
import useAsync from '../components/useAsync.js';
import { api, AUDIENCES, CHANNELS } from '../api/api.js';

export default function BlockedPiece() {
  const { pieceId } = useParams();
  const { data: piece, loading, error, setData } = useAsync(() => api.getPiece(pieceId), [pieceId]);
  const [fixing, setFixing] = useState(false);

  if (loading) return <p className="loading">Carregando…</p>;
  if (error) return <p className="form-error">{error}</p>;

  const blocked = piece.status === 'blocked';
  const okChecks = piece.checks.filter((k) => k.ok).map((k) => k.label.toLowerCase());
  const bg = piece.imageUrl ? `center / cover url(${piece.imageUrl})` : piece.color;

  const fix = async () => {
    setFixing(true);
    setData(await api.applyFix(piece.id));
    setFixing(false);
  };

  return (
    <div className="container" style={{ maxWidth: 1120, gap: 24 }}>
      <Link to={`/app/criacoes/${piece.campaignId}`} className="link-btn"><Icon name="arrowLeft" size={18} strokeWidth={2} /> Voltar para criações</Link>

      <div className="row" style={{ gap: 28 }}>
        <div className="card" style={{ flex: '0 1 340px', minWidth: 0, borderRadius: 26, padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <div role="img" aria-label="Prévia da peça" style={{ position: 'relative', width: 280, maxWidth: '100%', height: 498, borderRadius: 20, overflow: 'hidden', background: bg, boxShadow: '0 18px 40px rgba(13,18,56,.22)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '70px 22px 0' }}>
              <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 32, lineHeight: 1.06, letterSpacing: '-0.02em', color: '#fff' }}>{piece.title}</p>
            </div>
            <div style={{ marginTop: 'auto', padding: '0 20px 16px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 10 }}>
              <span style={{ width: 110, height: 110, borderRadius: 16, background: '#fff', padding: 12, display: 'flex', alignItems: 'flex-end', fontSize: 12, fontWeight: 600, lineHeight: 1.2 }}>{piece.productName}</span>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, color: '#fff', background: 'var(--red)', borderRadius: 14, padding: '10px 14px' }}>{formatPrice(piece.price)}</span>
            </div>
            {piece.warning ? (
              <div style={{ margin: '0 14px 14px', minHeight: 48, background: '#fff', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px 12px', fontSize: 10, fontWeight: 600, textAlign: 'center' }}>{piece.warning}</div>
            ) : (
              <div style={{ margin: '0 14px 14px', minHeight: 48, border: '2px dashed rgba(255,255,255,.8)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#fff' }}>aviso obrigatório faltando</div>
            )}
          </div>
          <span style={{ fontSize: 14, color: 'var(--muted)' }}>
            {CHANNELS.find((c) => c.id === piece.format)?.label} · {AUDIENCES.find((a) => a.id === piece.audience)?.label}
          </span>
        </div>

        <div style={{ flex: '1 1 420px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {blocked ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--blq)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name="x" size={22} strokeWidth={2.8} /></span>
                <h1 className="page-title" style={{ fontSize: 32 }}>Esta peça foi bloqueada</h1>
              </div>
              <section className="card" style={{ padding: '8px 24px' }} aria-labelledby="t-mudar">
                <h2 id="t-mudar" style={{ margin: 0, padding: '16px 0 6px', fontSize: 16, fontWeight: 500, color: 'var(--text-2)' }}>O que precisa mudar</h2>
                {piece.issues.map((it, i) => (
                  <div key={i} style={{ display: 'flex', gap: 14, padding: '16px 0', borderTop: '1px solid #F0F2F7' }}>
                    <span style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--red)', color: '#fff', fontWeight: 600, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>{i + 1}</span>
                    <div className="stack" style={{ gap: 4 }}>
                      <span style={{ fontWeight: 500, fontSize: 17 }}>{it.title}</span>
                      <span style={{ fontSize: 15, lineHeight: 1.5, color: 'var(--muted)' }}>{it.detail}</span>
                      {it.source && <span style={{ fontSize: 13, color: 'var(--muted)' }}>Fonte: {it.source}</span>}
                    </div>
                  </div>
                ))}
              </section>
              {piece.suggestion && (
                <section style={{ background: 'var(--blue-soft)', borderRadius: 22, padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 14 }} aria-labelledby="t-sug">
                  <h2 id="t-sug" style={{ margin: 0, fontSize: 16, fontWeight: 500, color: 'var(--blue)' }}>Sugestão da Formula</h2>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, letterSpacing: '-0.02em' }}>“{piece.suggestion.title}”</span>
                  {piece.suggestion.addsWarning && <span style={{ fontSize: 15, color: 'var(--text-2)' }}>+ aviso obrigatório no rodapé</span>}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, paddingTop: 4 }}>
                    <button type="button" className="btn btn-blue" onClick={fix} disabled={fixing}>
                      {fixing ? <span className="spinner" /> : <><Icon name="check" size={18} strokeWidth={2.4} /> Aplicar correção</>}
                    </button>
                    <Link to={`/app/campanhas/${piece.campaignId}/estudio`} className="btn btn-outline">Editar no estúdio</Link>
                  </div>
                </section>
              )}
            </>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--ok)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name="check" size={22} strokeWidth={2.8} /></span>
                <h1 className="page-title" style={{ fontSize: 32 }}>Pronto, peça liberada</h1>
              </div>
              <p className="page-sub">A Formula conferiu de novo e está tudo certo.</p>
              <Link to={`/app/criacoes/${piece.campaignId}`} className="btn btn-dark" style={{ alignSelf: 'flex-start' }}>Voltar para criações</Link>
            </>
          )}
          {okChecks.length > 0 && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--ok)' }}>
              <Icon name="check" size={16} strokeWidth={2.6} />Tudo certo: {okChecks.join(', ')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
