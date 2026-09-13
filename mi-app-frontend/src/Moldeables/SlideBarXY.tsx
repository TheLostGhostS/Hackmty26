import React, { useState } from "react";

const sliderThumbStyles = `
  /* --- Estilos compartidos (reset) --- */
  input[type="range"].big-thumb,
  input[type="range"].big-thumb-vertical {
    -webkit-appearance: none;
    appearance: none;
    background: transparent;
  }

  /* --- Horizontal --- */
  input[type="range"].big-thumb::-webkit-slider-runnable-track {
    height: 6px;
    border-radius: 3px;
    background: #ddd;
  }
  input[type="range"].big-thumb::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: #9E0C24;
    border: 3px solid white;
    box-shadow: 0 0 4px rgba(0,0,0,0.4);
    cursor: pointer;
    margin-top: -11px;
  }
  input[type="range"].big-thumb::-moz-range-track {
    height: 6px;
    border-radius: 3px;
    background: #ddd;
  }
  input[type="range"].big-thumb::-moz-range-thumb {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: #9E0C24;
    border: 3px solid white;
    box-shadow: 0 0 4px rgba(0,0,0,0.4);
    cursor: pointer;
  }

  /* --- Vertical (barra más delgada) --- */
  input[type="range"].big-thumb-vertical::-webkit-slider-runnable-track {
    width: 4px;
    border-radius: 2px;
    background: #ddd;
  }
  input[type="range"].big-thumb-vertical::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #9E0C24;
    border: 3px solid white;
    box-shadow: 0 0 4px rgba(0,0,0,0.4);
    cursor: pointer;
    margin-left: -10px;
  }
  input[type="range"].big-thumb-vertical::-moz-range-track {
    width: 4px;
    border-radius: 2px;
    background: #ddd;
  }
  input[type="range"].big-thumb-vertical::-moz-range-thumb {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #9E0C24;
    border: 3px solid white;
    box-shadow: 0 0 4px rgba(0,0,0,0.4);
    cursor: pointer;
  }
`;

function HorizontalSlider() {
  const [value, setValue] = useState(50);

  return (
    <div style={{ width: 260, userSelect: "none" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 8 }}>
        <span style={{ color: "#333" }}>Horizontal</span>
        <strong style={{ color: "#9E0C24" }}>{value}</strong>
      </div>
      <input
        type="range"
        className="big-thumb"
        min={0}
        max={100}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        style={{ width: "100%", accentColor: "#9E0C24" }}
      />
    </div>
  );
}

function VerticalSlider() {
  const [value, setValue] = useState(50);

  return (
    <div
     id="SBXY"
      style={{
        width: 60,
        height: 180,
        userSelect: "none",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
      }}
    >
      <strong style={{ color: "#9E0C24", fontSize: 13 }}>{value}</strong>
      <input
        type="range"
        className="big-thumb-vertical" 
        min={0}
        max={100}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        style={{
          writingMode: "vertical-lr",
          direction: "rtl",
          width: 4, // 👈 más delgado (antes 6)
          height: "100%",
        }}
      />
      <span style={{ fontSize: 13, color: "#333" }}>Vertical</span>
    </div>
  );
}

export default function SliderBars() {
  return (
    <>
      <style>{sliderThumbStyles}</style>
      <div style={{ display: "flex", gap: 48, alignItems: "flex-start", fontFamily: "system-ui, sans-serif" }}>
        <HorizontalSlider />
        <VerticalSlider />
      </div>
    </>
  );
}
