import { useState, type FormEvent } from "react";
import { Paperclip, Send } from "lucide-react";

interface Props {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: Props) {
  const [value, setValue] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 border-t border-ink/10 bg-white p-3"
    >
      <button
        type="button"
        className="hidden shrink-0 items-center justify-center rounded-full p-2 text-ink/40 hover:bg-sand hover:text-ink sm:flex"
        aria-label="Adjuntar archivo"
      >
        <Paperclip className="h-4.5 w-4.5" strokeWidth={1.75} />
      </button>

      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Escribe tu pregunta, por ejemplo: ¿cuál es mi saldo?"
        className="min-w-0 flex-1 rounded-full border border-ink/15 bg-paper px-4 py-2.5 text-sm text-ink placeholder:text-ink/40 focus:border-brick focus:outline-none"
      />

      <button
        type="submit"
        disabled={!value.trim() || disabled}
        className="flex shrink-0 items-center justify-center rounded-full bg-brick p-2.5 text-white transition-colors hover:bg-brick-dark disabled:cursor-not-allowed disabled:bg-ink/15"
        aria-label="Enviar mensaje"
      >
        <Send className="h-4.5 w-4.5" strokeWidth={1.75} />
      </button>
    </form>
  );
}