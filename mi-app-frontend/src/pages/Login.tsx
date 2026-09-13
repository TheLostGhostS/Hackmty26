import { useEffect, useRef, useState } from "react";
import { LogIn, Eye, EyeOff } from "lucide-react";

export default function LoginMenu() {
  const [open, setOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [userFocused, setUserFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);
  const [menuTop, setMenuTop] = useState(0);

  const buttonRef = useRef<HTMLButtonElement>(null);

  const positionMenu = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuTop(rect.bottom + 8);
    }
  };

  useEffect(() => {
    if (!open) return;
    positionMenu();
    window.addEventListener("resize", positionMenu);
    window.addEventListener("scroll", positionMenu, true);
    return () => {
      window.removeEventListener("resize", positionMenu);
      window.removeEventListener("scroll", positionMenu, true);
    };
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim()) {
      setError("Ingresá tu usuario.");
      return;
    }
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    setLoading(true);
    try {
      // Este endpoint debe vivir en tu backend y ser el que
      // se conecte a la base de datos, nunca el frontend directo.
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "Usuario o contraseña incorrectos.");
      }

      const data = await res.json();
      console.log("Login exitoso:", data);
      setOpen(false);
    } catch (err: any) {
      setError(err.message || "Ocurrió un error al iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  const userFloated = userFocused || username.length > 0;
  const passFloated = passFocused || password.length > 0;

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-full px-2 py-1 text-sm font-medium text-ink/80 transition-colors hover:bg-ink/5 hover:text-ink"
      >
        <LogIn className="h-4 w-4" />
        Iniciar sesión
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          {/* En móvil: fixed, ancho completo, justo debajo del botón (medido con menuTop).
              Desde sm: vuelve a ser un panel flotante anclado a la derecha del botón. */}
          <div
            style={{ ["--menu-top" as any]: `${menuTop}px` }}
            className="fixed left-3 right-3 top-[var(--menu-top)] z-50 rounded-2xl border border-ink/10 bg-paper p-6 shadow-xl sm:!top-auto sm:absolute sm:left-auto sm:right-0 sm:mt-3 sm:w-80 sm:p-5"
          >
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="relative">
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onFocus={() => setUserFocused(true)}
                  onBlur={() => setUserFocused(false)}
                  className="peer w-full border-b-2 border-ink/15 bg-transparent pb-1.5 pt-4 text-sm text-ink outline-none transition-colors duration-300 focus:border-[#B8863B]"
                  autoComplete="username"
                />
                <label
                  htmlFor="username"
                  className={`pointer-events-none absolute left-0 transition-all duration-300 ease-out ${
                    userFloated
                      ? "-top-3 text-[11px] font-medium tracking-wide text-[#B8863B]"
                      : "top-3 text-sm text-ink/40"
                  }`}
                >
                  Usuario
                </label>
              </div>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPassFocused(true)}
                  onBlur={() => setPassFocused(false)}
                  className="peer w-full border-b-2 border-ink/15 bg-transparent pb-1.5 pr-8 pt-4 text-sm text-ink outline-none transition-colors duration-300 focus:border-[#3B6E64]"
                  autoComplete="current-password"
                />
                <label
                  htmlFor="password"
                  className={`pointer-events-none absolute left-0 transition-all duration-300 ease-out ${
                    passFloated
                      ? "-top-3 text-[11px] font-medium tracking-wide text-[#3B6E64]"
                      : "top-3 text-sm text-ink/40"
                  }`}
                >
                  Contraseña
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-ink/40 transition-colors hover:text-ink"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {error && <p className="text-xs text-brick">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="mt-1 flex items-center justify-center gap-1.5 rounded-xl bg-brick px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brick-dark disabled:opacity-60"
              >
                {loading ? "Ingresando..." : "Ingresar"}
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}