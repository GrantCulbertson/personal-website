"use client";

import { useState } from "react";
import type { DayHistory } from "@/lib/spotify";

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

  const monthStarts: { i: number; label: string }[] = [];
  days.forEach((d, i) => {
    if (d.date.slice(8) === "01") {
      monthStarts.push({ i, label: MONTH_LABELS[parseInt(d.date.slice(5, 7), 10) - 1] });
    }
  });

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
        aria-label="Minutes listened per day"
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
            MINUTES
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

          {/* Month labels */}
          {monthStarts.map(({ i, label }) => (
            <g key={label + i}>
              <line x1={xOf(i)} y1={chartH} x2={xOf(i)} y2={chartH + 5} stroke={tickColor} strokeWidth={1} />
              <text x={xOf(i) + 2} y={chartH + 16} fontSize={11} fill={labelColor} fontWeight={500}>{label}</text>
            </g>
          ))}

          {/* Today marker */}
          <g>
            <line x1={todayX} y1={0} x2={todayX} y2={chartH}
              stroke={todayColor} strokeWidth={1} strokeDasharray="3 3" opacity={0.6} />
            <text x={todayX - 4} y={-7} textAnchor="end" fontSize={9} fill={todayColor}>today</text>
          </g>
        </g>
      </svg>
    </div>
  );
}
