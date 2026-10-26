import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import Stepper from '../components/Stepper.jsx';
import { api } from '../api/api.js';

export default function Ideas() {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const [ideas, setIdeas] = useState([]);
  const [selected, setSelected] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const generate = () => {
    setLoading(true);
    setEditing(false);
    api.generateIdeas(campaignId)
      .then((list) => { setIdeas(list); setSelected(0); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(generate, [campaignId]);

  const updateIdea = (field, value) =>
    setIdeas((list) => list.map((it, i) => (i === selected ? { ...it, [field]: value } : it)));

  const simulateAbusivePromise = () => {
    if (!ideas[selected]) return;
    const forbidden = {
      title: 'Cura definitiva da gripe em 24h garantida',
      support: 'Elimina qualquer dor e febre sem efeitos colaterais.',
    };
    setIdeas((list) => list.map((it, i) => (i === selected ? { ...it, ...forbidden } : it)));
    setError('BLOQUEIO DO FISCAL (Gate 2 — Lei 9.294/96 & CONAR): A promessa de “cura definitiva” e “garantida” viola o Art. 7º da Lei 9.294/96 e as normas da Anvisa. O avanço para o estúdio foi bloqueado até a adequação.');
  };

  const restoreSafeIdea = () => {
    setError('');
    generate();
  };

  const next = async () => {
    setSaving(true);
    try {
      await api.chooseIdea(campaignId, ideas[selected]);
      navigate(`/app/campanhas/${campaignId}/estudio`);
    } catch (e) {
      setError(e.message);
      setSaving(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 1120 }}>
      <Stepper current={2} campaignId={campaignId} />

      <div className="row-between" style={{ flexWrap: 'wrap', gap: 12 }}>
        <div className="stack">
          <h1 className="page-title">Escolha a ideia</h1>
          <p className="page-sub">Ela vira todas as peças da campanha.</p>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
          <button
            type="button"
            className="chip chip-sm"
            onClick={simulateAbusivePromise}
            style={{ background: 'var(--blq-bg)', color: 'var(--blq)', borderColor: '#f0a0ac', fontWeight: 500 }}
          >
            🧪 Simular promessa milagrosa (Gate 2)
          </button>
          <button type="button" className="btn btn-outline" onClick={generate} disabled={loading}>
            <Icon name="refresh" size={18} strokeWidth={2} /> Gerar outras
          </button>
        </div>
      </div>

      {error && (
        <div className="note" style={{ background: 'var(--blq-bg)', border: '1px solid #f0a0ac', color: 'var(--blq)', padding: 14 }}>
          <Icon name="alert" size={18} style={{ color: 'var(--blq)', flex: 'none', marginTop: 2 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 14, fontWeight: 500 }}>{error}</span>
            <button
              type="button"
              className="link-btn"
              onClick={restoreSafeIdea}
              style={{ alignSelf: 'flex-start', color: 'var(--blq)', fontWeight: 600, fontSize: 13, textDecoration: 'underline', padding: 0 }}
            >
              Restaurar ideia regulamentar segura
            </button>
          </div>
        </div>
      )}
      {loading ? (
        <p className="loading">A Formula está pensando em ideias…</p>
      ) : (
        <div role="radiogroup" aria-label="Ideias" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
          {ideas.map((idea, i) => {
            const on = i === selected;
            return (
              <button key={idea.id} type="button" role="radio" aria-checked={on} onClick={() => setSelected(i)}
                style={{
                  textAlign: 'left', background: '#fff', borderRadius: 26, padding: 14, display: 'flex', flexDirection: 'column', gap: 16, color: 'var(--text)',
                  border: `2px solid ${on ? 'var(--blue)' : 'var(--line)'}`, boxShadow: on ? '0 16px 36px rgba(31,69,255,.14)' : 'none',
                }}>
                <span style={{ height: 220, width: '100%', borderRadius: 18, background: idea.color, padding: 22, display: 'flex', flexDirection: 'column', justifyContent: on ? 'space-between' : 'flex-end' }}>
                  {on && (
                    <span className="badge" style={{ alignSelf: 'flex-end', background: '#fff', color: 'var(--blue)' }}>
                      <Icon name="check" size={13} strokeWidth={3} /> Escolhida
                    </span>
                  )}
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 26, lineHeight: 1.12, letterSpacing: '-0.03em', color: '#fff' }}>{idea.title}</span>
                </span>
                <span style={{ fontSize: 15, lineHeight: 1.45, color: 'var(--text-2)', padding: '0 6px 6px' }}>{idea.support}</span>
              </button>
            );
          })}
        </div>
      )}

      {editing && ideas[selected] && (
        <div className="card card-pad stack" style={{ gap: 16 }}>
          <label className="field">Título<input className="input" value={ideas[selected].title} onChange={(e) => updateIdea('title', e.target.value)} /></label>
          <label className="field">Frase de apoio<input className="input" value={ideas[selected].support} onChange={(e) => updateIdea('support', e.target.value)} /></label>
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 12 }}>
        <button type="button" className="btn btn-outline btn-lg" onClick={() => setEditing(!editing)} disabled={loading}>
          <Icon name="edit" size={18} strokeWidth={2} /> {editing ? 'Fechar edição' : 'Editar texto'}
        </button>
        <button type="button" className="btn btn-primary btn-lg" onClick={next} disabled={loading || saving || !ideas.length}>
          {saving ? <span className="spinner" /> : <>Criar a imagem <Icon name="arrowRight" /></>}
        </button>
      </div>
    </div>
  );
}
