'use client';

/** Dependency-free SVG charts for the Agent Dashboard (no chart library — keeps the site fast). */

export function LineChart({
  points,
  color = '#ff6b35',
  height = 120,
  label,
  fmt,
}: {
  points: { date: string; value: number }[];
  color?: string;
  height?: number;
  label: string;
  fmt?: (n: number) => string;
}) {
  const w = 600;
  const max = Math.max(1, ...points.map((p) => p.value));
  const step = points.length > 1 ? w / (points.length - 1) : w;
  const ys = (v: number) => height - 6 - (v / max) * (height - 22);
  const path = points.map((p, i) => `${i * step},${ys(p.value)}`).join(' ');
  const ticks = [0, Math.round(max / 2), max];
  return (
    <div style={{ width: '100%' }}>
      <div className="mb-1 flex items-baseline justify-between text-xs text-neutral-400">
        <span>{label}</span>
        <span>{fmt ? fmt(max) : max}</span>
      </div>
      <svg viewBox={`0 0 ${w} ${height}`} width="100%" height={height} preserveAspectRatio="none" role="img" aria-label={label}>
        {ticks.map((t) => (
          <line key={t} x1={0} x2={w} y1={ys(t)} y2={ys(t)} stroke="rgba(255,255,255,0.07)" strokeWidth={1} />
        ))}
        <polyline points={path} fill="none" stroke={color} strokeWidth={2.2} strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) => (
          <circle key={p.date + i} cx={i * step} cy={ys(p.value)} r={2.5} fill={color} />
        ))}
        {points.length > 0 && (
          <text x={2} y={height - 1} fill="rgba(255,255,255,0.4)" fontSize={10}>
            {points[0].date.slice(5)}
          </text>
        )}
        {points.length > 1 && (
          <text x={w - 2} y={height - 1} fill="rgba(255,255,255,0.4)" fontSize={10} textAnchor="end">
            {points[points.length - 1].date.slice(5)}
          </text>
        )}
      </svg>
    </div>
  );
}

export function BarList({
  rows,
  color = '#ffb86b',
  fmt,
  label,
}: {
  rows: { name: string; value: number }[];
  color?: string;
  fmt?: (n: number) => string;
  label: string;
}) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <div>
      <div className="mb-2 text-xs text-neutral-400">{label}</div>
      {rows.length === 0 && <div className="text-xs text-neutral-600">No data yet.</div>}
      <div className="space-y-2">
        {rows.map((r) => (
          <div key={r.name} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 text-xs">
            <div className="min-w-0">
              <div className="truncate text-neutral-300" title={r.name}>
                {r.name}
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded bg-neutral-800">
                <div className="h-full rounded" style={{ width: `${Math.max(3, (r.value / max) * 100)}%`, background: color }} />
              </div>
            </div>
            <div className="tabular-nums text-neutral-400">{fmt ? fmt(r.value) : r.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}