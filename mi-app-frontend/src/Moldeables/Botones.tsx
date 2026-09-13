import React, { useState } from "react";

/* Botón de tamaño fijo (sin asas de resize) */

export default function FixedButton() {
  const [clicks, setClicks] = useState(0);

  return (
    <button
      id="botones"
      onClick={() => setClicks((c) => c + 1)}
      style={{
        width: 160,
        height: 48,
        padding: "0 16px",
        fontSize: 15,
        fontWeight: 600,
        color: "#F1E9E1",
        background: "#9E0C24",
        border: "none",
        borderRadius: 8,
        cursor: "pointer",
        transition: "background 0.15s ease",
        userSelect: "none",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#7f0a1d")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "#9E0C24")}
    >
      Clics: {clicks}
    </button>
  );

}