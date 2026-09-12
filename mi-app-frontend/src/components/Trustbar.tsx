const stats = [
  { value: "3.2M", label: "clientes activos" },
  { value: "11,400", label: "cajeros sin costo" },
  { value: "4.8/5", label: "calificación en App Store" },
];

export default function TrustBar() {
  return (
    <section className="border-y border-ink/10 bg-ink text-paper">
      <div className="mx-auto grid max-w-6xl grid-cols-1 divide-y divide-white/10 px-6 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col items-start gap-1 py-8 sm:px-8 sm:first:pl-0">
            <span className="font-display text-3xl font-semibold">{s.value}</span>
            <span className="text-sm text-paper/60">{s.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}