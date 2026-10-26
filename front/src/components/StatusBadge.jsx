const MAP = {
  ok: { label: 'Liberada', cls: 'badge-ok' },
  review: { label: 'Para revisar', cls: 'badge-rev' },
  blocked: { label: 'Bloqueada', cls: 'badge-blq' },
  rejected: { label: 'Reprovada', cls: 'badge-blq-soft' },
};

export default function StatusBadge({ status }) {
  const s = MAP[status] || MAP.ok;
  return <span className={`badge ${s.cls}`}>{s.label}</span>;
}
