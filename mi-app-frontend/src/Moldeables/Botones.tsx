import React,{ useState, useRef, useCallback  } from "react";

interface McpResponse {
  resumen: string;
  categoria?: "positivo" | "neutral" | "negativo";
}

type EstadoMcp = "idle" | "loading" | "success" | "error";

interface McpButtonProps {
  onEjecutar: () => Promise<McpResponse>;
}

export default function BotonMold({ onEjecutar }: McpButtonProps) {
  const [estado, setEstado] = useState<EstadoMcp>("idle");
  const [data, setData] = useState<McpResponse | null>(null);

  const handleClick = async () => {
    setEstado("loading");
    setData(null);
    try {
      const resultado = await onEjecutar();
      setData(resultado);
      setEstado("success");
    } catch (err) {
      console.error(err);
      setEstado("error");
    }
  };

  // Mapeo de estilos según el estado
  const estilosPorEstado: Record<EstadoMcp, string> = {
    idle: "bg-gray-200 text-gray-800 hover:bg-gray-300",
    loading: "bg-yellow-300 text-yellow-900 animate-pulse cursor-wait",
    success: "bg-green-500 text-white",
    error: "bg-red-500 text-white",
  };

  // Estilo adicional si la respuesta trae una "categoría"
  const estilosPorCategoria: Record<string, string> = {
    positivo: "bg-green-600",
    neutral: "bg-blue-500",
    negativo: "bg-red-600",
  };

  const claseFinal =
    estado === "success" && data?.categoria
      ? `${estilosPorCategoria[data.categoria]} text-white`
      : estilosPorEstado[estado];

  const textoBoton = () => {
    switch (estado) {
      case "loading":
        return "Consultando...";
      case "success":
        return `✓ ${data?.resumen ?? "Listo"}`;
      case "error":
        return "✕ Error, reintentar";
      default:
        return "Ejecutar";
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={estado === "loading"}
      className={`px-4 py-2 rounded transition-colors duration-300 font-medium ${claseFinal}`}
    >
      {textoBoton()}
    </button>
  );


}