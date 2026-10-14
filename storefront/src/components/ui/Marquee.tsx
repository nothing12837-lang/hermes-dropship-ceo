'use client';

export default function Marquee({
  items,
  dark = false,
}: {
  items: string[];
  dark?: boolean;
}) {
  const row = [...items, ...items, ...items];
  return (
    <div
      style={{
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        background: dark ? '#1a1412' : '#ff6b35',
        color: dark ? 'white' : 'white',
        padding: '1rem 0',
        transform: 'rotate(-1deg) scale(1.02)',
      }}
    >
      <div className="marquee-track" style={{ display: 'inline-flex', gap: '3rem' }}>
        {row.map((t, i) => (
          <span
            key={i}
            style={{ fontWeight: 900, fontSize: '1.1rem', letterSpacing: '-0.01em', textTransform: 'uppercase' }}
          >
            {t} <span style={{ marginLeft: '3rem', opacity: 0.6 }}>✦</span>
          </span>
        ))}
      </div>
      <style>{`
        .marquee-track { animation: marquee 22s linear infinite; }
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-33.333%); } }
      `}</style>
    </div>
  );
}
