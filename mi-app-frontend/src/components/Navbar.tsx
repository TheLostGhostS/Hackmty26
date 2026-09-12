import { useState } from "react";
import { Menu, X, ArrowRight } from "lucide-react";

const links = [
  { label: "Cuentas", href: "#productos" },
  { label: "Tarjetas", href: "#productos" },
  { label: "Seguridad", href: "#seguridad" },
  { label: "Sucursales", href: "#" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-paper/90 backdrop-blur border-b border-ink/10">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="#" className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-brick" />
          <span className="font-display text-xl font-semibold tracking-tight">
            Rubí
          </span>
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm text-ink/70 transition-colors hover:text-ink"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <a
            href="#"
            className="text-sm font-medium text-ink/80 hover:text-ink"
          >
            Iniciar sesión
          </a>
          <a
            href="#abrir-cuenta"
            className="group flex items-center gap-1.5 rounded-none bg-brick px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brick-dark"
          >
            Abrir cuenta
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="md:hidden"
          aria-label="Abrir menú"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-ink/10 px-6 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            {links.map((link) => (
              <a key={link.label} href={link.href} className="text-sm text-ink/80">
                {link.label}
              </a>
            ))}
            <a
              href="#abrir-cuenta"
              className="mt-2 inline-flex items-center justify-center gap-1.5 bg-brick px-4 py-2.5 text-sm font-medium text-white"
            >
              Abrir cuenta
            </a>
          </div>
        </div>
      )}
    </header>
  );
}