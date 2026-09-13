import { Bot } from "lucide-react";

export default function TypingIndicator() {
  return (
    <div className="flex items-end gap-2.5 animate-rise">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-maroon text-white">
        <Bot className="h-4 w-4" strokeWidth={1.75} />
      </span>
      <div className="flex items-center gap-1 border border-ink/10 bg-white px-4 py-3">
        <span className="h-1.5 w-1.5 animate-bounce-dot rounded-full bg-ink/40" />
        <span
          className="h-1.5 w-1.5 animate-bounce-dot rounded-full bg-ink/40"
          style={{ animationDelay: "150ms" }}
        />
        <span
          className="h-1.5 w-1.5 animate-bounce-dot rounded-full bg-ink/40"
          style={{ animationDelay: "300ms" }}
        />
      </div>
    </div>
  );
}