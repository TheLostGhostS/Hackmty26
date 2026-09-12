import { Fingerprint, Lock, ShieldCheck, Bell } from "lucide-react";

const items = [
  {
    icon: Fingerprint,
    title: "Acceso biométrico",
    copy: "Entra con huella o Face ID. Nada de contraseñas que se te olviden.",
  },
  {
    icon: Lock,
    title: "Cifrado de extremo a extremo",
    copy: "Cada movimiento viaja cifrado, igual que en la banca tradicional.",
  },
  {
    icon: ShieldCheck,
    title: "Monitoreo antifraude 24/7",
    copy: "Detectamos movimientos raros y te avisamos antes de que actúes.",
  },
  {
    icon: Bell,
    title: "Alertas en tiempo real",
    copy: "Un cargo, un depósito, una transferencia: te enteras al instante.",
  },
];

export default function Security() {
  return (
    <section id="seguridad" className="bg-maroon text-paper">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <div className="max-w-lg">
          <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
            Seguridad que no se nota, hasta que la necesitas
          </h2>
          <p className="mt-4 text-paper/70">
            Construimos Rubí como si fuera nuestro propio dinero. Estas son
            las capas que lo protegen.
          </p>
        </div>

        <div className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2">
          {items.map(({ icon: Icon, title, copy }) => (
            <div key={title} className="flex gap-4">
              <Icon className="h-6 w-6 shrink-0 text-gold" strokeWidth={1.5} />
              <div>
                <h3 className="font-display text-lg font-semibold">{title}</h3>
                <p className="mt-1.5 text-sm text-paper/65">{copy}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}