import React from "react";

/* Caja de esquinas redondeadas cuyo tamaño depende directamente
   de su contenido (texto o imagen). El borde cambia de color
   cuando el cursor pasa por encima. */

function ContentBox({ children }) {
  return (
    <div
      style={{
        display: "inline-block", // el tamaño se ajusta al contenido
        border: "2px solid #9E0C24",
        borderRadius: 12,
        padding: 12,
        background: "#F1E9E1",
        transition: "border-color 0.2s ease, box-shadow 0.2s ease",
        cursor: "default",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "#4f46e5";
        e.currentTarget.style.boxShadow = "0 0 0 3px rgba(79,70,229,0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "#9E0C24";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {children}
    </div>
  );
}

export default function ContentBoxDemo() {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 32,
        alignItems: "flex-start",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {/* Caja con texto corto */}
      <ContentBox>
        <span style={{ fontSize: 14, color: "#333" }}>Hamburguesa</span>
      </ContentBox>

      {/* Caja con texto largo (crece en ancho/alto según el contenido) */}
      <ContentBox>
        <p style={{ margin: 0, maxWidth: 220, fontSize: 14, color: "#333", lineHeight: 1.4 }}>
         Hamburguesas hamburguesas hamburguesas hamburguesas
        </p>
      </ContentBox>

      {/* Caja con una imagen */}
      <ContentBox>
        <img
          src="https://www.magnific.com/es/vectores/gato-cool"
          alt="Ejemplo"
          style={{ display: "block", borderRadius: 6 }}
        />
      </ContentBox>

      {/* Caja con imagen + texto (más grande) */}
      <ContentBox>
        <img
          src="https://mx.pinterest.com/pin/1040190845153953125/"
          alt="Ejemplo con texto"
          style={{ display: "block", borderRadius: 6, marginBottom: 8 }}
        />
        <span style={{ fontSize: 13, color: "#333" }}>Hamburguesa Hamburguesa Burgers </span>
      </ContentBox>
    </div>
  );
}