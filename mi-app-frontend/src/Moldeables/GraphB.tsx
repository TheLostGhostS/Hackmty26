import React, { useState } from "react";

/* Checkbox que muestra/oculta un gráfico de barras.
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

export default function BarChartOption() {
  const [show, setShow] = useState(true);

  const maxValue = Math.max(...DATA.map((d) => d.value));
  const chartW = WIDTH - PADDING * 2;
  const chartH = HEIGHT - PADDING * 2;
  const barWidth = chartW / DATA.length / 1.6;
  const gap = chartW / DATA.length;

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
        Gráfico de barras
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

          {DATA.map((d, i) => {
            const barHeight = (d.value / maxValue) * chartH;
            const x = PADDING + i * gap + (gap - barWidth) / 2;
            const y = HEIGHT - PADDING - barHeight;
            return (
              <g key={d.label}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill="#9E0C24"
                  rx={3}
                >
                  <title>{`${d.label}: ${d.value}`}</title>
                </rect>
                <text
                  x={x + barWidth / 2}
                  y={HEIGHT - PADDING + 14}
                  fontSize="10"
                  fill="#333"
                  textAnchor="middle"
                >
                  {d.label}
                </text>
                <text
                  x={x + barWidth / 2}
                  y={y - 4}
                  fontSize="10"
                  fill="#333"
                  textAnchor="middle"
                >
                  {d.value}
                </text>
              </g>
            );
          })}
        </svg>
      )}
    </div>
  );
}