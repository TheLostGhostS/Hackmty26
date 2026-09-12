import React, { useState, useRef, useCallback } from "react";

interface Size {
  width: number;
  height: number;
}

type Direction = "right" | "bottom" | "corner";



const ResizableBox: React.FC = () => {
  const [size, setSize] = useState<Size>({ width: 300, height: 200 });
  const containerRef = useRef<HTMLDivElement>(null);
  const startPos = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const MIN_WIDTH = 100;
  const MAX_WIDTH = 1400;
  const MIN_HEIGHT = 80;
  const MAX_HEIGHT = 800;

  const handleMouseDown = useCallback(
    (direction: Direction) => (e: React.MouseEvent) => {
      e.preventDefault();
      startPos.current = {
        x: e.clientX,
        y: e.clientY,
        width: size.width,
        height: size.height,
      };

      const onMouseMove = (moveEvent: MouseEvent) => {
        const dx = moveEvent.clientX - startPos.current.x;
        const dy = moveEvent.clientY - startPos.current.y;

        setSize((prev) => {
          let newWidth = prev.width;
          let newHeight = prev.height;

          if (direction === "right" || direction === "corner") {
            newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startPos.current.width + dx));
          }
          if (direction === "bottom" || direction === "corner") {
            newHeight = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, startPos.current.height + dy));
          }
          return { width: newWidth, height: newHeight };
        });
      };

      const onMouseUp = () => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    },
    [size]
  );

  return (
    <div
      ref={containerRef}
      style={{
        width: size.width,
        height: size.height,
        position: "relative",
        border: "2px solid #ff5e81",
        borderRadius: 8,
        background: "#eef2ff",
        userSelect: "none",
      }}
    >
      <div style={{ padding: 10 }}>Contenido del contenedor</div>

      {/* Handle derecho */}
      <div
        onMouseDown={handleMouseDown("right")}
        style={{
          position: "absolute",
          top: 0,
          right: -3,
          width: 6,
          height: "100%",
          cursor: "ew-resize",
        }}
      />

      {/* Handle inferior */}
      <div
        onMouseDown={handleMouseDown("bottom")}
        style={{
          position: "absolute",
          bottom: -3,
          left: 0,
          width: "100%",
          height: 6,
          cursor: "ns-resize",
        }}
      />

      {/* Handle esquina */}
      <div
        onMouseDown={handleMouseDown("corner")}
        style={{
          position: "absolute",
          bottom: -4,
          right: -4,
          width: 12,
          height: 12,
          cursor: "nwse-resize",
          background: "#4f46e5",
          borderRadius: "50%",
        }}
      />
    </div>
  );
};

export default ResizableBox;