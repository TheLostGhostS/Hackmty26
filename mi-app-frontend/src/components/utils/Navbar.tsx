import { useState } from "react";
import { Menu, X, ArrowRight } from "lucide-react";
import LoginMenu from "../../pages/Login";
import SingUpMenu from "../../pages/Singup";
import logo from "../../assets/Banorte_logo.svg"

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
          <img src={logo} alt="Logo" className="h-5 w-auto" />
          <span className="font-sans text-xl font-semibold tracking-tight">
            Banorte
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
          <LoginMenu />
          <SingUpMenu />
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
            <LoginMenu />
            <SingUpMenu />
          </div>
        </div>
      )}
    </header>
  );
}