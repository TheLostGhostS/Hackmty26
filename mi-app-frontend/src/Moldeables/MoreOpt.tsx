import React, { useState, useEffect, useRef } from "react";



function fetchOptionsFromApi() {
  return new Promise((resolve) => {
    setTimeout(() => {
      const count = 4 + Math.floor(Math.random() * 4); // entre 4 y 7 opciones
      const data = Array.from({ length: count }, (_, i) => ({
        id: `opt-${i}`,
        label: `Categoría ${i + 1}`,
      }));
      resolve(data);
    }, 600);
  });
}

export default function MultiSelectChecklist() {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(new Set());
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    let active = true;
    fetchOptionsFromApi().then((data) => {
      if (!active) return;
      setOptions(data);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  // Cierra el desplegable al hacer clic fuera del componente
  useEffect(() => {
    const onClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const toggle = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const removeChip = (id, e) => {
    e.stopPropagation();
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const selectedOptions = options.filter((o) => selected.has(o.id));

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        maxWidth: 280,
        fontFamily: "system-ui, sans-serif",
        userSelect: "none",
      }}
    >
      {/* Control principal */}
      <div
        onClick={() => setOpen((o) => !o)}
        style={{
          minHeight: 44,
          border: "2px solid #9E0C24",
          borderRadius: 10,
          background: "#F1E9E1",
          padding: "6px 10px",
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 6,
          cursor: "pointer",
          boxSizing: "border-box",
        }}
      >
        {selectedOptions.length === 0 && (
          <span style={{ fontSize: 14, color: "#6b6b6b" }}>
            {loading ? "Cargando opciones…" : "Selecciona categorías"}
          </span>
        )}

        {selectedOptions.map((opt) => (
          <span
            key={opt.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: 12,
              color: "#F1E9E1",
              background: "#9E0C24",
              borderRadius: 999,
              padding: "3px 8px",
            }}
          >
            {opt.label}
            <span
              onClick={(e) => removeChip(opt.id, e)}
              style={{ cursor: "pointer", fontWeight: 700, lineHeight: 1 }}
            >
              ×
            </span>
          </span>
        ))}

        <span
          style={{
            marginLeft: "auto",
            display: "inline-block",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.15s ease",
            color: "#9E0C24",
          }}
        >
          ▾
        </span>
      </div>

      {/* Lista desplegable con checkboxes, se sobrepone al contenido de abajo */}
      {open && !loading && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            width: "100%",
            background: "#F1E9E1",
            border: "2px solid #9E0C24",
            borderRadius: 10,
            boxShadow: "0 8px 16px rgba(0,0,0,0.12)",
            boxSizing: "border-box",
            padding: 8,
            zIndex: 20,
            maxHeight: 220,
            overflowY: "auto",
          }}
        >
          {options.map((opt) => (
            <label
              key={opt.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 14,
                color: "#333",
                cursor: "pointer",
                padding: "6px 6px",
                borderRadius: 6,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#e7ddd2")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <input
                type="checkbox"
                checked={selected.has(opt.id)}
                onChange={() => toggle(opt.id)}
                style={{ accentColor: "#9E0C24", width: 16, height: 16 }}
              />
              {opt.label}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}