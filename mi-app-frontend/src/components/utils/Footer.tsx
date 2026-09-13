const columns = [
  {
    title: "Productos",
    links: ["Cuenta digital", "Tarjeta de crédito", "Ahorro", "Inversión"],
  },
  {
    title: "Ayuda",
    links: ["Centro de soporte", "Sucursales y cajeros", "Reportar fraude"],
  },
  {
    title: "Rubí",
    links: ["Nosotros", "Trabaja con nosotros", "Prensa"],
  },
];

export default function Footer() {
  return (
    <footer className="bg-ink text-paper/70">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 sm:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-brick" />
              <span className="font-display text-lg font-semibold text-paper">
                Rubí
              </span>
            </div>
            <p className="mt-3 max-w-xs text-sm">
              Institución de banca múltiple. Operaciones sujetas a la Ley de
              Instituciones de Crédito.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-medium text-paper">{col.title}</h4>
              <ul className="mt-4 space-y-2.5 text-sm">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="hover:text-paper">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Rubí Banco. Todos los derechos reservados.</p>
          <p>IPAB · CONDUSEF · Aviso de privacidad</p>
        </div>
      </div>
    </footer>
  );
}