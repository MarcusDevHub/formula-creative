// Prévia de uma peça. Se a peça tiver `imageUrl` (vinda do Gemini/back-end),
// a imagem aparece no fundo; senão, usa a cor do público como placeholder.

const SIZES = {
  feed: { w: 150, h: 150, fs: 14 },
  sto: { w: 104, h: 186, fs: 13 },
  ban: { w: 196, h: 92, fs: 12 },
  wpp: { w: 136, h: 170, fs: 13 },
  pdv: { w: 128, h: 180, fs: 13 },
  tv: { w: 196, h: 110, fs: 13 },
};

export const formatPrice = (v) =>
  typeof v === 'number' ? `R$ ${v.toFixed(2).replace('.', ',')}` : v || '';

export default function PiecePreview({ piece, format, scale = 1, width, height, titleSize }) {
  const base = SIZES[format || piece.format] || SIZES.feed;
  const w = width || base.w * scale;
  const h = height || base.h * scale;
  const fs = titleSize || base.fs * scale;
  const bg = piece.imageUrl ? `url(${piece.imageUrl})` : piece.color;
  const isBlockedWithoutWarning = piece.status === 'blocked' && piece.warning === null;

  return (
    <div
      className="piece"
      style={{
        width: w,
        height: h,
        border: isBlockedWithoutWarning ? '1.5px dashed var(--blq)' : undefined,
      }}
      aria-hidden="true"
    >
      <div className={`piece-art${piece.imageUrl ? ' has-image' : ''}`} style={{ background: bg, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <span className="piece-title" style={{ fontSize: fs }}>{piece.title}</span>
      </div>
      <div className="piece-footer">
        <span className="piece-product" style={{ fontSize: Math.max(8, 8 * scale) }}>{piece.productName}</span>
        <span className="price-tag" style={{ fontSize: Math.max(8, 8 * scale) }}>{formatPrice(piece.price)}</span>
      </div>
      {piece.warning ? (
        <div
          className="piece-warning-bar"
          style={{
            background: 'var(--navy)',
            color: '#fff',
            fontSize: Math.max(5.5, 6 * scale),
            lineHeight: 1.15,
            fontWeight: 500,
            letterSpacing: '.02em',
            textAlign: 'center',
            padding: `${Math.max(2, 2.5 * scale)}px 4px`,
            textTransform: 'uppercase',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flex: 'none',
          }}
          title={piece.warning}
        >
          {piece.warning}
        </div>
      ) : isBlockedWithoutWarning ? (
        <div
          style={{
            borderTop: '1px dashed var(--blq)',
            background: 'var(--blq-bg)',
            color: 'var(--blq)',
            fontSize: Math.max(5.5, 6 * scale),
            lineHeight: 1.15,
            fontWeight: 600,
            textAlign: 'center',
            padding: `${Math.max(2, 2.5 * scale)}px 4px`,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flex: 'none',
          }}
        >
          Falta aviso obrigatório
        </div>
      ) : null}
    </div>
  );
}
