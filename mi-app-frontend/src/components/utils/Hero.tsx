import { ArrowRight, Wifi } from "lucide-react";

export default function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-20 pt-14 md:pb-28 md:pt-20">
      <div className="grid items-center gap-14 md:grid-cols-[1.1fr_0.9fr]">
        <div>
          <h1 className="font-display text-[2.75rem] font-semibold leading-[1.05] tracking-tight text-ink md:text-6xl">
            Tu dinero se mueve
            <br />
            a tu ritmo.
          </h1>
          <p className="mt-6 max-w-md text-lg text-ink/70">
            Cuenta digital sin comisiones de manejo, tarjeta física en 48
            horas y transferencias que llegan mientras sigues escribiendo.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <a
              href="#abrir-cuenta"
              className="group flex items-center gap-2 bg-brick px-6 py-3.5 text-sm font-medium text-white transition-colors hover:bg-brick-dark"
            >
              Abrir cuenta gratis
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href="#productos"
              className="px-6 py-3.5 text-sm font-medium text-ink/80 underline decoration-ink/30 underline-offset-4 hover:text-ink"
            >
              Ver tarjetas y cuentas
            </a>
          </div>

          <p className="mt-8 text-xs text-ink/50">
            Depósitos protegidos hasta por 400,000 UDI conforme al IPAB.
          </p>
        </div>

        <div className="relative flex justify-center md:justify-end">
          <div className="absolute -inset-x-6 -inset-y-8 -z-10 bg-sand md:-inset-x-10" />

          <div className="w-full max-w-sm -rotate-4 rounded-xl border border-ink/10 bg-gradient-to-br from-brick to-maroon p-6 text-white shadow-xl transition-transform hover:rotate-4">
            <div className="flex items-start justify-between">
              <span className="font-display text-sm font-medium tracking-wide">
                Rubí
              </span>
              <Wifi className="h-5 w-5 rotate-90 opacity-80" />
            </div>

            <div className="mt-10 h-8 w-11 rounded-sm bg-gold/90" />

            <p className="mt-8 font-mono text-lg tracking-widest">
              4231 •••• •••• 8890
            </p>

            <div className="mt-6 flex items-end justify-between">
              <div>
                <p className="text-[11px] text-white/60">Titular</p>
                <p className="text-sm">Camila Reyes</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-white/60">Vence</p>
                <p className="font-mono text-sm">09/30</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}