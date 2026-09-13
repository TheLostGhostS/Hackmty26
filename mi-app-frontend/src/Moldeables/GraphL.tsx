import React, { useState } from "react";

/* Checkbox que muestra/oculta un gráfico de líneas.
   Construido solo con React + SVG, sin librerías externas. */

const DATA = [
  { label: "Categoría 1", value: 40 },
  { label: "Categoría 2", value: 65 },
  { label: "Categoría 3", value: 30 },
  { label: "Categoría 4", value: 80 },
];

const WIDTH = 380;
const HEIGHT = 220;
const PADDING = 30;

export default function LineChartOption() {
  const [show, setShow] = useState(true);

  const maxValue = Math.max(...DATA.map((d) => d.value));
  const chartW = WIDTH - PADDING * 2;
  const chartH = HEIGHT - PADDING * 2;
  const stepX = chartW / (DATA.length - 1);

  const points = DATA.map((d, i) => ({
    x: PADDING + i * stepX,
    y: HEIGHT - PADDING - (d.value / maxValue) * chartH,
    ...d,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <div
      style={{
        maxWidth: 420,
        border: "2px solid #9E0C24",
        borderRadius: 12,
        background: "#F1E9E1",
        padding: 16,
        boxSizing: "border-box",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontSize: 14,
          color: "#333",
          cursor: "pointer",
          marginBottom: show ? 12 : 0,
        }}
      >
        <input
          type="checkbox"
          checked={show}
          onChange={() => setShow((s) => !s)}
          style={{ accentColor: "#4f46e5", width: 16, height: 16 }}
        />
        Gráfico de líneas
      </label>

      {show && (
        <svg width="100%" viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
          {/* Eje X */}
          <line
            x1={PADDING}
            y1={HEIGHT - PADDING}
            x2={WIDTH - PADDING}
            y2={HEIGHT - PADDING}
            stroke="#c9beb1"
          />
          {/* Eje Y */}
          <line x1={PADDING} y1={PADDING} x2={PADDING} y2={HEIGHT - PADDING} stroke="#c9beb1" />

          {/* Línea */}
          <path d={linePath} fill="none" stroke="#4f46e5" strokeWidth="2" />

          {points.map((p) => (
            <g key={p.label}>
              <circle cx={p.x} cy={p.y} r="4" fill="#4f46e5">
                <title>{`${p.label}: ${p.value}`}</title>
              </circle>
              <text x={p.x} y={HEIGHT - PADDING + 14} fontSize="10" fill="#333" textAnchor="middle">
                {p.label}
              </text>
              <text x={p.x} y={p.y - 8} fontSize="10" fill="#333" textAnchor="middle">
                {p.value}
              </text>
            </g>
          ))}
        </svg>
      )}
    </div>
  );
}