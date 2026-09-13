import { Bot, User } from "lucide-react";

export interface Message {
  id: string;
  role: "bot" | "user";
  text: string;
  time: string;
}

interface Props {
  message: Message;
  animateDelayMs?: number;
}

export default function MessageBubble({ message, animateDelayMs }: Props) {
  const isBot = message.role === "bot";

  return (
    <div
      className={`flex items-end gap-2.5 animate-rise ${
        isBot ? "justify-start" : "justify-end"
      }`}
      style={animateDelayMs ? { animationDelay: `${animateDelayMs}ms` } : undefined}
    >
      {isBot && (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-maroon text-white">
          <Bot className="h-4 w-4" strokeWidth={1.75} />
        </span>
      )}

      <div
        className={`max-w-[75%] px-4 py-2.5 text-sm leading-relaxed ${
          isBot
            ? "border border-ink/10 bg-white text-ink"
            : "bg-brick text-white"
        }`}
      >
        <p>{message.text}</p>
        <span
          className={`mt-1 block font-mono text-[10px] ${
            isBot ? "text-ink/40" : "text-white/70"
          }`}
        >
          {message.time}
        </span>
      </div>

      {!isBot && (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink/10 text-ink">
          <User className="h-4 w-4" strokeWidth={1.75} />
        </span>
      )}
    </div>
  );
}