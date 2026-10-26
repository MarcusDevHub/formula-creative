import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import Stepper from '../components/Stepper.jsx';
import { api, AUDIENCES, CHANNELS, SEASONS, REGIONS } from '../api/api.js';

const toggle = (list, id) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

export default function NewCampaign() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: 'Inverno sem pressa',
    message: 'Cuidado no inverno: alívio para gripe e resfriado e pele hidratada no frio, perto de casa.',
    season: 'inverno',
    regions: ['ne', 'sul'],
    products: [],
    audiences: ['a25', 's60', 'fam'],
    channels: ['feed', 'sto', 'ban', 'wpp', 'pdv'],
    period: '01/06 – 31/07',
    promoPrice: '',
  });
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  // Começa com três produtos de exemplo já escolhidos.
  useEffect(() => {
    api.listProducts('').then((all) => set('products', all.slice(0, 3)));
  }, []);

  useEffect(() => {
    if (!query) { setResults([]); return; }
    const t = setTimeout(() => api.listProducts(query).then(setResults), 250);
    return () => clearTimeout(t);
  }, [query]);

  const addProduct = (p) => {
    if (!form.products.some((x) => x.id === p.id)) set('products', [...form.products, p]);
    setQuery('');
  };

  const total = (form.products.length || 0) * form.audiences.length * form.channels.length * (form.regions.length || 1) * 2;
  const season = SEASONS.find((s) => s.id === form.season);

  const numericPromo = form.promoPrice ? Number(form.promoPrice.replace(/[^\d,]/g, '').replace(',', '.')) : null;
  const lowestCmed = form.products.length
    ? Math.min(...form.products.map((p) => p.cmedMax || 999))
    : null;
  const conflictingProduct = form.products.find((p) => p.cmedMax && numericPromo && numericPromo > p.cmedMax);
  const isPriceOverCmed = Boolean(conflictingProduct);

  const generateBriefingFromSelections = () => {
    const seasonObj = SEASONS.find((s) => s.id === form.season);
    const seasonName = seasonObj?.label || 'a estação';
    const prodNames = form.products.map((p) => p.name).join(', ') || 'produtos de cuidado';
    const regionNames = form.regions.map((rId) => REGIONS.find((r) => r.id === rId)?.label).filter(Boolean).join(' e ') || 'todo o Brasil';
    const audNames = form.audiences.map((aId) => AUDIENCES.find((a) => a.id === aId)?.label).filter(Boolean).join(', ') || 'todos';

    const newName = `${seasonName}: Cuidado Completo em ${regionNames}`;
    const newMessage = `Campanha de ${seasonName.toLowerCase()} com foco em ${prodNames}. Atendimento regional em ${regionNames}, oferecendo acolhimento, alívio de sintomas e prevenção para ${audNames}.`;

    setForm((f) => ({ ...f, name: newName, message: newMessage }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.products.length) {
      setError('Selecione pelo menos um produto para a campanha.');
      return;
    }
    if (!form.audiences.length || !form.channels.length || !form.regions.length) {
      setError('Escolha pelo menos um público, um lugar de publicação e uma região.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      const promo = form.promoPrice ? Number(form.promoPrice.replace(/[^\d,]/g, '').replace(',', '.')) : null;
      const c = await api.createCampaign({
        name: form.name,
        message: form.message,
        season: form.season,
        regions: form.regions,
        productIds: form.products.map((p) => p.id),
        audiences: form.audiences,
        channels: form.channels,
        period: form.period,
        promoPrice: promo,
      });
      navigate(`/app/campanhas/${c.id}/ideias`);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 1120 }}>
      <Stepper current={1} />
      <h1 className="page-title">Nova campanha</h1>

      <form className="row" onSubmit={submit}>
        <div className="card" style={{ flex: '3 1 520px', minWidth: 0, borderRadius: 26, padding: 32, display: 'flex', flexDirection: 'column', gap: 26 }}>
          {/* 1. Critérios de Merchandising e Veiculação */}
          <fieldset>
            <legend>Época do ano</legend>
            <div className="chip-row">
              {SEASONS.map((s) => (
                <button key={s.id} type="button" aria-pressed={form.season === s.id}
                  className={`chip${form.season === s.id ? ' is-on' : ''}`} onClick={() => set('season', s.id)}>
                  {s.label}
                </button>
              ))}
            </div>
            <span style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--muted)' }}>
              Comum nessa época:
              {season.topics.map((t) => <span key={t} className="badge badge-soft-blue" style={{ fontWeight: 400 }}>{t}</span>)}
            </span>
          </fieldset>

          <fieldset>
            <legend>Regiões</legend>
            <div className="chip-row">
              {REGIONS.map((r) => {
                const on = form.regions.includes(r.id);
                return (
                  <button key={r.id} type="button" aria-pressed={on}
                    className={`chip${on ? ' is-on' : ''}`} onClick={() => set('regions', toggle(form.regions, r.id))}>
                    {on && <Icon name="check" size={15} strokeWidth={2.6} />}{r.fullLabel}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="stack" style={{ gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <label htmlFor="busca-produto" style={{ fontSize: 15, fontWeight: 500 }}>Produtos</label>
              <button
                type="button"
                className="chip chip-sm"
                onClick={() => addProduct({ id: 'p6', name: 'Amoxicilina 500 mg (Sob Prescrição)', category: 'prescricao', price: 32.9, cmedMax: 42.0, imageUrl: null })}
                style={{ background: 'var(--blq-bg)', color: 'var(--blq)', borderColor: '#f0a0ac', fontWeight: 500 }}
              >
                🧪 Simular bloqueio de remédio com receita (1ª Checagem)
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, border: '1px solid var(--line-2)', borderRadius: 14, padding: 8, minHeight: 50 }}>
                {form.products.map((p) => (
                  <span key={p.id} className="badge badge-soft-blue" style={{ fontSize: 14, padding: '4px 4px 4px 12px', borderRadius: 10 }}>
                    {p.name}
                    <button type="button" aria-label={`Remover ${p.name}`} onClick={() => set('products', form.products.filter((x) => x.id !== p.id))}
                      style={{ width: 26, height: 26, border: 0, borderRadius: 8, background: 'transparent', color: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name="x" size={14} strokeWidth={2.4} />
                    </button>
                  </span>
                ))}
                <input id="busca-produto" type="search" placeholder="Buscar no catálogo" value={query} onChange={(e) => setQuery(e.target.value)}
                  style={{ flex: '1 1 160px', fontWeight: 300, fontSize: 15, border: 0, outline: 'none', background: 'transparent', minHeight: 34, padding: '0 8px' }} />
              </div>
              {results.length > 0 && (
                <ul role="listbox" className="card" style={{ position: 'absolute', zIndex: 5, left: 0, right: 0, top: 'calc(100% + 6px)', margin: 0, padding: 6, listStyle: 'none', boxShadow: '0 14px 30px rgba(13,18,56,.12)' }}>
                  {results.map((p) => (
                    <li key={p.id}>
                      <button type="button" onClick={() => addProduct(p)} className="nav-link" style={{ justifyContent: 'space-between' }}>
                        {p.name}<span style={{ fontSize: 13, color: 'var(--muted)' }}>R$ {p.price.toFixed(2).replace('.', ',')}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <fieldset>
            <legend>Para quem?</legend>
            <div className="chip-row">
              {AUDIENCES.map((a) => {
                const on = form.audiences.includes(a.id);
                return (
                  <button key={a.id} type="button" aria-pressed={on} className={`chip${on ? ' is-on' : ''}`} onClick={() => set('audiences', toggle(form.audiences, a.id))}>
                    {on && <Icon name="check" size={15} strokeWidth={2.6} />}{a.fullLabel}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset>
            <legend>Onde vai ser publicado?</legend>
            <div className="chip-row">
              {CHANNELS.map((c) => {
                const on = form.channels.includes(c.id);
                return (
                  <button key={c.id} type="button" aria-pressed={on} className={`chip${on ? ' is-on' : ''}`} onClick={() => set('channels', toggle(form.channels, c.id))}>
                    {on && <Icon name="check" size={15} strokeWidth={2.6} />}{c.fullLabel}
                  </button>
                );
              })}
            </div>
          </fieldset>

          {/* Precificação e Período */}
          <div className="stack" style={{ gap: 12 }}>
            <div className="row" style={{ gap: 20 }}>
              <label className="field" style={{ flex: '1 1 200px' }}>
                Período
                <input className="input" value={form.period} onChange={(e) => set('period', e.target.value)} placeholder="01/06 – 31/07" />
              </label>
              <div className="stack" style={{ flex: '1 1 260px', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                  <label htmlFor="preco-promocional" style={{ fontSize: 15, fontWeight: 500 }}>
                    Preço promocional
                    {lowestCmed != null && (
                      <span style={{ display: 'block', fontSize: 12, fontWeight: 400, color: 'var(--muted)' }}>
                        Teto CMED Anvisa: R$ {lowestCmed.toFixed(2).replace('.', ',')}
                      </span>
                    )}
                  </label>
                  <button
                    type="button"
                    className="chip chip-sm"
                    onClick={() => set('promoPrice', 'R$ 58,00')}
                    style={{ background: 'var(--blq-bg)', color: 'var(--blq)', borderColor: '#f0a0ac', fontSize: 12, padding: '0 10px', minHeight: 32 }}
                  >
                    🧪 Simular preço acima do CMED
                  </button>
                </div>
                <input
                  id="preco-promocional"
                  className="input"
                  value={form.promoPrice}
                  onChange={(e) => set('promoPrice', e.target.value)}
                  placeholder="R$ 9,90"
                  style={isPriceOverCmed ? { borderColor: 'var(--blq)', background: 'var(--blq-bg)' } : undefined}
                />
              </div>
            </div>

            {/* Alerta em tempo real de violação CMED */}
            {isPriceOverCmed && (
              <div className="note" style={{ background: 'var(--blq-bg)', border: '1px solid #f0a0ac', color: 'var(--blq)', padding: 14 }}>
                <Icon name="alert" size={18} style={{ color: 'var(--blq)', flex: 'none', marginTop: 2 }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <strong style={{ fontSize: 14 }}>Alerta de Conformidade CMED (Anvisa)</strong>
                  <span style={{ fontSize: 13, lineHeight: 1.4 }}>
                    O valor de R$ {numericPromo?.toFixed(2).replace('.', ',')} ultrapassa o Preço Máximo ao Consumidor (PMC de R$ {conflictingProduct?.cmedMax?.toFixed(2).replace('.', ',')} para {conflictingProduct?.name}). A campanha será barrada pelo Fiscal regulatório.
                  </span>
                  <button
                    type="button"
                    className="link-btn"
                    style={{ alignSelf: 'flex-start', color: 'var(--blq)', fontWeight: 600, fontSize: 13, textDecoration: 'underline', padding: 0 }}
                    onClick={() => set('promoPrice', `R$ ${lowestCmed.toFixed(2).replace('.', ',')}`)}
                  >
                    Ajustar para o teto permitido (R$ {lowestCmed.toFixed(2).replace('.', ',')})
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 2. Conceito Criativo e Mensagem (Gerados a partir das seleções) */}
          <div style={{ borderTop: '2px dashed var(--line)', paddingTop: 26, display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 17, fontWeight: 600 }}>Conceito e Mensagem da Campanha</h2>
                <p style={{ margin: '3px 0 0', fontSize: 13, color: 'var(--text-2)' }}>
                  A mensagem abaixo pode ser refinada manualmente ou gerada a partir dos produtos e regiões selecionados.
                </p>
              </div>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={generateBriefingFromSelections}
                style={{ borderColor: 'var(--blue)', color: 'var(--blue)', fontWeight: 500 }}
              >
                <Icon name="sparkle" size={16} /> Gerar nome e briefing da seleção
              </button>
            </div>

            <label className="field">
              Nome da campanha
              <input className="input" value={form.name} onChange={(e) => set('name', e.target.value)} required />
            </label>

            <label className="field">
              O que você quer comunicar? (Briefing criativo)
              <textarea className="textarea" rows={3} value={form.message} onChange={(e) => set('message', e.target.value)} />
            </label>
          </div>
        </div>

        <aside className="card" aria-label="Resumo" style={{ flex: '1 1 280px', minWidth: 0, borderRadius: 26, padding: 28, display: 'flex', flexDirection: 'column', gap: 18, position: 'sticky', top: 24 }}>
          <span style={{ fontSize: 15, color: 'var(--muted)' }}>Vamos criar</span>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 52, lineHeight: 1, letterSpacing: '-0.04em' }}>
            {total} <span style={{ fontSize: 24, letterSpacing: '-0.02em' }}>peças</span>
          </span>
          <span style={{ fontSize: 15, color: 'var(--text-2)' }}>
            {form.products.length} produtos × {form.audiences.length} públicos × {form.channels.length} formatos × {form.regions.length} regiões × 2 versões
          </span>
          <span className="note"><Icon name="shield" size={18} style={{ color: 'var(--blue)', flex: 'none' }} />Marca e regras da Anvisa conferidas automaticamente.</span>
          {error && <span className="form-error" role="alert">{error}</span>}
          <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={saving}>
            {saving ? <span className="spinner" /> : <>Gerar ideias <Icon name="arrowRight" /></>}
          </button>
        </aside>
      </form>
    </div>
  );
}
