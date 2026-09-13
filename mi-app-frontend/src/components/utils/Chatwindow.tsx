import { useRef, useState, useEffect } from "react";
import { Bot, ShieldCheck } from "lucide-react";
import MessageBubble, { type Message } from "./Messagebubble";
import TypingIndicator from "./Typingindicator";
import QuickReplies from "./Quickreplies";
import ChatInput from "./Chaininput";

const initialMessages: Message[] = [
  {
    id: "welcome-1",
    role: "bot",
    text: "Puedo ayudarte con tu saldo, movimientos, tarjetas o conectarte con un asesor.",
    time: "09:41",
  },
  {
    id: "welcome-2",
    role: "bot",
    text: "¿En qué te ayudo hoy?",
    time: "09:41",
  },
];

const suggestions = [
  "Ver mi saldo",
  "Reportar mi tarjeta",
  "Hablar con un asesor",
];

const fakeReplies = [
  "Claro, dame un segundo mientras reviso eso en tu cuenta.",
  "Ya casi. Para continuar, ¿me confirmas tu número de cuenta o los últimos 4 dígitos de tu tarjeta?",
  "Con gusto. Si prefieres, también puedo pasarte con un asesor humano en cualquier momento.",
];

export default function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = (text: string) => {
    setShowSuggestions(false);
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      text,
      time: new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      const reply = fakeReplies[Math.floor(Math.random() * fakeReplies.length)];
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "bot",
          text: reply,
          time: new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      setIsTyping(false);
    }, 1100);
  };

  return (
    <div className="mx-auto flex h-[75vh] max-w-3xl flex-col border border-ink/10 bg-paper shadow-sm">
      <div className="flex items-center gap-3 border-b border-ink/10 bg-white px-5 py-4">
        <span className="flex h-10 w-10 animate-pop items-center justify-center rounded-full bg-brick text-white">
          <Bot className="h-5 w-5" strokeWidth={1.75} />
        </span>
        <div>
          <p className="font-display text-sm font-semibold text-ink">Agente Inteligente</p>
          <p className="flex items-center gap-1 text-xs text-forest">
            <span className="h-1.5 w-1.5 rounded-full bg-forest" />
            En línea
          </p>
        </div>
        <span className="ml-auto flex items-center gap-1.5 text-xs text-ink/40">
          <ShieldCheck className="h-3.5 w-3.5" />
          Conversación cifrada
        </span>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-6">
        {messages.map((m, i) => (
          <MessageBubble key={m.id} message={m} animateDelayMs={i < 2 ? i * 150 : 0} />
        ))}

        {showSuggestions && (
          <QuickReplies suggestions={suggestions} onPick={handleSend} baseDelayMs={300} />
        )}

        {isTyping && <TypingIndicator />}
      </div>

      <ChatInput onSend={handleSend} disabled={isTyping} />
    </div>
  );
}