const palette = ["#d7f85b", "#9f8bff", "#ffb77e", "#eae9e2"];

/* Dotted analog waveforms, rendered once on the server. Deterministic — no hydration drift. */
export function WaveField({ rows = 14, className = "" }: { rows?: number; className?: string }) {
  const width = 900;
  const height = 420;
  const dots: { x: number; y: number; r: number; fill: string; opacity: number }[] = [];
  for (let row = 0; row < rows; row++) {
    const baseline = 40 + (row * (height - 80)) / (rows - 1);
    const amp = 14 + 26 * Math.abs(Math.sin(row * 1.7));
    const freq = 0.011 + 0.004 * ((row * 7) % 3);
    const phase = row * 1.3;
    const fill = palette[row % palette.length];
    for (let x = 0; x <= width; x += 13) {
      const y = baseline + amp * Math.sin(freq * x + phase);
      const edgeFade = Math.min(1, x / 140, (width - x) / 140);
      dots.push({ x, y, r: 1.4, fill, opacity: Math.max(0.06, 0.5 * edgeFade * (0.35 + 0.65 * Math.abs(Math.cos(freq * x + phase)))) });
    }
  }
  return <svg aria-hidden="true" viewBox={`0 0 ${width} ${height}`} className={className} fill="none">
    {dots.map((dot, index) => <circle key={index} cx={dot.x.toFixed(1)} cy={dot.y.toFixed(1)} r={dot.r} fill={dot.fill} opacity={dot.opacity.toFixed(2)} />)}
  </svg>;
}

/* Oscilloscope rings — concentric off-center circles for section transitions. */
export function ScopeRings({ className = "" }: { className?: string }) {
  return <svg aria-hidden="true" viewBox="0 0 300 300" className={className} fill="none">
    {[132, 108, 86, 66, 48].map((radius, index) => <circle key={radius} cx="150" cy="150" r={radius} stroke={palette[index % 3]} strokeOpacity={0.14 + index * 0.03} strokeWidth="1" strokeDasharray={index % 2 ? "1 7" : undefined} />)}
    <circle cx="150" cy="150" r="4" fill="#d7f85b" opacity=".5" />
  </svg>;
}
