import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import Stepper from '../components/Stepper.jsx';
import { formatPrice } from '../components/PiecePreview.jsx';
import logo from '../assets/logo.png';
import { api } from '../api/api.js';

const FORMATS = [
  { id: 'feed', label: 'Instagram', w: 420, h: 420 },
  { id: 'sto', label: 'Stories', w: 300, h: 534 },
  { id: 'wpp', label: 'WhatsApp', w: 380, h: 475 },
  { id: 'ban', label: 'Banner do site', w: 640, h: 320 },
];

const WARNING = 'SE PERSISTIREM OS SINTOMAS, O MÉDICO DEVERÁ SER CONSULTADO.';

// Estúdio: onde a peça principal é criada com o Gemini e conferida em tempo real.
export default function Studio() {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [product, setProduct] = useState(null);
  const [prompt, setPrompt] = useState('Caixa do remédio sobre uma mesa de madeira, xícara de chá ao lado, luz suave de manhã de inverno.');
  const [versions, setVersions] = useState([]);
  const [versionId, setVersionId] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [format, setFormat] = useState('feed');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [check, setCheck] = useState({ checks: [], issues: [] });
  const [approving, setApproving] = useState(false);
  const [error, setError] = useState('');

  const generate = async () => {
    setGenerating(true);
    setError('');
    try {
      const v = await api.generateImages(campaignId, { prompt, productId: product?.id, format });
      setVersions(v);
      setVersionId(v[0]?.id || null);
    } catch (e) {
      setError(e.message);
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    (async () => {
      const c = await api.getCampaign(campaignId);
      setCampaign(c);
      setTitle(c.chosenIdea?.title || c.name);
      setSubtitle(c.chosenIdea?.support || '');
      const products = await api.listProducts('');
      setProduct(products.find((p) => p.id === c.productIds[0]) || products[0]);
    })().catch((e) => setError(e.message));
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId]);

  // Confere o texto sempre que ele muda (com um pequeno atraso).
  useEffect(() => {
    if (!title) return;
    const t = setTimeout(() => api.checkDraft(campaignId, { title, subtitle, versionId }).then(setCheck), 400);
    return () => clearTimeout(t);
  }, [campaignId, title, subtitle, versionId]);

  const applyFix = (issue) => {
    if (issue.fix?.field === 'subtitle') setSubtitle(issue.fix.value);
    if (issue.fix?.field === 'title') setTitle(issue.fix.value);
  };

  const approve = async () => {
    setApproving(true);
    try {
      await api.approveMaster(campaignId, { versionId, title, subtitle });
      navigate(`/app/criacoes/${campaignId}`);
    } catch (e) {
      setError(e.message);
      setApproving(false);
    }
  };

  const fmt = FORMATS.find((f) => f.id === format);
  const version = versions.find((v) => v.id === versionId);
  const bg = version?.imageUrl ? `center / cover url(${version.imageUrl})` : version?.background || '#C9CEDC';
  const pending = check.issues.length;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <header style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '14px 24px', padding: '14px 24px', background: '#fff', borderBottom: '1px solid var(--line)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <Link to="/app" aria-label="Formula, início"><img src={logo} alt="Formula" style={{ display: 'block', width: 70 }} /></Link>
          <span className="stack" style={{ gap: 2 }}>
            <span style={{ fontWeight: 500, fontSize: 16 }}>{campaign?.name || '…'}</span>
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>Peça principal</span>
          </span>
        </div>
        <Stepper current={3} campaignId={campaignId} compact />
        <button type="button" className="btn btn-outline btn-sm">Salvar rascunho</button>
      </header>

      <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', alignItems: 'stretch', maxWidth: '100%', overflowX: 'hidden' }}>
        {/* Esquerda: pedido para a IA */}
        <aside aria-label="Ajustes da imagem" style={{ flex: '1 1 290px', maxWidth: '100%', background: '#fff', borderRight: '1px solid var(--line)', padding: 22, display: 'flex', flexDirection: 'column', gap: 22 }}>
          <section className="stack" style={{ gap: 10 }}>
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 500 }}>Produto</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, border: '1px solid var(--line)', borderRadius: 16, padding: 10 }}>
              <span aria-hidden="true" style={{ width: 52, height: 52, borderRadius: 12, background: '#F2F4FA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {product?.imageUrl
                  ? <img src={product.imageUrl} alt="" style={{ width: 44, height: 44, objectFit: 'contain' }} />
                  : <span style={{ width: 22, height: 30, borderRadius: 4, background: '#fff', boxShadow: '0 2px 6px rgba(13,18,56,.18)', borderTop: '6px solid var(--blue)' }} />}
              </span>
              <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: 15, fontWeight: 500 }}>{product?.name || '…'}</span>
                <span style={{ fontSize: 13, color: 'var(--muted)' }}>Foto oficial do catálogo</span>
              </span>
              <span style={{ fontSize: 14, fontWeight: 500 }}>{formatPrice(campaign?.promoPrice || product?.price)}</span>
            </div>
          </section>

          <label className="field" style={{ fontSize: 15 }}>
            Descreva a imagem
            <textarea className="textarea" rows={4} value={prompt} onChange={(e) => setPrompt(e.target.value)} style={{ fontSize: 14 }} />
          </label>

          <button type="button" className="btn btn-brand btn-lg btn-block" onClick={generate} disabled={generating}>
            {generating ? <><span className="spinner" /> Gerando…</> : <><Icon name="sparkle" size={18} /> Gerar imagem</>}
          </button>

          {versions.length > 0 && (
            <section className="stack" style={{ gap: 10 }}>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 500 }}>Versões geradas</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10 }}>
                {versions.map((v, i) => (
                  <button key={v.id} type="button" aria-pressed={v.id === versionId} aria-label={`Versão ${i + 1}`} onClick={() => setVersionId(v.id)}
                    style={{
                      height: 84, borderRadius: 14, padding: 8, display: 'flex', alignItems: 'flex-end',
                      border: `2.5px solid ${v.id === versionId ? 'var(--blue)' : 'transparent'}`,
                      background: v.imageUrl ? `center / cover url(${v.imageUrl})` : v.background,
                    }}>
                    <span style={{ fontSize: 12, fontWeight: 500, color: '#fff', background: 'rgba(13,18,56,.55)', borderRadius: 8, padding: '3px 7px' }}>Versão {i + 1}</span>
                  </button>
                ))}
              </div>
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>Escolha a que mais combina com a ideia.</span>
            </section>
          )}

          <section className="stack" style={{ gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 500 }}>Texto da peça</span>
              <button
                type="button"
                className="chip chip-sm"
                onClick={() => {
                  setTitle('Cura garantida da gripe');
                  setSubtitle('Alívio imediato sem qualquer contraindicação');
                }}
                style={{ background: 'var(--blq-bg)', color: 'var(--blq)', borderColor: '#f0a0ac', fontSize: 12, minHeight: 32, padding: '0 10px' }}
              >
                🧪 Simular infração na arte (Cura vedada)
              </button>
            </div>
            <label className="field" style={{ fontSize: 15 }}>Título<input className="input" value={title} onChange={(e) => setTitle(e.target.value)} style={{ fontSize: 14, minHeight: 44 }} /></label>
            <label className="field" style={{ fontSize: 15 }}>Frase de apoio<input className="input" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} style={{ fontSize: 14, minHeight: 44 }} /></label>
          </section>
          {error && <span className="form-error" role="alert">{error}</span>}
        </aside>

        {/* Centro: prévia */}
        <main style={{ flex: '999 1 460px', minWidth: 0, maxWidth: '100%', overflowX: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, padding: 24, backgroundColor: '#F3F4F9', backgroundImage: 'radial-gradient(#D9DDEA 1px, transparent 1px)', backgroundSize: '18px 18px' }}>
          <div role="tablist" aria-label="Formato da prévia" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, background: '#fff', border: '1px solid var(--line)', borderRadius: 999, padding: 5 }}>
            {FORMATS.map((f) => (
              <button key={f.id} type="button" role="tab" aria-selected={f.id === format} onClick={() => setFormat(f.id)}
                className={`chip chip-sm${f.id === format ? ' is-on' : ''}`} style={{ border: 0 }}>
                {f.label}
              </button>
            ))}
          </div>

          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
            <div role="img" aria-label="Prévia da peça" style={{ position: 'relative', width: '100%', maxWidth: fmt.w, aspectRatio: `${fmt.w} / ${fmt.h}`, borderRadius: 20, overflow: 'hidden', background: bg, boxShadow: '0 24px 50px rgba(13,18,56,.22)', display: 'flex', flexDirection: 'column', opacity: generating ? 0.5 : 1, transition: 'opacity .2s' }}>
              <span className="badge" style={{ position: 'absolute', top: 14, left: 14, background: 'rgba(255,255,255,.92)', color: 'var(--text)', fontSize: 12 }}>
                <Icon name="sparkle" size={12} style={{ color: 'var(--violet)' }} /> Gerada com Gemini
              </span>
              <span style={{ position: 'absolute', top: 14, right: 14, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: '#fff', background: 'var(--red)', borderRadius: 12, padding: '7px 12px' }}>
                {formatPrice(campaign?.promoPrice || product?.price)}
              </span>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 30 }}>
                {!version?.imageUrl && (
                  <span aria-hidden="true" style={{ width: 92, height: 124, borderRadius: 10, background: '#fff', boxShadow: '0 18px 30px rgba(0,0,0,.28)', transform: 'rotate(-6deg)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <span style={{ height: 34, background: 'var(--blue)' }} />
                    <span style={{ padding: 10, fontSize: 11, fontWeight: 600, lineHeight: 1.2, color: 'var(--text)' }}>{product?.name}</span>
                  </span>
                )}
              </div>
              <div style={{ padding: '0 22px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26, lineHeight: 1.08, letterSpacing: '-0.02em', color: '#fff', textShadow: '0 2px 12px rgba(0,0,0,.35)' }}>{title}</span>
                <span style={{ fontSize: 15, color: '#fff', textShadow: '0 1px 8px rgba(0,0,0,.4)' }}>{subtitle}</span>
              </div>
              <div style={{ background: 'var(--navy)', color: '#fff', fontSize: 10, fontWeight: 500, letterSpacing: '.04em', textAlign: 'center', padding: '9px 12px' }}>{WARNING}</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, background: '#fff', border: '1px solid var(--line)', borderRadius: 999, padding: 5 }}>
            <button type="button" className="chip chip-sm" style={{ border: 0 }} onClick={generate}><Icon name="refresh" size={16} strokeWidth={2} />Outra versão</button>
            <button type="button" className="chip chip-sm" style={{ border: 0 }}><Icon name="type" size={16} strokeWidth={2} />Trocar título</button>
            <button type="button" className="chip chip-sm" style={{ border: 0 }}><Icon name="sun" size={16} strokeWidth={2} />Ajustar luz</button>
          </div>
        </main>

        {/* Direita: conferência */}
        <aside aria-label="Conferência" style={{ flex: '1 1 300px', maxWidth: '100%', background: '#fff', borderLeft: '1px solid var(--line)', padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 500 }}>Conferência da Formula</h2>
          {check.checks.map((k) => (
            <div key={k.id} className="note note-ok"><Icon name="check" size={18} strokeWidth={2.6} style={{ color: 'var(--ok)', flex: 'none' }} />{k.label}</div>
          ))}
          {check.issues.map((it, i) => (
            <div key={i} className="note note-warn" style={{ flexDirection: 'column', gap: 10 }}>
              <span style={{ display: 'flex', gap: 10 }}>
                <Icon name="alert" size={18} strokeWidth={2} style={{ color: '#8A5300', flex: 'none' }} />
                <span><strong style={{ fontWeight: 500 }}>{it.title}</strong> {it.detail}</span>
              </span>
              {it.fix && (
                <button type="button" className="btn btn-sm btn-block" onClick={() => applyFix(it)} style={{ background: '#fff', borderColor: '#E8C26A', color: '#6B3F00' }}>
                  Corrigir texto
                </button>
              )}
            </div>
          ))}
          {pending === 0 && check.checks.length > 0 && (
            <div className="note note-ok"><Icon name="check" size={18} strokeWidth={2.6} style={{ color: 'var(--ok)', flex: 'none' }} />Texto dentro do que a bula permite</div>
          )}

          <div className="stack" style={{ marginTop: 'auto', gap: 10, paddingTop: 16 }}>
            {pending > 0 && <span style={{ fontSize: 13, color: '#8A5300', textAlign: 'center' }}>Resolva {pending} ajuste{pending > 1 ? 's' : ''} para continuar</span>}
            <button type="button" className="btn btn-green btn-lg btn-block" disabled={pending > 0 || !versionId || approving} onClick={approve}>
              {approving ? <span className="spinner" /> : <><Icon name="check" size={18} strokeWidth={2.6} /> Aprovar e criar os formatos</>}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
