<<<<<<< HEAD
<<<<<<< HEAD
import logo from "../../assets/Banorte_logo.svg"

=======
>>>>>>> 561abc0 (A2UI functional in theory)
=======
import logo from "../../assets/Banorte_logo.svg"

>>>>>>> 858b780 (Banorte logo and likeness)
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
<<<<<<< HEAD
<<<<<<< HEAD
    title: "Banorte",
=======
    title: "Rubí",
>>>>>>> 561abc0 (A2UI functional in theory)
=======
    title: "Banorte",
>>>>>>> 858b780 (Banorte logo and likeness)
    links: ["Nosotros", "Trabaja con nosotros", "Prensa"],
  },
];

export default function Footer() {
  return (
<<<<<<< HEAD
<<<<<<< HEAD
    <footer className="bg-ink text-paper/70 ">
=======
    <footer className="bg-ink text-paper/70">
>>>>>>> 561abc0 (A2UI functional in theory)
=======
    <footer className="bg-ink text-paper/70 ">
>>>>>>> 858b780 (Banorte logo and likeness)
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 sm:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2">
<<<<<<< HEAD
<<<<<<< HEAD
              <img src={logo} alt="Logo" className="h-4 w-auto" />
              <span className="font-sans text-lg font-semibold text-paper">
                Banorte
=======
              <span className="h-3 w-3 rounded-full bg-brick" />
              <span className="font-display text-lg font-semibold text-paper">
                Rubí
>>>>>>> 561abc0 (A2UI functional in theory)
=======
              <img src={logo} alt="Logo" className="h-4 w-auto" />
              <span className="font-sans text-lg font-semibold text-paper">
                Banorte
>>>>>>> 858b780 (Banorte logo and likeness)
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
<<<<<<< HEAD
<<<<<<< HEAD
          <p>© {new Date().getFullYear()} Grupo Financiero Banorte</p>
=======
          <p>© {new Date().getFullYear()} Rubí Banco. Todos los derechos reservados.</p>
          <p>IPAB · CONDUSEF · Aviso de privacidad</p>
>>>>>>> 561abc0 (A2UI functional in theory)
=======
          <p>© {new Date().getFullYear()} Grupo Financiero Banorte</p>
>>>>>>> 858b780 (Banorte logo and likeness)
        </div>
      </div>
    </footer>
  );
}