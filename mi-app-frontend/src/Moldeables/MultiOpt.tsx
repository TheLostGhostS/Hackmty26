import React, { useState } from "react";

/* Botón desplegable de tamaño fijo (sin asas de resize).
   Al presionar, muestra una lista de opciones debajo. */

const OPTIONS = ["Opción 1", "Opción 2", "Opción 3", "Opción 4"];

export default function DropdownButton() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  return (
    <div style={{ width: 200, userSelect: "none" }}>
      <button
       id="MOpt"
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          height: 48,
          padding: "0 16px",
          fontSize: 15,
          fontWeight: 600,
          color: "#F1E9E1",
          background: "#9E0C24",
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          transition: "background 0.15s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#7f0a1d")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "#9E0C24")}
      >
        <span>{selected ?? "Más opciones"}</span>
        <span
          style={{
            display: "inline-block",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.15s ease",
          }}
        >
          ▾
        </span>
      </button>

      {open && (
        <ul
          style={{
            marginTop: 6,
            padding: 6,
            listStyle: "none",
            background: "#F1E9E1",
            border: "2px solid #9E0C24",
            borderRadius: 8,
            boxSizing: "border-box",
          }}
        >
          {OPTIONS.map((opt) => (
            <li
              key={opt}
              onClick={() => {
                setSelected(opt);
                setOpen(false);
              }}
              style={{
                padding: "8px 10px",
                borderRadius: 6,
                fontSize: 14,
                color: "#333",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#e7ddd2")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
