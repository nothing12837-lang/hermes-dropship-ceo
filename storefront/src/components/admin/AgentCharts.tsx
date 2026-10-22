'use client';

/** Dependency-free SVG charts for the Agent Dashboard (no chart library — keeps the site fast). */

export function LineChart({
  points,
  color = '#ff6b35',
  height = 130,
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
  const ys = (v: number) => height - 8 - (v / max) * (height - 26);
  const path = points.map((p, i) => `${i * step},${ys(p.value)}`).join(' ');
  const areaPoints = points.length > 0
    ? `${points.map((p, i) => `${i * step},${ys(p.value)}`).join(' ')} ${(points.length - 1) * step},${height} 0,${height}`
    : '';
  const ticks = [0, Math.round(max / 2), max];
  const gradientId = `grad_${label.replace(/[^a-zA-Z0-9]/g, '_')}`;

  return (
    <div style={{ width: '100%' }}>
      <div className="mb-2 flex items-baseline justify-between text-xs font-bold">
        <span className="text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
          {label}
        </span>
        <span className="font-mono text-sm font-black" style={{ color }}>{fmt ? fmt(max) : max}</span>
      </div>
      <div className="rounded-xl border border-white/5 bg-black/40 p-2 shadow-inner">
        <svg viewBox={`0 0 ${w} ${height}`} width="100%" height={height} preserveAspectRatio="none" role="img" aria-label={label} className="overflow-visible">
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.45" />
              <stop offset="60%" stopColor={color} stopOpacity="0.1" />
              <stop offset="100%" stopColor={color} stopOpacity="0.0" />
            </linearGradient>
            <filter id={`glow_${gradientId}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor={color} floodOpacity="0.5" />
            </filter>
          </defs>

          {/* Grid Ticks */}
          {ticks.map((t) => (
            <line key={t} x1={0} x2={w} y1={ys(t)} y2={ys(t)} stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" strokeWidth={1} />
          ))}

          {/* Glowing Area Fill */}
          {areaPoints && <polygon points={areaPoints} fill={`url(#${gradientId})`} />}

          {/* Main Stroke */}
          <polyline points={path} fill="none" stroke={color} strokeWidth={2.8} strokeLinejoin="round" strokeLinecap="round" filter={`url(#glow_${gradientId})`} />

          {/* Points */}
          {points.map((p, i) => (
            <circle key={p.date + i} cx={i * step} cy={ys(p.value)} r={3.5} fill="#ffffff" stroke={color} strokeWidth={2} />
          ))}

          {/* X Axis Labels */}
          {points.length > 0 && (
            <text x={4} y={height - 2} fill="rgba(255,255,255,0.5)" fontSize={10} fontWeight="bold" fontFamily="monospace">
              {points[0].date.slice(5)}
            </text>
          )}
          {points.length > 1 && (
            <text x={w - 4} y={height - 2} fill="rgba(255,255,255,0.5)" fontSize={10} fontWeight="bold" fontFamily="monospace" textAnchor="end">
              {points[points.length - 1].date.slice(5)}
            </text>
          )}
        </svg>
      </div>
    </div>
  );
}

export function BarList({
  rows,
  color = '#38bdf8',
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
      <div className="mb-3 text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center justify-between">
        <span>{label}</span>
        <span className="text-[10px] text-slate-500 font-mono">Volume</span>
      </div>
      {rows.length === 0 && <div className="text-xs text-slate-500 py-3">No activity captured yet.</div>}
      <div className="space-y-2.5">
        {rows.map((r) => (
          <div key={r.name} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 text-xs group">
            <div className="min-w-0">
              <div className="truncate font-semibold text-slate-200 group-hover:text-white transition-colors" title={r.name}>
                {r.name}
              </div>
              <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-950 p-0.5 border border-white/5">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.max(4, (r.value / max) * 100)}%`,
                    background: `linear-gradient(90deg, ${color} 0%, #ffffff 140%)`,
                    boxShadow: `0 0 10px ${color}88`,
                  }}
                />
              </div>
            </div>
            <div className="tabular-nums font-mono font-bold text-slate-300 text-xs px-2 py-0.5 rounded bg-white/5 border border-white/5">
              {fmt ? fmt(r.value) : r.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
