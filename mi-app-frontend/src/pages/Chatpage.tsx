import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ChatInput from "../components/Chaininput";
import QuickReplies from "../components/Quickreplies";

const suggestions = ["Ver mi saldo 💸", "Reportar mi tarjeta 💳", "Hablar con alguien 🙋"];

export default function ChatPage() {
  const [started, setStarted] = useState(false);

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    setStarted(true);
    // TODO: aquí conectas tu API/modelo real y empiezas a pintar mensajes.
  };

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <Navbar />

      <main className="relative flex flex-1 flex-col">

        <div
          className={`relative transition-all duration-700 ease-in-out ${started ? "grow" : "grow-0"
            }`}
        >
          {started && (
            <div className="mx-auto transition-all duration-700 ease-in-out w-full max-w-5xl px-4 py-6">
              {/* Contenido futuro entre el navbar y el chat */}
            </div>
          )}
        </div>

        <div
          className={`sticky grow-0  bottom-0 z-20 flex shrink-0 transition-all duration-700 ease-in-out ${started
              ? "items-end bg-paper/95 px-4 py-4 backdrop-blur"
              : "items-center justify-center overflow-hidden px-4 py-8"
            }`}
        >

          <div className="relative flex w-full items-center justify-center">
            {/*!started && (
              <>
                <span className="pointer-events-none absolute -top-28 left-[15%] h-56 w-56 animate-float rounded-full bg-blush blur-3xl" />
                <span
                  className="pointer-events-none absolute -bottom-28 right-[15%] h-64 w-64 animate-float rounded-full bg-sunny/30 blur-3xl"
                  style={{ animationDelay: "1.4s" }}
                />
              </>
            )*/}

            <div className="relative w-full max-w-xl text-center">
              {!started && (
                <>
                  <h1
                    className="animate-rise mt-3 font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl"
                    style={{ animationDelay: "70ms" }}
                  >
                    ¿En qué te ayudamos hoy?
                  </h1>
                </>
              )}

              <div
                className={`${started ? "w-full" : "animate-rise mt-8"}`}
                style={!started ? { animationDelay: "210ms" } : undefined}
              >
                <ChatInput onSend={handleSend} variant={started ? "dock" : "hero"} disabled={false} />
              </div>

              {/*!started && (
                <div className="mt-5">
                  <QuickReplies
                    suggestions={suggestions}
                    onPick={handleSend}
                    baseDelayMs={280}
                  />
                </div>
              )*/}
            </div>


          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
