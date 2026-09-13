import React, { useState } from "react";

/* Checkbox simple y reutilizable, con el mismo estilo del resto de los componentes */

export default function Checkbox() {
  const [checked, setChecked] = useState(false);

  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontSize: 14,
        color: "#333",
        cursor: "pointer",
        fontFamily: "system-ui, sans-serif",
        userSelect: "none",
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={() => setChecked((c) => !c)}
        style={{ accentColor: "#9E0C24", width: 16, height: 16, cursor: "pointer" }}
      />
      Opción
    </label>
  );
}