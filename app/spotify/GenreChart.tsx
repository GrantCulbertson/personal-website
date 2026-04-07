interface GenreBar {
  genre: string;
  minutes: number;
}

const COLORS = [
  "#3A4369",
  "#4A5580",
  "#5A6697",
  "#6B7AAF",
  "#7B8BC0",
  "#8B9BC8",
  "#9BAAD4",
  "#ABB9DF",
];

function truncateGenre(genre: string, max = 14): string {
  const words = genre.split(" ");
  // Capitalise first word
  const capped = words.map((w, i) => (i === 0 ? w[0].toUpperCase() + w.slice(1) : w)).join(" ");
  return capped.length > max ? capped.slice(0, max - 1) + "…" : capped;
}

export default function GenreChart({ data }: { data: GenreBar[] }) {
  if (!data || data.length === 0) {
    return (
      <p className="p-6 text-sm text-center" style={{ color: "var(--muted)" }}>
        No genre data available
      </p>
    );
  }

  const maxMinutes = Math.max(...data.map((d) => d.minutes));
  // Round up to a clean ceiling
  const yMax = Math.ceil(maxMinutes / 5) * 5;

  const SVG_W = 700;
  const SVG_H = 260;
  const PADDING = { top: 16, right: 16, bottom: 72, left: 44 };
  const chartW = SVG_W - PADDING.left - PADDING.right;
  const chartH = SVG_H - PADDING.top - PADDING.bottom;

  const barCount = data.length;
  const barGap = chartW / barCount;
  const barWidth = barGap * 0.55;

  // Y-axis ticks
  const tickCount = 4;
  const yTicks = Array.from({ length: tickCount + 1 }, (_, i) =>
    Math.round((yMax / tickCount) * i)
  );

  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: "white", border: "1px solid var(--cream-dark)" }}
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width="100%"
        style={{ overflow: "visible" }}
        aria-label="Minutes listened by genre"
      >
        <g transform={`translate(${PADDING.left}, ${PADDING.top})`}>
          {/* Y-axis gridlines + labels */}
          {yTicks.map((tick) => {
            const y = chartH - (tick / yMax) * chartH;
            return (
              <g key={tick}>
                <line
                  x1={0}
                  y1={y}
                  x2={chartW}
                  y2={y}
                  stroke="var(--cream-dark)"
                  strokeWidth={1}
                />
                <text
                  x={-6}
                  y={y + 4}
                  textAnchor="end"
                  fontSize={11}
                  fill="var(--muted)"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {/* Y-axis label */}
          <text
            x={-32}
            y={chartH / 2}
            textAnchor="middle"
            fontSize={10}
            fill="var(--muted)"
            transform={`rotate(-90, -32, ${chartH / 2})`}
            letterSpacing={1}
          >
            MINUTES
          </text>

          {/* Bars + X labels */}
          {data.map((d, i) => {
            const barH = (d.minutes / yMax) * chartH;
            const x = i * barGap + (barGap - barWidth) / 2;
            const y = chartH - barH;
            const labelX = x + barWidth / 2;

            return (
              <g key={d.genre}>
                {/* Bar */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barH}
                  rx={4}
                  fill={COLORS[i % COLORS.length]}
                />
                {/* Value label on top of bar */}
                <text
                  x={labelX}
                  y={y - 5}
                  textAnchor="middle"
                  fontSize={11}
                  fontWeight={600}
                  fill="var(--navy)"
                >
                  {d.minutes}m
                </text>
                {/* X-axis genre label, rotated */}
                <text
                  x={labelX}
                  y={chartH + 12}
                  textAnchor="end"
                  fontSize={11}
                  fill="var(--dark)"
                  transform={`rotate(-38, ${labelX}, ${chartH + 12})`}
                >
                  {truncateGenre(d.genre)}
                </text>
              </g>
            );
          })}

          {/* X axis baseline */}
          <line
            x1={0}
            y1={chartH}
            x2={chartW}
            y2={chartH}
            stroke="var(--cream-dark)"
            strokeWidth={1.5}
          />
        </g>
      </svg>
    </div>
  );
}
