import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ChatWindow from "../components/chat/Chatwindow";

export default function ChatPage() {
  return (
    <div className="flex min-h-screen flex-col bg-sand">
      <Navbar />

      <main className="flex-1 px-4 md:py-14">
        <div className="mx-auto mb-6 max-w-3xl text-center">
          <h1 className="animate-rise font-display text-2xl font-semibold tracking-tight text-ink md:text-3xl">
            Pregúntale a nuestro agente!
          </h1>
        </div>

        <ChatWindow />
      </main>

      <Footer />
    </div>
  );
}