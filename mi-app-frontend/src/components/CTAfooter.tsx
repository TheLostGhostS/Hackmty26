import { ArrowRight, Smartphone } from "lucide-react";

export default function CTAFooter() {
  return (
    <section id="abrir-cuenta" className="bg-brick">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 px-6 py-16 md:flex-row md:items-center md:py-20">
        <div className="max-w-md text-white">
          <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
            Abre tu cuenta en menos de 5 minutos
          </h2>
          <p className="mt-3 text-white/80">
            Solo necesitas tu identificación y tu teléfono. Tu tarjeta llega a
            casa en 48 horas.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <a
            href="#"
            className="group flex items-center justify-center gap-2 bg-ink px-6 py-3.5 text-sm font-medium text-white transition-colors hover:bg-ink/85"
          >
            <Smartphone className="h-4 w-4" />
            Descargar la app
          </a>
          <a
            href="#"
            className="group flex items-center justify-center gap-2 bg-white px-6 py-3.5 text-sm font-medium text-brick transition-colors hover:bg-paper"
          >
            Abrir en la web
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>
      </div>
    </section>
  );
}