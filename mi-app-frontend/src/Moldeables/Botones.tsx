import { useRef, useCallback, useState } from "react";

type EstadoMcp = "idle" | "loading" | "success" | "error";

interface McpResponse {
  resumen: string;
  categoria?: "positivo" | "neutral" | "negativo";
}

interface McpButtonProps {
  onEjecutar: () => Promise<McpResponse>;
}

const CLASES_BASE =
  "px-4 py-2 rounded font-medium transition-colors duration-300";

const CLASES_POR_ESTADO: Record<EstadoMcp, string> = {
  idle: "bg-gray-200 text-gray-800 hover:bg-gray-300",
  loading: "bg-yellow-300 text-yellow-900 animate-pulse cursor-wait",
  success: "bg-green-500 text-white",
  error: "bg-red-500 text-white",
};

const CLASES_POR_CATEGORIA: Record<string, string> = {
  positivo: "bg-green-600 text-white",
  neutral: "bg-blue-500 text-white",
  negativo: "bg-red-600 text-white",
};

export default function BotonMold({ onEjecutar }: McpButtonProps) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Solo usamos estado para el texto (necesita re-render);
  // el estilo se aplica de forma imperativa vía ref.
  const [texto, setTexto] = useState("Ejecutar");

  const aplicarEstilo = useCallback((estado: EstadoMcp, categoria?: string) => {
    const btn = btnRef.current;
    if (!btn) return;

    const clasesEstado =
      estado === "success" && categoria
        ? CLASES_POR_CATEGORIA[categoria]
        : CLASES_POR_ESTADO[estado];

    btn.className = `${CLASES_BASE} ${clasesEstado}`;
  }, []);

  const handleClick = useCallback(async () => {
    // Cancela una llamada anterior si sigue en curso
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    aplicarEstilo("loading");
    setTexto("Consultando...");

    try {
      const resultado = await onEjecutar();
      if (controller.signal.aborted) return;

      aplicarEstilo("success", resultado.categoria);
      setTexto(`✓ ${resultado.resumen}`);
    } catch (err) {
      if (controller.signal.aborted) return;
      console.error(err);
      aplicarEstilo("error");
      setTexto("✕ Error, reintentar");
    }
  }, [onEjecutar, aplicarEstilo]);

  return (
    <button ref={btnRef} onClick={handleClick} className={`${CLASES_BASE} ${CLASES_POR_ESTADO.idle}`}>
      {texto}
    </button>
  );
}