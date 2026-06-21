"use client";

import { useState } from "react";
import type { DayHistory } from "@/lib/spotify";
import { nearestIndexFromX } from "./chartGeometry";

type ViewMode = "total" | "genre" | "media";

const MONTH_LABELS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const GENRE_COLORS = [
  "#6B7AAF",
  "#1DB954",
  "#A78BFA",
  "#F59E0B",
  "#F87171",
  "#38BDF8",
];

const MEDIA_COLORS: Record<string, string> = {
  music:   "#1DB954",
  podcast: "#A78BFA",
};

function capitalize(s: string) {
  return s.split(" ").map(w => w[0]?.toUpperCase() + w.slice(1)).join(" ");
}

interface Props {
  days: DayHistory[];
  topGenres: string[];
  mediaTypes: string[];
  lit?: boolean;
}

export default function DailyChart({ days, topGenres, mediaTypes, lit }: Props) {
  const [mode, setMode] = useState<ViewMode>("total");
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const gridColor    = lit ? "rgba(255,255,255,0.08)" : "var(--cream-dark)";
  const tickColor    = lit ? "rgba(255,255,255,0.4)"  : "var(--muted)";
  const labelColor   = lit ? "rgba(255,255,255,0.75)" : "var(--dark)";
  const todayColor   = lit ? "rgba(255,255,255,0.4)"  : "var(--slate-blue)";
  const btnActive    = lit ? "rgba(255,255,255,0.15)" : "var(--navy)";
  const btnActiveTxt = lit ? "white"                  : "white";
  const btnInactive  = lit ? "transparent"            : "transparent";
  const btnInactiveTxt = lit ? "rgba(255,255,255,0.5)" : "var(--muted)";
  const btnBorder    = lit ? "rgba(255,255,255,0.15)" : "var(--cream-dark)";
  const btnHover     = lit ? "rgba(255,255,255,0.08)" : "var(--cream)";

  if (!days || days.length === 0) {
    return (
      <p className="p-6 text-sm text-center" style={{ color: tickColor }}>
        No listening history available
      </p>
    );
  }

  const SVG_W = 800;
  const SVG_H = 240;
  const PAD = { top: 24, right: 20, bottom: 56, left: 48 };
  const chartW = SVG_W - PAD.left - PAD.right;
  const chartH = SVG_H - PAD.top - PAD.bottom;
  const n = days.length;

  const xOf = (i: number) => (i / Math.max(n - 1, 1)) * chartW;
  const lastDate = days[n - 1]?.date ?? "";
  const isToday = lastDate === new Date().toISOString().slice(0, 10);
  const todayX = xOf(n - 1);

  const maxVal =
    mode === "total"
      ? Math.max(...days.map(d => d.total), 1)
      : mode === "genre"
      ? Math.max(...days.flatMap(d => Object.values(d.byGenre)), 1)
      : Math.max(...days.flatMap(d => Object.values(d.byMediaType)), 1);

  const yMax = Math.ceil(maxVal / 10) * 10;
  const yOf = (v: number) => chartH - (v / yMax) * chartH;

  const tickCount = 4;
  const yTicks = Array.from({ length: tickCount + 1 }, (_, i) =>
    Math.round((yMax / tickCount) * i)
  );

  // Pick ~6 evenly-spaced date labels across the actual data range
  const DATE_LABEL_COUNT = 6;
  const dateLabels: { i: number; label: string }[] = [];
  if (n > 1) {
    for (let t = 0; t < DATE_LABEL_COUNT; t++) {
      const i = Math.round((t / (DATE_LABEL_COUNT - 1)) * (n - 1));
      const [, mm, dd] = days[i].date.split("-");
      const label = `${MONTH_LABELS[parseInt(mm, 10) - 1]} ${parseInt(dd, 10)}`;
      dateLabels.push({ i, label });
    }
  } else if (n === 1) {
    const [, mm, dd] = days[0].date.split("-");
    dateLabels.push({ i: 0, label: `${MONTH_LABELS[parseInt(mm, 10) - 1]} ${parseInt(dd, 10)}` });
  }

  function buildLine(values: number[]) {
    return values.map((v, i) => `${xOf(i).toFixed(1)},${yOf(v).toFixed(1)}`).join(" ");
  }

  function buildArea(values: number[]) {
    const pts = values.map((v, i) => `L ${xOf(i).toFixed(1)},${yOf(v).toFixed(1)}`).join(" ");
    return `M ${xOf(0).toFixed(1)},${chartH} ${pts} L ${xOf(n - 1).toFixed(1)},${chartH} Z`;
  }

  const totalValues = days.map(d => d.total);
  const genreLines = topGenres.map(g => ({
    key: g,
    label: capitalize(g),
    color: GENRE_COLORS[topGenres.indexOf(g) % GENRE_COLORS.length],
    values: days.map(d => d.byGenre[g] ?? 0),
  }));
  const mediaLines = mediaTypes.map(t => ({
    key: t,
    label: capitalize(t),
    color: MEDIA_COLORS[t] ?? "#9A9DB5",
    values: days.map(d => d.byMediaType[t] ?? 0),
  }));

  const modes: { id: ViewMode; label: string }[] = [
    { id: "total", label: "Total" },
    { id: "genre", label: "By Genre" },
  ];

  const activeLegend = mode === "genre" ? genreLines : mode === "media" ? mediaLines : [];

  // Translate a mouse position into the nearest data-point index. The SVG
  // scales to its container, so we map screen coords back into viewBox units
  // via the current transform matrix, then strip the left padding.
  function handleHover(e: React.MouseEvent<SVGSVGElement>) {
    const svg = e.currentTarget;
    const screenCtm = svg.getScreenCTM();
    if (!screenCtm) return;
    const local = new DOMPoint(e.clientX, e.clientY).matrixTransform(screenCtm.inverse());
    setHoverIndex(nearestIndexFromX(local.x - PAD.left, n, chartW));
  }

  return (
    <div className="p-5">
      {/* Toggle buttons + legend */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {modes.map(m => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className="px-3 py-1 rounded-full text-xs font-semibold transition-all duration-150"
            style={{
              background: mode === m.id ? btnActive : btnInactive,
              color: mode === m.id ? btnActiveTxt : btnInactiveTxt,
              border: `1px solid ${btnBorder}`,
            }}
            onMouseEnter={e => {
              if (mode !== m.id) e.currentTarget.style.background = btnHover;
            }}
            onMouseLeave={e => {
              if (mode !== m.id) e.currentTarget.style.background = btnInactive;
            }}
          >
            {m.label}
          </button>
        ))}

        {/* Legend for genre / media type modes */}
        {activeLegend.length > 0 && (
          <div className="flex flex-wrap gap-3 ml-3">
            {activeLegend.map(({ key, label, color }) => (
              <span key={key} className="flex items-center gap-1.5 text-xs" style={{ color: labelColor }}>
                <span
                  className="inline-block rounded-full flex-shrink-0"
                  style={{ width: 8, height: 8, background: color }}
                />
                {label}
              </span>
            ))}
          </div>
        )}
      </div>

      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width="100%"
        style={{ overflow: "visible" }}
        aria-label="Plays per day"
        onMouseMove={handleHover}
        onMouseLeave={() => setHoverIndex(null)}
      >
        <defs>
          <linearGradient id="total-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={lit ? "rgba(255,255,255,0.18)" : "rgba(58,67,105,0.18)"} />
            <stop offset="100%" stopColor={lit ? "rgba(255,255,255,0.01)" : "rgba(58,67,105,0.01)"} />
          </linearGradient>
        </defs>

        <g transform={`translate(${PAD.left}, ${PAD.top})`}>
          {/* Y gridlines + labels */}
          {yTicks.map(tick => (
            <g key={tick}>
              <line x1={0} y1={yOf(tick)} x2={chartW} y2={yOf(tick)} stroke={gridColor} strokeWidth={1} />
              <text x={-8} y={yOf(tick) + 4} textAnchor="end" fontSize={10} fill={tickColor}>{tick}</text>
            </g>
          ))}

          {/* Y axis label */}
          <text
            x={-36} y={chartH / 2}
            textAnchor="middle" fontSize={9} fill={tickColor} letterSpacing={1}
            transform={`rotate(-90, -36, ${chartH / 2})`}
          >
            PLAYS
          </text>

          {/* Chart lines */}
          {mode === "total" && (
            <>
              <path d={buildArea(totalValues)} fill="url(#total-grad)" />
              <polyline
                points={buildLine(totalValues)}
                fill="none"
                stroke={lit ? "rgba(255,255,255,0.85)" : "#3A4369"}
                strokeWidth={1.8}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </>
          )}

          {mode === "genre" && genreLines.map(({ key, color, values }) => (
            <polyline
              key={key}
              points={buildLine(values)}
              fill="none"
              stroke={color}
              strokeWidth={1.6}
              strokeLinejoin="round"
              strokeLinecap="round"
              opacity={0.9}
            />
          ))}

          {mode === "media" && mediaLines.map(({ key, color, values }) => (
            <polyline
              key={key}
              points={buildLine(values)}
              fill="none"
              stroke={color}
              strokeWidth={1.6}
              strokeLinejoin="round"
              strokeLinecap="round"
              opacity={0.9}
            />
          ))}

          {/* X baseline */}
          <line x1={0} y1={chartH} x2={chartW} y2={chartH} stroke={gridColor} strokeWidth={1.5} />

          {/* Date labels */}
          {dateLabels.map(({ i, label }) => (
            <g key={label + i}>
              <line x1={xOf(i)} y1={chartH} x2={xOf(i)} y2={chartH + 5} stroke={tickColor} strokeWidth={1} />
              <text
                x={xOf(i)}
                y={chartH + 18}
                textAnchor={i === 0 ? "start" : i === n - 1 ? "end" : "middle"}
                fontSize={11}
                fill={labelColor}
                fontWeight={500}
              >
                {label}
              </text>
            </g>
          ))}

          {/* Today / latest marker */}
          <g>
            <line x1={todayX} y1={0} x2={todayX} y2={chartH}
              stroke={todayColor} strokeWidth={1} strokeDasharray="3 3" opacity={0.6} />
            {isToday && (
              <text x={todayX - 4} y={-7} textAnchor="end" fontSize={9} fill={todayColor}>today</text>
            )}
          </g>

          {/* Hover guide, dot(s), and tooltip */}
          {hoverIndex !== null && days[hoverIndex] && (() => {
            const i = hoverIndex;
            const hx = xOf(i);
            const [, mm, dd] = days[i].date.split("-");
            const header = `${MONTH_LABELS[parseInt(mm, 10) - 1]} ${parseInt(dd, 10)}`;

            const isGenre = mode === "genre";
            const dots = isGenre
              ? genreLines.map(g => ({ color: g.color, label: g.label, value: g.values[i] }))
              : [{ color: lit ? "rgba(255,255,255,0.95)" : "#3A4369", label: "Plays", value: totalValues[i] }];

            const lineH = 15, padX = 9, headerH = 17;
            const measure = [header, ...dots.map(d => isGenre ? `${d.label}${d.value}` : `${d.value} plays`)];
            const boxW = Math.max(...measure.map(s => s.length)) * 6.3 + padX * 2 + (isGenre ? 26 : 0);
            const boxH = headerH + dots.length * lineH + 7;

            const flip = hx > chartW * 0.6;
            const boxX = Math.max(0, Math.min(flip ? hx - boxW - 12 : hx + 12, chartW - boxW));

            return (
              <g style={{ pointerEvents: "none" }}>
                <line x1={hx} y1={0} x2={hx} y2={chartH}
                  stroke={lit ? "rgba(255,255,255,0.35)" : "rgba(58,67,105,0.35)"} strokeWidth={1} />
                {dots.map((d, di) => (
                  <circle key={di} cx={hx} cy={yOf(d.value)} r={3.5} fill={d.color}
                    stroke={lit ? "rgba(20,22,34,0.9)" : "white"} strokeWidth={1.5} />
                ))}
                <rect x={boxX} y={0} width={boxW} height={boxH} rx={6}
                  fill={lit ? "rgba(20,22,34,0.92)" : "rgba(255,255,255,0.97)"}
                  stroke={lit ? "rgba(255,255,255,0.18)" : "var(--cream-dark)"} strokeWidth={1} />
                <text x={boxX + padX} y={13} fontSize={11} fontWeight={600} fill={lit ? "white" : "var(--dark)"}>{header}</text>
                {isGenre
                  ? dots.map((d, di) => {
                      const ry = headerH + di * lineH;
                      return (
                        <g key={di}>
                          <rect x={boxX + padX} y={ry + 2} width={8} height={8} rx={2} fill={d.color} />
                          <text x={boxX + padX + 13} y={ry + 9.5} fontSize={10.5}
                            fill={lit ? "rgba(255,255,255,0.75)" : "var(--slate-blue)"}>{d.label}</text>
                          <text x={boxX + boxW - padX} y={ry + 9.5} textAnchor="end" fontSize={10.5} fontWeight={600}
                            fill={lit ? "white" : "var(--navy)"}>{d.value}</text>
                        </g>
                      );
                    })
                  : (
                    <text x={boxX + padX} y={headerH + 9.5} fontSize={11} fill={lit ? "rgba(255,255,255,0.85)" : "var(--navy)"}>
                      <tspan fontWeight={600}>{totalValues[i]}</tspan> plays
                    </text>
                  )}
              </g>
            );
          })()}
        </g>
      </svg>
    </div>
  );
}
