import React, { useState } from "react";

/* Checkbox que muestra/oculta un gráfico de pie.
   Construido solo con React + SVG, sin librerías externas. */

const DATA = [
  { label: "Categoría 1", value: 40 },
  { label: "Categoría 2", value: 65 },
  { label: "Categoría 3", value: 30 },
  { label: "Categoría 4", value: 80 },
];

const COLORS = ["#9E0C24", "#4f46e5", "#d97706", "#059669", "#7c3aed", "#0891b2"];

const SIZE = 220;
const RADIUS = 90;
const CENTER = SIZE / 2;

// Convierte un ángulo (grados) a un punto sobre el círculo
function polarToCartesian(angleDeg) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: CENTER + RADIUS * Math.cos(angleRad),
    y: CENTER + RADIUS * Math.sin(angleRad),
  };
}

// Genera el "path" de un segmento del pie entre dos ángulos
function describeSlice(startAngle, endAngle) {
  const start = polarToCartesian(endAngle);
  const end = polarToCartesian(startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
  return [
    `M ${CENTER} ${CENTER}`,
    `L ${start.x} ${start.y}`,
    `A ${RADIUS} ${RADIUS} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
    "Z",
  ].join(" ");
}

export default function PieChartOption() {
  const [show, setShow] = useState(true);

  const total = DATA.reduce((sum, d) => sum + d.value, 0);
  let cumulativeAngle = 0;
  const slices = DATA.map((d, i) => {
    const angle = (d.value / total) * 360;
    const slice = {
      ...d,
      path: describeSlice(cumulativeAngle, cumulativeAngle + angle),
      color: COLORS[i % COLORS.length],
      percent: Math.round((d.value / total) * 100),
    };
    cumulativeAngle += angle;
    return slice;
  });

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
        Gráfico de pie
      </label>

      {show && (
        <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
          <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
            {slices.map((s) => (
              <path key={s.label} d={s.path} fill={s.color}>
                <title>{`${s.label}: ${s.value} (${s.percent}%)`}</title>
              </path>
            ))}
          </svg>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {slices.map((s) => (
              <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#333" }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: s.color, display: "inline-block" }} />
                {s.label} ({s.percent}%)
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}