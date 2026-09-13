import { useState, type FormEvent } from "react";
import { ArrowUp, Sparkles } from "lucide-react";
import logo from "../../assets/Banorte_logo.svg"

interface Props {
  onSend: (text: string) => void;
  variant?: "hero" | "dock";
  disabled: boolean;
}

export default function ChatInput({ onSend, variant = "hero", disabled=false }: Props) {
  const [value, setValue] = useState("");
  const isHero = variant === "hero";

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex mb-4 items-center gap-2 rounded-full border-2 bg-white transition-all ${
        isHero
          ? "border-ink/10 py-2 pl-6 pr-2 shadow-xl shadow-brick/10 focus-within:border-brick"
          : "border-ink/10 py-1.5 pl-5 pr-1.5 shadow-lg shadow-ink/5 focus-within:border-brick"
      }`}
    >
      <img src={logo} alt="Logo" className={`h-4 ${isHero ? "opacity-80" : "opacity-70 "} w-auto`} />

      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={isHero ? "Pide cualquier tipo de asistencia" : "SIgue el hilo del mensaje"}
        className={`min-w-0 flex-1 bg-transparent text-ink placeholder:text-ink/40 focus:outline-none ${
          isHero ? "text-base" : "text-sm"
        }`}
      />

      <button
        type="submit"
        disabled={!value.trim()}
        className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brick-bright to-brick text-white transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:from-ink/15 disabled:to-ink/15 disabled:hover:scale-100 ${
          isHero ? "h-11 w-11" : "h-9 w-9"
        }`}
        aria-label="Enviar mensaje"
      >
        <ArrowUp className={isHero ? "h-5 w-5" : "h-4 w-4"} strokeWidth={2.25} />
      </button>
    </form>
  );
}