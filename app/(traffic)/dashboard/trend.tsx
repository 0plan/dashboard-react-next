type TrendProps = {
  daily: { label: string; visits: number }[];
  peak: number;
  number: Intl.NumberFormat;
  visitsLabel: string;
};

export function Trend({ daily, peak, number, visitsLabel }: TrendProps) {
  const ceiling = Math.ceil(peak / 100) * 100;
  const points = daily.map(({ visits }, index) => ({
    x: index * 100 / (daily.length - 1),
    y: 100 - visits * 100 / ceiling,
  }));
  const line = points.map(({ x, y }, index) => `${index ? "L" : "M"}${x},${y}`).join(" ");
  const last = daily.length - 1;
  const ticks = Array.from({ length: 7 }, (_, index) => Math.round(index * last / 6));

  return (
    <div className="traffic-trend">
      <div className="traffic-plot">
        {[0, 25, 50, 75, 100].map(y => (
          <span key={y} className="traffic-axis traffic-axis-y" style={{ top: `${y}%` }} aria-hidden="true">
            {number.format(ceiling * (1 - y / 100))}
          </span>
        ))}
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-labelledby="trend-title" aria-describedby="trend-values">
          <desc id="trend-values">{visitsLabel}: {daily.map(row => `${row.label}: ${number.format(row.visits)}`).join("; ")}</desc>
          {[0, 25, 50, 75, 100].map(y => (
            <line key={y} x1="0" x2="100" y1={y} y2={y} stroke="var(--border)" strokeDasharray="3 5" vectorEffect="non-scaling-stroke" />
          ))}
          <path d={`${line} L100,100 H0 Z`} fill="var(--muted)" />
          <path d={line} fill="none" stroke="var(--primary)" strokeWidth="3" vectorEffect="non-scaling-stroke" />
          {daily.map(({ label, visits }, index) => (
            <rect key={label} x={Math.max(0, points[index].x - 50 / last)} y="0"
              width={(index === 0 || index === last ? 50 : 100) / last} height="100" fill="transparent">
              <title>{`${label}: ${number.format(visits)}`}</title>
            </rect>
          ))}
        </svg>
        {ticks.map((index, position) => (
          <span key={index} aria-hidden="true" style={{ left: `${points[index].x}%` }}
            className={`traffic-axis traffic-axis-x${position % 3 ? " traffic-axis-extra" : ""}`}>
            {daily[index].label}
          </span>
        ))}
      </div>
    </div>
  );
}
