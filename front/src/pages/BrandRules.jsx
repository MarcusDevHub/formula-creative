import { useState } from 'react';
import Icon from '../components/Icon.jsx';
import useAsync from '../components/useAsync.js';
import { api } from '../api/api.js';

const CATEGORIES = {
  lei: { label: 'Lei', cls: 'badge-soft-blue' },
  marca: { label: 'Marca', cls: 'badge-blq-soft' },
  preco: { label: 'Preço', cls: 'badge-violet' },
  consumidor: { label: 'Consumidor', cls: 'badge-muted' },
};

const TABS = [
  { id: 'regras', label: 'O que é conferido' },
  { id: 'visual', label: 'Visual' },
  { id: 'tom', label: 'Tom de voz' },
];

export default function BrandRules() {
  const [tab, setTab] = useState('regras');
  const rules = useAsync(() => api.listRules(), []);
  const brand = useAsync(() => api.getBrand(), []);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ text: '', source: '', category: 'marca' });

  const save = async (e) => {
    e.preventDefault();
    if (!draft.text.trim()) return;
    const r = await api.createRule(draft);
    rules.setData([r, ...(rules.data || [])]);
    setDraft({ text: '', source: '', category: 'marca' });
    setAdding(false);
  };

  return (
    <div className="container" style={{ maxWidth: 1040, gap: 24 }}>
      <header className="row-between">
        <div className="stack" style={{ gap: 6 }}>
          <h1 className="page-title">Regras da marca</h1>
          <p className="page-sub">Tudo o que a Formula confere antes de liberar uma peça.</p>
        </div>
        <button type="button" className="btn btn-dark" onClick={() => { setTab('regras'); setAdding(true); }}>
          <Icon name="plus" size={18} strokeWidth={2.2} /> Nova regra
        </button>
      </header>

      <div role="tablist" aria-label="Seções" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignSelf: 'flex-start', background: '#fff', border: '1px solid var(--line)', borderRadius: 999, padding: 5 }}>
        {TABS.map((t) => (
          <button key={t.id} type="button" role="tab" aria-selected={tab === t.id}
            className={`chip chip-sm${tab === t.id ? ' is-on' : ''}`} style={{ border: 0, minHeight: 44, fontSize: 15 }} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'regras' && (
        <>
          {adding && (
            <form onSubmit={save} className="card card-pad stack" style={{ gap: 16 }}>
              <label className="field">Regra<input className="input" autoFocus value={draft.text} onChange={(e) => setDraft({ ...draft, text: e.target.value })} placeholder="Ex.: Não usar fundo vermelho em peças de dermocosméticos" /></label>
              <div className="row" style={{ gap: 16 }}>
                <label className="field" style={{ flex: '2 1 240px' }}>De onde vem<input className="input" value={draft.source} onChange={(e) => setDraft({ ...draft, source: e.target.value })} placeholder="Ex.: Manual da marca" /></label>
                <label className="field" style={{ flex: '1 1 160px' }}>Tipo
                  <select className="input" value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })}>
                    {Object.entries(CATEGORIES).map(([id, c]) => <option key={id} value={id}>{c.label}</option>)}
                  </select>
                </label>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => setAdding(false)}>Cancelar</button>
                <button type="submit" className="btn btn-blue">Salvar regra</button>
              </div>
            </form>
          )}
          <section className="card" style={{ borderRadius: 24, padding: '6px 24px' }} aria-label="Regras">
            {rules.loading && <p className="loading">Carregando…</p>}
            {rules.data?.map((r) => (
              <div key={r.id} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px 16px', padding: '18px 0', borderBottom: '1px solid #F0F2F7' }}>
                <span style={{ flex: '1 1 320px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontWeight: 500, fontSize: 16, lineHeight: 1.4 }}>{r.text}</span>
                  <span style={{ fontSize: 13, color: 'var(--muted)' }}>{r.source}</span>
                </span>
                {r.isNew && <span className="badge badge-blue">Nova</span>}
                <span className={`badge ${CATEGORIES[r.category]?.cls || 'badge-muted'}`}>{CATEGORIES[r.category]?.label || r.category}</span>
              </div>
            ))}
          </section>
        </>
      )}

      {tab === 'visual' && brand.data && (
        <div className="stack" style={{ gap: 20 }}>
          <section className="card card-pad stack" style={{ gap: 18, borderRadius: 24 }} aria-labelledby="t-cor">
            <h2 id="t-cor" className="section-title" style={{ fontSize: 19 }}>Cores</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 14 }}>
              {brand.data.colors.map((c) => (
                <div key={c.hex} className="stack">
                  <span style={{ height: 90, borderRadius: 16, background: c.hex, border: '1px solid #E3E6F0' }} />
                  <span style={{ fontWeight: 500, fontSize: 15 }}>{c.name}</span>
                  <span style={{ fontSize: 13, color: 'var(--muted)' }}>{c.hex}</span>
                </div>
              ))}
            </div>
          </section>
          <section className="card card-pad" style={{ borderRadius: 24, display: 'flex', flexWrap: 'wrap', gap: 32 }} aria-labelledby="t-fonte">
            <h2 id="t-fonte" className="section-title" style={{ fontSize: 19, width: '100%' }}>Fontes</h2>
            {brand.data.fonts.map((f) => (
              <div key={f.name} className="stack">
                <span style={{ fontFamily: `'${f.name}', sans-serif`, fontWeight: f.name === 'Sora' ? 700 : 300, fontSize: 44, lineHeight: 1 }}>Aa</span>
                <span style={{ fontSize: 14, color: 'var(--muted)' }}>{f.name} · {f.use}</span>
              </div>
            ))}
          </section>
        </div>
      )}

      {tab === 'tom' && brand.data && (
        <div className="row" style={{ gap: 20 }}>
          <section className="card card-pad stack" style={{ flex: '1 1 320px', gap: 14, borderRadius: 24 }}>
            <h2 className="section-title" style={{ fontSize: 19, color: 'var(--ok)' }}>Como falamos</h2>
            <div className="chip-row" style={{ gap: 8 }}>
              {brand.data.voice.use.map((w) => <span key={w} className="badge badge-ok" style={{ fontSize: 15, padding: '8px 14px', fontWeight: 400 }}>{w}</span>)}
            </div>
          </section>
          <section className="card card-pad stack" style={{ flex: '1 1 320px', gap: 14, borderRadius: 24 }}>
            <h2 className="section-title" style={{ fontSize: 19, color: 'var(--blq)' }}>Palavras que não usamos</h2>
            <div className="chip-row" style={{ gap: 8 }}>
              {brand.data.voice.avoid.map((w) => <span key={w} className="badge badge-blq-soft" style={{ fontSize: 15, padding: '8px 14px', fontWeight: 400, textDecoration: 'line-through' }}>{w}</span>)}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
