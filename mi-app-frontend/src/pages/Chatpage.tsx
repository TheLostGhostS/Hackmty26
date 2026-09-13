import { useState } from "react";
import Navbar from "../components/utils/Navbar";
import Footer from "../components/utils/Footer";
import ChatInput from "../components/utils/Chaininput";
import QuickReplies from "../components/utils/Quickreplies";
import { A2UISurfaceList, useA2UI } from "../components/a2ui";

const suggestions = ["Ver mi saldo", "Reportar mi tarjeta", "Hablar con alguien"];

export default function ChatPage() {
  const [started, setStarted] = useState(false);
  const {
    state,
    loading,
    error,
    sendMessage,
    invokeAction,
    updateDataModel,
  } = useA2UI({ endpoint: "/api/chat" });

  const handleSend = async (text: string) => {
    const message = text.trim();
    if (!message || loading) return;

    // El mismo ChatInput permanece montado; sólo cambia el reparto del flex.
    setStarted(true);

    try {
      await sendMessage(message);
    } catch {
      // useA2UI ya expone el error para mostrarlo en pantalla.
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <Navbar />

      <main className="relative flex flex-1 flex-col">
        {/* Surface area: aparece al encogerse el hero del chat. */}
        <div
          className={`relative min-h-0 overflow-y-auto transition-[flex-grow] duration-700 ease-in-out ${
            started ? "grow" : "grow-0"
          }`}
        >
          {started && (
            <div className="mx-auto w-full max-w-5xl px-4 py-6">
              {loading && state.order.length === 0 && (
                <div className="animate-pulse rounded-3xl border border-ink/10 bg-white/50 p-6 text-sm text-ink/50">
                  Se esta preparando la interfaz...
                </div>
              )}

              {error && (
                <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {error}
                </div>
              )}

              <A2UISurfaceList
                state={state}
                disabled={loading}
                onDataChange={updateDataModel}
                onAction={(invocation) => {
                  void invokeAction(invocation).catch(() => undefined);
                }}
              />
            </div>
          )}
        </div>

        {/* Sticky desde el primer render: no hay salto static -> sticky. */}
        <div
          className={`sticky bottom-0 z-20 flex shrink-0 transition-all duration-700 ease-in-out ${
            started
              ? "grow-0 items-end bg-paper/95 px-4 py-4 backdrop-blur"
              : "grow items-center justify-center overflow-hidden px-4 py-8"
          }`}
        >
          <div className="relative flex w-full items-center justify-center">
            {!started && (
              <>
                <span className="pointer-events-none absolute -top-28 left-[15%] h-56 w-56 animate-float rounded-full bg-blush blur-3xl" />
                <span
                  className="pointer-events-none absolute -bottom-28 right-[15%] h-64 w-64 animate-float rounded-full bg-sunny/30 blur-3xl"
                  style={{ animationDelay: "1.4s" }}
                />
              </>
            )}

            <div className="relative w-full max-w-xl text-center">
              {!started && (
                <>
                  <h1
                    className="animate-rise mt-3 font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl"
                    style={{ animationDelay: "70ms" }}
                  >
                    ¿En qué te ayudamos hoy?
                  </h1>

                  <p
                    className="animate-rise mt-2 text-ink/60"
                    style={{ animationDelay: "140ms" }}
                  >
                    Pregúnta por tu saldo, tus tarjetas o lo que se te ocurra.
                  </p>
                </>
              )}

              <div
                className={started ? "w-full" : "animate-rise mt-8"}
                style={!started ? { animationDelay: "210ms" } : undefined}
              >
                <ChatInput onSend={handleSend} disabled={false} variant={started ? "dock" : "hero"} />
              </div>

              {!started && (
                <div className="mt-5">
                  <QuickReplies
                    suggestions={suggestions}
                    onPick={handleSend}
                    baseDelayMs={280}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}