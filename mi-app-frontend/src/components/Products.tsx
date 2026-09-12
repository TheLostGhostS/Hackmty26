import { Wallet, CreditCard, PiggyBank, TrendingUp, ArrowUpRight } from "lucide-react";

const smallProducts = [
  {
    icon: CreditCard,
    title: "Tarjeta de crédito",
    copy: "Sin anualidad el primer año y hasta 2 meses sin intereses en tiendas participantes.",
  },
  {
    icon: PiggyBank,
    title: "Ahorro programado",
    copy: "Aparta dinero automáticamente cada quincena y míralo crecer con 9% anual.",
  },
  {
    icon: TrendingUp,
    title: "Inversión digital",
    copy: "Desde $500 pesos, retira cuando quieras sin penalización.",
  },
];

export default function Products() {
  return (
    <section id="productos" className="mx-auto max-w-6xl px-6 py-20 md:py-28">
      <div className="max-w-lg">
        <h2 className="font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">
          Un producto para cada momento
        </h2>
        <p className="mt-4 text-ink/70">
          Nada de letras chiquitas. Cada cuenta y tarjeta te dice exactamente
          qué cuesta y qué gana.
        </p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-[1.2fr_1fr]">
        <div className="flex flex-col justify-between border border-ink/10 bg-white p-8 md:p-10">
          <div>
            <Wallet className="h-8 w-8 text-brick" strokeWidth={1.5} />
            <h3 className="mt-6 font-display text-2xl font-semibold text-ink">
              Cuenta Rubí
            </h3>
            <p className="mt-3 max-w-sm text-ink/70">
              Tu cuenta del día a día: sin comisión de manejo, transferencias
              SPEI ilimitadas y retiros gratis en más de 11 mil cajeros.
            </p>
          </div>

          <div className="mt-10 flex items-center justify-between border-t border-ink/10 pt-6">
            <div>
              <p className="text-xs text-ink/50">Rendimiento anual</p>
              <p className="font-mono text-2xl text-forest">6.5%</p>
            </div>
            <a
              href="#abrir-cuenta"
              className="group flex items-center gap-1 text-sm font-medium text-ink hover:text-brick"
            >
              Conocer más
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>
        </div>

        <div className="grid gap-6">
          {smallProducts.map(({ icon: Icon, title, copy }) => (
            <div
              key={title}
              className="border border-ink/10 bg-white p-6 transition-colors hover:border-brick/40"
            >
              <Icon className="h-6 w-6 text-brick" strokeWidth={1.5} />
              <h4 className="mt-4 font-display text-lg font-semibold text-ink">
                {title}
              </h4>
              <p className="mt-2 text-sm text-ink/65">{copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}