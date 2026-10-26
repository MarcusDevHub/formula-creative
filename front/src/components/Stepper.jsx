import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import Icon from './Icon.jsx';

// Barra de etapas da criação. `current` vai de 1 a 5.
// `campaignId` é usado para montar os links das etapas já concluídas.
export default function Stepper({ current, campaignId, compact = false }) {
  const steps = [
    { label: 'Briefing', to: '/app/campanhas/nova' },
    { label: 'Ideia', to: campaignId ? `/app/campanhas/${campaignId}/ideias` : null },
    { label: 'Estúdio', to: campaignId ? `/app/campanhas/${campaignId}/estudio` : null },
    { label: 'Criações', to: campaignId ? `/app/criacoes/${campaignId}` : null },
    { label: 'Aprovação', to: '/app/aprovacoes' },
  ];

  return (
    <ol className="stepper" aria-label="Etapas" style={compact ? { fontSize: 14, gap: '8px 10px' } : undefined}>
      {steps.map((s, i) => {
        const n = i + 1;
        const state = n < current ? 'is-done' : n === current ? 'is-current' : '';
        const content = (
          <>
            <span className="step-num">{n < current ? <Icon name="check" size={14} strokeWidth={3} /> : n}</span>
            {s.label}
          </>
        );
        return (
          <Fragment key={s.label}>
            {i > 0 && <li aria-hidden="true" className={`step-line ${n <= current ? 'is-done' : ''}`} />}
            <li aria-current={n === current ? 'step' : undefined}>
              {n < current && s.to ? (
                <Link to={s.to} className={`step ${state}`}>{content}</Link>
              ) : (
                <span className={`step ${state}`}>{content}</span>
              )}
            </li>
          </Fragment>
        );
      })}
    </ol>
  );
}
